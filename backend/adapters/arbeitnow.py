import httpx

from adapters.common import fetch_json, is_dev_job, parse_unix_timestamp


async def fetch_arbeitnow() -> list[dict]:
    """Fetch software engineering jobs from Arbeitnow."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        for page in range(1, 6):
            try:
                data = await fetch_json(client, "GET", f"https://www.arbeitnow.com/api/job-board-api?page={page}")
                for item in (data or {}).get("data", []):
                    title = item.get("title", "")
                    tags = item.get("tags", [])

                    if not is_dev_job(title) and not any(is_dev_job(t) for t in tags):
                        continue

                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("company_name", "Unknown")},
                        "location": item.get("location", "Remote"),
                        "remote": item.get("remote", False),
                        "salary_min": None,
                        "salary_max": None,
                        "url": item.get("url", ""),
                        "description": item.get("description", ""),
                        "skills": tags,
                        "experience_level": None,
                        "employment_type": None,
                        "source_type": "arbeitnow",
                        "posted_at": parse_unix_timestamp(item.get("created_at")),
                    })
            except Exception:
                pass

    return jobs
