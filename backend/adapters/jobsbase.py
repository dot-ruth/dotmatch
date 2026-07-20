import httpx

from adapters.common import is_dev_job, parse_iso_date


async def fetch_jobsbase() -> list[dict]:
    """Fetch software engineering jobs from JobsBase (400+ dev jobs with salary data)."""
    jobs = []
    cursor = None
    max_pages = 10

    async with httpx.AsyncClient(timeout=30) as client:
        for _ in range(max_pages):
            try:
                params = {"limit": 50}
                if cursor:
                    params["cursor"] = cursor

                resp = await client.get(
                    "https://jobsbase.io/api/v1/jobs",
                    params=params,
                )
                if resp.status_code != 200:
                    break

                data = resp.json()
                page_jobs = data.get("jobs", [])
                if not page_jobs:
                    break

                for item in page_jobs:
                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    company = item.get("company", {})
                    company_name = company.get("name", "Unknown") if isinstance(company, dict) else str(company)

                    locations = item.get("locations", []) or []
                    location = item.get("display_location") or item.get("city") or (locations[0] if locations else "Remote")

                    skills = item.get("skills", []) or []

                    jobs.append({
                        "title": title,
                        "company": {"name": company_name},
                        "location": location,
                        "remote": True,
                        "salary_min": item.get("salary_min"),
                        "salary_max": item.get("salary_max"),
                        "url": item.get("job_url", ""),
                        "description": "",
                        "skills": skills,
                        "experience_level": item.get("seniority_level"),
                        "employment_type": item.get("type"),
                        "source_type": "jobsbase",
                        "posted_at": parse_iso_date(item.get("posted_at")),
                    })

                if not data.get("has_more", False):
                    break
                cursor = data.get("next_cursor")

            except Exception:
                break

    return jobs
