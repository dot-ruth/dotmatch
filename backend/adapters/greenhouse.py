import httpx

from adapters.common import is_dev_job

GREENHOUSE_SLUGS = [
    "databricks", "datadog", "anthropic", "mongodb", "brex",
    "airbnb", "elastic", "figma", "gitlab", "lyft",
    "coinbase", "instacart", "vercel", "mercury", "discord",
    "airtable", "stripe", "notion", "posthog", "supabase",
]


async def fetch_greenhouse() -> list[dict]:
    """Fetch dev jobs from top tech companies on Greenhouse."""
    jobs = []

    async with httpx.AsyncClient(timeout=15) as client:
        for slug in GREENHOUSE_SLUGS:
            try:
                resp = await client.get(
                    f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs",
                    params={"content": "false"},
                )
                if resp.status_code != 200:
                    continue

                for item in resp.json().get("jobs", []):
                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    loc = item.get("location", {})
                    location = loc.get("name", "") if isinstance(loc, dict) else ""

                    departments = item.get("departments", []) or []
                    department = departments[0].get("name", "") if departments else ""

                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("owner", "") or slug.title()},
                        "location": location or "Remote",
                        "remote": "remote" in title.lower() or "remote" in location.lower(),
                        "salary_min": None,
                        "salary_max": None,
                        "url": item.get("absolute_url", "") or item.get("url", ""),
                        "description": "",
                        "skills": [],
                        "experience_level": department,
                        "employment_type": None,
                        "source_type": "greenhouse",
                        "posted_at": None,
                    })
            except Exception:
                continue

    return jobs
