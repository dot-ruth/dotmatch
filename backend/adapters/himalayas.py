import httpx

from adapters.common import is_dev_job, parse_unix_timestamp


async def fetch_himalayas() -> list[dict]:
    """Fetch software engineering jobs from Himalayas (100k+ jobs)."""
    jobs = []
    offset = 0
    limit = 50
    max_pages = 10

    async with httpx.AsyncClient(timeout=30) as client:
        for _ in range(max_pages):
            try:
                resp = await client.get(
                    "https://himalayas.app/jobs/api",
                    params={"limit": limit, "offset": offset},
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

                    salary_min = item.get("minSalary")
                    salary_max = item.get("maxSalary")
                    currency = item.get("currency")

                    locations = item.get("locationRestrictions", []) or []
                    location = locations[0] if locations else "Remote"

                    seniority = item.get("seniority", []) or []

                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("companyName", "Unknown")},
                        "location": location,
                        "remote": True,
                        "salary_min": int(salary_min) if salary_min else None,
                        "salary_max": int(salary_max) if salary_max else None,
                        "url": item.get("applicationLink") or item.get("guid", ""),
                        "description": item.get("description", "") or item.get("excerpt", ""),
                        "skills": item.get("categories", []) or [],
                        "experience_level": seniority[0] if seniority else None,
                        "employment_type": item.get("employmentType"),
                        "source_type": "himalayas",
                        "posted_at": parse_unix_timestamp(item.get("pubDate")),
                    })

                total = data.get("totalCount", 0)
                offset += limit
                if offset >= total or offset >= limit * max_pages:
                    break

            except Exception:
                break

    return jobs
