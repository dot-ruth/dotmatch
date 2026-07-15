import httpx

from backend.adapters.common import is_dev_job


async def fetch_remoteok() -> list[dict]:
    """Fetch software engineering jobs from RemoteOK."""
    jobs = []
    tags = ["python", "javascript", "react", "node", "java", "go", "ruby", "php", "swift", "typescript"]

    async with httpx.AsyncClient(timeout=30) as client:
        for tag in tags:
            try:
                resp = await client.get(f"https://remoteok.com/api?tag={tag}")
                if resp.status_code == 200:
                    for item in resp.json():
                        if not isinstance(item, dict) or "id" not in item:
                            continue
                        title = item.get("position", "")
                        if not is_dev_job(title):
                            continue
                        jobs.append({
                            "title": title,
                            "company": {"name": item.get("company", "Unknown")},
                            "location": item.get("location", "Remote"),
                            "remote": True,
                            "salary_min": item.get("salary_min"),
                            "salary_max": item.get("salary_max"),
                            "url": item.get("url", ""),
                            "description": item.get("description", ""),
                            "skills": item.get("tags", []),
                            "experience_level": None,
                            "employment_type": None,
                            "source_type": "remoteok",
                        })
            except Exception:
                pass

    return jobs
