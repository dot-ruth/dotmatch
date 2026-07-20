import httpx

from adapters.common import is_dev_job, parse_iso_date


async def fetch_remotejobs_org() -> list[dict]:
    """Fetch software engineering jobs from RemoteJobs.org (2.8k+ remote dev jobs)."""
    jobs = []
    offset = 0
    limit = 50
    max_pages = 10

    async with httpx.AsyncClient(timeout=30) as client:
        for _ in range(max_pages):
            try:
                resp = await client.get(
                    "https://remotejobs.org/api/v1/jobs",
                    params={"limit": limit, "offset": offset},
                )
                if resp.status_code != 200:
                    break

                data = resp.json()
                page_jobs = data.get("data", [])
                if not page_jobs:
                    break

                for item in page_jobs:
                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    company = item.get("company", {})
                    company_name = company.get("name", "Unknown") if isinstance(company, dict) else str(company)

                    jobs.append({
                        "title": title,
                        "company": {"name": company_name},
                        "location": item.get("location", "") or "Remote",
                        "remote": True,
                        "salary_min": item.get("salary_min"),
                        "salary_max": item.get("salary_max"),
                        "url": item.get("apply_url") or item.get("url", ""),
                        "description": item.get("description", "") or "",
                        "skills": [],
                        "experience_level": None,
                        "employment_type": item.get("type"),
                        "source_type": "remotejobs_org",
                        "posted_at": parse_iso_date(item.get("posted_at")),
                    })

                pagination = data.get("pagination", {})
                if not pagination.get("has_more", False):
                    break
                offset += limit

            except Exception:
                break

    return jobs
