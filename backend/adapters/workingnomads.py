import httpx

from adapters.common import is_dev_job


async def fetch_workingnomads() -> list[dict]:
    """Fetch remote jobs from Working Nomads."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get("https://www.workingnomads.com/api/exposedjobs")
            if resp.status_code == 200:
                data = resp.json()
                items = data if isinstance(data, list) else data.get("jobs", []) if isinstance(data, dict) else []

                for item in items:
                    if not isinstance(item, dict):
                        continue

                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    tags = item.get("tags", []) or []
                    if isinstance(tags, str):
                        tags = [t.strip() for t in tags.split(",") if t.strip()]

                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("company_name", "") or item.get("company", "Unknown")},
                        "location": item.get("location", "") or "Remote",
                        "remote": True,
                        "salary_min": None,
                        "salary_max": None,
                        "url": item.get("url", "") or item.get("link", ""),
                        "description": item.get("description", "") or item.get("excerpt", ""),
                        "skills": tags,
                        "experience_level": None,
                        "employment_type": None,
                        "source_type": "workingnomads",
                        "posted_at": None,
                    })
        except Exception:
            pass

    return jobs
