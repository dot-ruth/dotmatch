import httpx

from adapters.common import fetch_json


async def fetch_jobicy() -> list[dict]:
    """Fetch software engineering jobs from Jobicy."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            data = await fetch_json(client, "GET", "https://jobicy.com/api/v2/remote-jobs?count=50&industry=tech")
            for item in (data or {}).get("jobs", []):
                jobs.append({
                    "title": item.get("jobTitle", ""),
                    "company": {"name": item.get("companyName", "Unknown")},
                    "location": item.get("jobGeo", "Remote"),
                    "remote": True,
                    "salary_min": item.get("annualSalaryMin"),
                    "salary_max": item.get("annualSalaryMax"),
                    "url": item.get("url", ""),
                    "description": item.get("jobDescription", ""),
                    "skills": [],
                    "experience_level": item.get("jobLevel"),
                    "employment_type": item.get("jobType"),
                    "source_type": "jobicy",
                    "posted_at": None,
                })
        except Exception:
            pass

    return jobs
