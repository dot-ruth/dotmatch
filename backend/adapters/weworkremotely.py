import re

import httpx

from adapters.common import is_dev_job


async def fetch_weworkremotely() -> list[dict]:
    """Fetch software engineering jobs from We Work Remotely RSS."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get("https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss")
            if resp.status_code == 200:
                items = re.findall(r"<item>(.*?)</item>", resp.text, re.DOTALL)
                for item in items:
                    title_match = re.search(r"<title><!\[CDATA\[(.*?)\]\]></title>", item)
                    link_match = re.search(r"<link>(.*?)</link>", item)
                    desc_match = re.search(r"<description><!\[CDATA\[(.*?)\]\]></description>", item, re.DOTALL)

                    if title_match and link_match:
                        title = title_match.group(1)
                        if not is_dev_job(title):
                            continue
                        jobs.append({
                            "title": title,
                            "company": {"name": "Unknown"},
                            "location": "Remote",
                            "remote": True,
                            "salary_min": None,
                            "salary_max": None,
                            "url": link_match.group(1),
                            "description": desc_match.group(1) if desc_match else "",
                            "skills": [],
                            "experience_level": None,
                            "employment_type": None,
                            "source_type": "weworkremotely",
                        })
        except Exception:
            pass

    return jobs
