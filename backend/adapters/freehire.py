import httpx

from adapters.common import fetch_json, is_dev_job, parse_iso_date


async def fetch_freehire() -> list[dict]:
    """Fetch software engineering jobs from freehire.dev (20k+ remote dev jobs)."""
    jobs = []
    categories = [
        "backend", "frontend", "fullstack", "devops", "sre",
        "mobile", "data_engineering", "data_science", "ml_ai",
        "qa", "security", "embedded",
    ]

    async with httpx.AsyncClient(timeout=30) as client:
        for category in categories:
            try:
                data = await fetch_json(
                    client, "GET",
                    "https://freehire.dev/api/v1/jobs/search",
                    params={
                        "category": category,
                        "work_mode": "remote",
                        "limit": 50,
                        "offset": 0,
                    },
                )
                if not data:
                    continue

                for item in data.get("data", []):
                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    enrichment = item.get("enrichment") or {}

                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("company", "Unknown")},
                        "location": item.get("location", "") or "Remote",
                        "remote": True,
                        "salary_min": None,
                        "salary_max": None,
                        "url": item.get("url", ""),
                        "description": item.get("description", "") or "",
                        "skills": item.get("skills", []) or [],
                        "experience_level": enrichment.get("category"),
                        "employment_type": enrichment.get("employment_type"),
                        "source_type": "freehire",
                        "posted_at": parse_iso_date(item.get("posted_at")),
                    })
            except Exception:
                continue

    return jobs
