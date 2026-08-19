import io
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, UploadFile, File

from models.schemas import Job, PaginatedJobs, DiscoverResult, ResumeProfile, MatchedJob
from services.job_store import job_store
from services.job_discovery import discover_all_jobs
from services.resume_service import parse_resume_text, calculate_match_score

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/", response_model=PaginatedJobs)
async def list_jobs(
    remote_only: bool | None = Query(default=None, description="Filter remote jobs only"),
    worldwide_only: bool | None = Query(default=None, description="Filter jobs open worldwide (work from Ethiopia)"),
    search_query: str | None = Query(default=None, description="Search by title, company, or skills"),
    offset: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
):
    """List and filter jobs."""
    items, total = job_store.search(
        remote_only=remote_only,
        worldwide_only=worldwide_only,
        search_query=search_query,
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
    worldwide_only: bool | None = Query(default=None, description="Filter jobs open worldwide"),
):
    """List jobs matched against uploaded resume, sorted by match score."""
    resume = job_store.get_resume()
    if not resume:
        raise HTTPException(status_code=404, detail="No resume uploaded. Upload a resume first.")

    all_jobs = job_store.get_all()
    matched = []
    for job in all_jobs:
        score, matched_skills = calculate_match_score(job, resume)
        if score > 0:
            matched.append(MatchedJob(
                job=Job(**job),
                match_score=score,
                matched_skills=matched_skills,
            ))

    if worldwide_only:
        from services.job_store import _is_worldwide
        matched = [m for m in matched if _is_worldwide(m.job.model_dump())]

    matched.sort(key=lambda m: m.match_score, reverse=True)
    return matched[:limit]


@router.get("/{job_id}", response_model=Job)
async def get_job(job_id: str):
    """Get a job by ID."""
    job = job_store.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)


@router.post("/discover", response_model=DiscoverResult)
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
    if ext not in ("pdf", "doc", "docx", "txt"):
        raise HTTPException(status_code=400, detail="Only PDF, Word, and text files are supported")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    text = ""
    if ext == "pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to parse PDF file")
    elif ext == "txt":
        text = content.decode("utf-8", errors="ignore")
    else:
        text = content.decode("utf-8", errors="ignore")

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
