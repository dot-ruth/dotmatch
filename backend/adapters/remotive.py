import re

import httpx

from adapters.common import is_dev_job


async def fetch_remotive() -> list[dict]:
    """Fetch software engineering jobs from Remotive."""
    jobs = []
    categories = ["software-dev", "devops", "qa"]

    async with httpx.AsyncClient(timeout=30) as client:
        for category in categories:
            try:
                resp = await client.get(f"https://remotive.com/api/remote-jobs?category={category}")
                if resp.status_code == 200:
                    for item in resp.json().get("jobs", []):
                        title = item.get("title", "")
                        if not is_dev_job(title):
                            continue

                        salary_min, salary_max = _parse_salary(item.get("salary", ""))
                        jobs.append({
                            "title": title,
                            "company": {"name": item.get("company_name", "Unknown")},
                            "location": item.get("candidate_required_location", "Remote"),
                            "remote": True,
                            "salary_min": salary_min,
                            "salary_max": salary_max,
                            "url": item.get("url", ""),
                            "description": item.get("description", ""),
                            "skills": item.get("tags", []),
                            "experience_level": None,
                            "employment_type": None,
                            "source_type": "remotive",
                        })
            except Exception:
                pass

    return jobs


def _parse_salary(salary_str: str) -> tuple[int | None, int | None]:
    """Parse salary string like '$100k - $150k' into (min, max)."""
    if not salary_str:
        return None, None
    nums = re.findall(r"\d+", salary_str.replace(",", ""))
    if len(nums) >= 2:
        return int(nums[0]) * 1000, int(nums[1]) * 1000
    if len(nums) == 1:
        val = int(nums[0]) * 1000
        return val, val
    return None, None
