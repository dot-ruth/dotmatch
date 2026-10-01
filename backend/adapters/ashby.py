import httpx

from adapters.common import fetch_json, is_dev_job, parse_iso_date

ASHBY_COMPANIES = [
    "openai", "linear", "ramp", "notion", "plaid",
    "vercel", "supabase", "posthog", "calcom", "inngest",
    "resend", "dishpit", "sentry", "railway", "retool",
    "anthropic", "figma", "cashapp", "brex", "mercury",
]


async def fetch_ashby() -> list[dict]:
    """Fetch dev jobs from top tech companies on Ashby."""
    jobs = []

    async with httpx.AsyncClient(timeout=15) as client:
        for slug in ASHBY_COMPANIES:
            try:
                data = await fetch_json(
                    client, "GET",
                    f"https://api.ashbyhq.com/posting-api/job-board/{slug}",
                    params={"includeCompensation": "true"},
                )
                if not data:
                    continue

                for item in data.get("jobs", []):
                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    location = item.get("location") or ""
                    is_remote = item.get("isRemote") is True
                    remote = is_remote or "remote" in title.lower() or "remote" in location.lower()
                    compensation = item.get("compensation") or {}

                    salary_min = None
                    salary_max = None
                    try:
                        if compensation.get("minValue") is not None:
                            salary_min = int(compensation["minValue"])
                        if compensation.get("maxValue") is not None:
                            salary_max = int(compensation["maxValue"])
                    except (TypeError, ValueError):
                        pass

                    jobs.append({
                        "title": title,
                        "company": {"name": slug.replace("-", " ").title()},
                        "location": location or "Remote",
                        "remote": remote,
                        "salary_min": salary_min,
                        "salary_max": salary_max,
                        "url": item.get("jobUrl") or item.get("applyUrl") or f"https://jobs.ashbyhq.com/{slug}/{item.get('id', '')}",
                        "description": item.get("descriptionPlain", "") or item.get("descriptionHtml", ""),
                        "skills": [],
                        "experience_level": item.get("employmentType"),
                        "employment_type": item.get("employmentType"),
                        "source_type": "ashby",
                        "posted_at": parse_iso_date(item.get("publishedAt")),
                    })
            except Exception:
                continue

    return jobs
