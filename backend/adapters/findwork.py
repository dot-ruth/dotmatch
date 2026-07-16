import httpx

from adapters.common import is_dev_job


async def fetch_findwork() -> list[dict]:
    """Fetch software engineering jobs from Findwork."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get("https://findwork.dev/api/jobs/", params={
                "order_by": "date_posted",
                "search": "engineer",
            })
            if resp.status_code == 200:
                for item in resp.json().get("results", []):
                    title = item.get("role", "")
                    if not is_dev_job(title):
                        continue

                    employment = item.get("employment_type", "")
                    skills = item.get("skills", []) or []

                    jobs.append({
                        "title": title,
                        "company": {"name": item.get("company_name", "Unknown")},
                        "location": item.get("location", "") or "Remote",
                        "remote": item.get("remote", True),
                        "salary_min": None,
                        "salary_max": None,
                        "url": item.get("url", "") or item.get("text_preview", ""),
                        "description": item.get("description", "") or "",
                        "skills": skills if isinstance(skills, list) else [],
                        "experience_level": None,
                        "employment_type": employment,
                        "source_type": "findwork",
                    })
        except Exception:
            pass

    return jobs
