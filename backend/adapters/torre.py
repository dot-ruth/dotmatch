import httpx

from adapters.common import is_dev_job


async def fetch_torre() -> list[dict]:
    """Fetch software engineering jobs from Torre search API."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.post(
                "https://search.torre.co/opportunities/_search/",
                params={"offset": 0, "size": 100},
                json={
                    "query": "",
                    "filters": {
                        "remote": {"value": True},
                        "type": [{"value": "full-time"}],
                        "nightmare": False,
                    },
                },
                headers={"Content-Type": "application/json"},
            )
            if resp.status_code != 200:
                return jobs

            data = resp.json()
            for item in data.get("results", []):
                objective = item.get("objective", "")
                if not objective or not is_dev_job(objective):
                    continue

                org = item.get("organization", {})
                compensation = item.get("compensation", {})

                salary_min = None
                salary_max = None
                if compensation:
                    salary_min = compensation.get("min")
                    salary_max = compensation.get("max")

                location = ""
                place = item.get("place", {})
                if place:
                    location = place.get("name", "")

                skills = []
                for skill in item.get("skills", []):
                    name = skill.get("name", "")
                    if name:
                        skills.append(name)

                jobs.append({
                    "title": objective,
                    "company": {"name": org.get("name", "Unknown")},
                    "location": location or "Remote",
                    "remote": True,
                    "salary_min": int(salary_min) if salary_min else None,
                    "salary_max": int(salary_max) if salary_max else None,
                    "url": f"https://torre.co/en/jobs/{item.get('id', '')}",
                    "description": item.get("description", ""),
                    "skills": skills[:10],
                    "experience_level": None,
                    "employment_type": "full-time",
                    "source_type": "torre",
                    "posted_at": None,
                })
        except Exception:
            pass

    return jobs
