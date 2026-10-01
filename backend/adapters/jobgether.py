import httpx

from adapters.common import fetch_json, is_dev_job, parse_iso_date

KEYWORDS = ["backend", "frontend", "devops", "mobile"]


def _map_job(item: dict) -> dict | None:
    """Map one Jobgether API job to the DotMatch job shape."""
    title = item.get("title", "")
    if not title or not is_dev_job(title):
        return None
    remote_label = (item.get("remote") or "").lower()
    return {
        "title": title,
        "company": {"name": item.get("company", "Unknown")},
        "location": item.get("location", "Remote"),
        "remote": "remote" in remote_label,
        "salary_min": None,
        "salary_max": None,
        "url": item.get("url", ""),
        "description": "",
        "skills": item.get("jobFunctions", []) or [],
        "experience_level": item.get("experience"),
        "employment_type": item.get("contractType"),
        "source_type": "jobgether",
        "posted_at": parse_iso_date(item.get("postedAt")),
    }


async def fetch_jobgether() -> list[dict]:
    """Fetch software engineering jobs from Jobgether's public API."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        for keyword in KEYWORDS:
            try:
                data = await fetch_json(
                    client, "GET",
                    "https://jobgether.com/api/v1/jobs",
                    params={"keyword": keyword, "limit": 25, "sort": "date"},
                )
                if not data:
                    continue
                for item in data.get("jobs", []):
                    job = _map_job(item)
                    if job:
                        jobs.append(job)
            except Exception:
                pass

    return jobs
