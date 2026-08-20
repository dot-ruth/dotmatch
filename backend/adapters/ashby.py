import httpx

from adapters.common import is_dev_job, parse_iso_date

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
                resp = await client.get(
                    f"https://api.ashbyhq.com/posting-api/job-board/{slug}",
                    params={"includeCompensation": "true"},
                )
                if resp.status_code != 200:
                    continue

                data = resp.json()
                for item in data.get("jobPostings", []):
                    title = item.get("title", "")
                    if not title or not is_dev_job(title):
                        continue

                    location = item.get("locationName", "")
                    employment = item.get("employmentType", "")
                    compensation = item.get("compensation", {})

                    salary_min = None
                    salary_max = None
                    if compensation:
                        salary_min = compensation.get("minValue")
                        salary_max = compensation.get("maxValue")

                    skills = []
                    if item.get("skills"):
                        skills = [s.get("name", "") for s in item["skills"] if s.get("name")]

                    jobs.append({
                        "title": title,
                        "company": {"name": slug.replace("-", " ").title()},
                        "location": location or "Remote",
                        "remote": "remote" in title.lower() or "remote" in location.lower(),
                        "salary_min": int(salary_min) if salary_min else None,
                        "salary_max": int(salary_max) if salary_max else None,
                        "url": f"https://jobs.ashbyhq.com/{slug}/{item.get('id', '')}",
                        "description": item.get("descriptionPlain", "") or item.get("descriptionHtml", ""),
                        "skills": skills[:10],
                        "experience_level": employment,
                        "employment_type": employment,
                        "source_type": "ashby",
                        "posted_at": parse_iso_date(item.get("postedAt")),
                    })
            except Exception:
                continue

    return jobs
