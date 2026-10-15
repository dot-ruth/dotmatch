import os
import secrets
from collections import Counter

from fastapi import APIRouter, Depends, File, Header, HTTPException, Query, Request, UploadFile

from models.schemas import (
    CoverLetterRequest,
    CoverLetterResponse,
    DiscoverResult,
    Job,
    JobSourceCount,
    MatchedJob,
    PaginatedJobs,
    ResumeProfile,
)
from services.cover_letter import build_cover_letter
from services.job_discovery import discover_all_jobs
from services.job_store import is_worldwide, job_store
from services.rate_limit import RateLimiter
from services.resume_service import (
    MAX_RESUME_BYTES,
    SUPPORTED_RESUME_EXTENSIONS,
    calculate_match_score,
    extract_resume_text,
    parse_resume_text,
)

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

_DISCOVER_LIMITER = RateLimiter(max_calls=5, window_seconds=600)
_LOOPBACK_HOSTS = ("127.0.0.1", "::1")


def _authorize_discover(
    request: Request,
    x_discover_token: str | None = Header(default=None, alias="X-Discover-Token"),
) -> None:
    """Gate discovery behind a shared secret when configured, plus a per-client rate limit."""
    if not _DISCOVER_LIMITER.check(request.client.host if request.client else "unknown"):
        raise HTTPException(status_code=429, detail="Discovery rate limit reached. Try again in 10 minutes.")

    token = os.environ.get("DOTMATCH_DISCOVER_TOKEN", "").strip()
    if token:
        if not x_discover_token or not secrets.compare_digest(x_discover_token, token):
            raise HTTPException(status_code=401, detail="Missing or invalid X-Discover-Token header")
    elif (request.client.host if request.client else "") not in _LOOPBACK_HOSTS:
        raise HTTPException(
            status_code=403,
            detail="Discovery is local-only. Set DOTMATCH_DISCOVER_TOKEN to allow remote runs.",
        )


@router.get("/", response_model=PaginatedJobs)
async def list_jobs(
    remote_only: bool | None = Query(default=None, description="Filter remote jobs only"),
    worldwide_only: bool | None = Query(default=None, description="Filter jobs open worldwide (work from Ethiopia)"),
    search_query: str | None = Query(default=None, description="Search by title, company, or skills"),
    hide_applied: bool | None = Query(default=None, description="Exclude jobs already marked as applied"),
    applied_only: bool | None = Query(default=None, description="Return only jobs marked as applied"),
    offset: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
):
    """List and filter jobs."""
    items, total = job_store.search(
        remote_only=remote_only,
        worldwide_only=worldwide_only,
        search_query=search_query,
        hide_applied=hide_applied,
        applied_only=applied_only,
        offset=offset,
        limit=limit,
    )
    return PaginatedJobs(
        items=[Job(**j) for j in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/matched", response_model=list[MatchedJob])
async def list_matched_jobs(
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
    offset: int = Query(default=0, ge=0, description="Number of records to skip"),
    worldwide_only: bool | None = Query(default=None, description="Filter jobs open worldwide"),
):
    """List jobs matched against uploaded resume, sorted by match score."""
    resume = job_store.get_resume()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded. Upload a resume first.")

    matched = []
    for job in job_store.get_all():
        if worldwide_only and not is_worldwide(job):
            continue
        score, matched_skills = calculate_match_score(job, resume)
        if score > 0:
            matched.append(
                MatchedJob(
                    job=Job(**job),
                    match_score=score,
                    matched_skills=matched_skills,
                )
            )

    matched.sort(key=lambda m: m.match_score, reverse=True)
    return matched[offset : offset + limit]


@router.get("/sources", response_model=list[JobSourceCount])
async def get_source_counts():
    """Return the number of stored jobs from each source."""
    counts = Counter(job.get("source_type") or "unknown" for job in job_store.get_all())
    return [
        JobSourceCount(source_type=source_type, job_count=job_count)
        for source_type, job_count in sorted(counts.items())
    ]


@router.get("/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get a job by ID."""
    job = job_store.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)


@router.post("/{job_id}/apply", response_model=Job)
async def mark_job_applied(job_id: str):
    """Mark a job as applied to (idempotent)."""
    job = job_store.set_applied(job_id, applied=True)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)


@router.delete("/{job_id}/apply", response_model=Job)
async def unmark_job_applied(job_id: str):
    """Clear the applied flag on a job (idempotent)."""
    job = job_store.set_applied(job_id, applied=False)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)


@router.post("/cover-letter", response_model=CoverLetterResponse)
async def draft_cover_letter(payload: CoverLetterRequest):
    """Draft a cover letter for a job (looked up by id or application URL).

    The draft is built from the stored resume plus the requirement bullets the
    client already extracted from the posting description.
    """
    if payload.job_id:
        job = job_store.get_by_id(payload.job_id)
    else:
        job = job_store.find_by_url(payload.url or "")
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    resume = job_store.get_resume()
    if not resume:
        raise HTTPException(status_code=400, detail="Upload a resume first")

    text, matched = build_cover_letter(
        job,
        resume,
        name=payload.name,
        requirements=payload.requirements,
    )
    return CoverLetterResponse(text=text, job_id=job["id"], matched_skills=matched)


@router.post("/discover", response_model=DiscoverResult, dependencies=[Depends(_authorize_discover)])
async def discover_jobs():
    """Trigger job discovery from all sources."""
    result = await discover_all_jobs()
    return DiscoverResult(
        message="Job discovery completed",
        new_jobs=result["new_jobs"],
        sources_checked=result["sources_checked"],
        errors=result["errors"],
    )


@router.post("/resume", response_model=ResumeProfile)
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse a resume file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in SUPPORTED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and text files are supported")

    content = await file.read()
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    try:
        text = extract_resume_text(ext, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    parsed = parse_resume_text(text)
    resume = job_store.store_resume(
        filename=file.filename,
        raw_text=text[:5000],
        **parsed,
    )
    return resume


@router.get("/resume/profile", response_model=ResumeProfile | None)
async def get_resume_profile():
    """Get the current resume profile."""
    return job_store.get_resume()
