import httpx

from adapters.common import fetch_json, is_dev_job


async def fetch_jobicy() -> list[dict]:
    """Fetch software engineering jobs from Jobicy."""
    jobs = []
    cursor = None
    seen_cursors = set()

    async with httpx.AsyncClient(timeout=30) as client:
        for _ in range(4):
            try:
                params = {"count": 50}
                if cursor:
                    params["cursor"] = cursor
                data = await fetch_json(client, "GET", "https://jobicy.com/api/v2/remote-jobs", params=params)
                if not data:
                    break
                for item in data.get("jobs", []):
                    title = item.get("jobTitle", "")
                    if not title or not is_dev_job(title):
                        continue
                    # jobType arrives as a list (e.g. ["Full-Time"]); jobLevel
                    # can be the placeholder "Any".
                    job_type = item.get("jobType")
                    if isinstance(job_type, list):
                        job_type = job_type[0] if job_type else None
                    job_level = item.get("jobLevel")
                    if job_level == "Any":
                        job_level = None
                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("companyName", "Unknown")},
                        "location": item.get("jobGeo", "Remote"),
                        "remote": True,
                        "salary_min": item.get("annualSalaryMin"),
                        "salary_max": item.get("annualSalaryMax"),
                        "url": item.get("url", ""),
                        "description": item.get("jobDescription", ""),
                        "skills": [],
                        "experience_level": job_level,
                        "employment_type": job_type,
                        "source_type": "jobicy",
                        "posted_at": None,
                    })
                cursor = data.get("nextCursor")
                if not cursor or cursor in seen_cursors:
                    break
                seen_cursors.add(cursor)
            except Exception:
                break

    return jobs
