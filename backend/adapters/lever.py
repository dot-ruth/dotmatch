import httpx

from adapters.common import is_dev_job, parse_iso_date

LEVER_COMPANIES = [
    "netflix", "shopify", "cloudflare", "ramp", "figma",
    "gitlab", "notion", "supabase", "vercel", "posthog",
    "plaid", "rippling", "databricks", "datadog", "snyk",
    "contentful", "prisma", "hasura", "inngest", "calcom",
]


async def fetch_lever() -> list[dict]:
    """Fetch dev jobs from top tech companies on Lever."""
    jobs = []

    async with httpx.AsyncClient(timeout=15) as client:
        for slug in LEVER_COMPANIES:
            try:
                resp = await client.get(
                    f"https://api.lever.co/v0/postings/{slug}",
                    params={"mode": "json"},
                )
                if resp.status_code != 200:
                    continue

                for item in resp.json():
                    title = item.get("text", "")
                    if not title or not is_dev_job(title):
                        continue

                    categories = item.get("categories", {})
                    department = categories.get("department", "")
                    team = categories.get("team", "")
                    location = categories.get("location", "")

                    salary_min = item.get("salaryMin")
                    salary_max = item.get("salaryMax")

                    jobs.append({
                        "title": title,
                        "company": {"name": slug.replace("-", " ").title()},
                        "location": location or "Remote",
                        "remote": "remote" in title.lower() or "remote" in location.lower(),
                        "salary_min": int(salary_min) if salary_min else None,
                        "salary_max": int(salary_max) if salary_max else None,
                        "url": item.get("hostedUrl", ""),
                        "description": item.get("descriptionPlain", "") or item.get("description", ""),
                        "skills": [],
                        "experience_level": department or team,
                        "employment_type": None,
                        "source_type": "lever",
                        "posted_at": parse_iso_date(item.get("createdAt")),
                    })
            except Exception:
                continue

    return jobs
