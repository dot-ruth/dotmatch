import re

import httpx

from adapters.common import fetch_text, is_dev_job, parse_rfc2822_date


async def fetch_weworkremotely() -> list[dict]:
    """Fetch software engineering jobs from We Work Remotely RSS."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            xml = await fetch_text(client, "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss")
            items = re.findall(r"<item>(.*?)</item>", xml or "", re.DOTALL)
            for item in items:
                title_match = re.search(r"<title><!\[CDATA\[(.*?)\]\]></title>", item)
                link_match = re.search(r"<link>(.*?)</link>", item)
                desc_match = re.search(r"<description><!\[CDATA\[(.*?)\]\]></description>", item, re.DOTALL)
                pubdate_match = re.search(r"<pubDate>(.*?)</pubDate>", item)

                if title_match and link_match:
                    title = title_match.group(1)
                    if not is_dev_job(title):
                        continue
                    posted_at = parse_rfc2822_date(pubdate_match.group(1) if pubdate_match else None)
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
                        "posted_at": posted_at,
                    })
        except Exception:
            pass

    return jobs
