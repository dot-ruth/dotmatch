from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import Job, PaginatedJobs, DiscoverResult
from backend.services.job_store import job_store
from backend.services.job_discovery import discover_all_jobs

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/", response_model=PaginatedJobs)
async def list_jobs(
    remote_only: bool | None = Query(default=None, description="Filter remote jobs only"),
    search_query: str | None = Query(default=None, description="Search by title, company, or skills"),
    offset: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(default=20, ge=1, le=100, description="Max records to return"),
):
    """List and filter jobs."""
    items, total = job_store.search(
        remote_only=remote_only,
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
