import html as html_module
import re

import httpx

from adapters.common import fetch_text, is_dev_job, parse_rfc2822_date

FEEDS = [
    "https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
]


def _tag(xml: str, name: str) -> str:
    """Extract inner text of the first <name>...</name> element."""
    match = re.search(rf"<{name}>(.*?)</{name}>", xml, re.DOTALL)
    return html_module.unescape(match.group(1)).strip() if match else ""


def _parse_skills(raw: str) -> list[str]:
    """Split a skills string like 'Java, PostgreSQL, and Spring'."""
    skills = []
    for part in raw.split(","):
        skill = part.strip()
        if skill.lower().startswith("and "):
            skill = skill[4:].strip()
        if skill:
            skills.append(skill)
    return skills[:10]


def _parse_item(item_xml: str) -> dict | None:
    """Parse one RSS <item> into a job dict. Returns None when unusable."""
    title_raw = _tag(item_xml, "title")
    if not title_raw:
        return None
    if ": " in title_raw:
        company, title = title_raw.split(": ", 1)
    else:
        company, title = "Unknown", title_raw
    title = title.strip()
    if not title or not is_dev_job(title):
        return None

    guid_match = re.search(r"<guid[^>]*>(.*?)</guid>", item_xml, re.DOTALL)
    url = _tag(item_xml, "link") or (guid_match.group(1).strip() if guid_match else "")

    return {
        "title": title,
        "company": {"name": company.strip() or "Unknown"},
        "location": _tag(item_xml, "region") or "Remote",
        "remote": True,
        "salary_min": None,
        "salary_max": None,
        "url": url,
        "description": _tag(item_xml, "description"),
        "skills": _parse_skills(_tag(item_xml, "skills")),
        "experience_level": None,
        "employment_type": _tag(item_xml, "type") or None,
        "source_type": "weworkremotely",
        "posted_at": parse_rfc2822_date(_tag(item_xml, "pubDate") or None),
    }


async def fetch_weworkremotely() -> list[dict]:
    """Fetch software engineering jobs from We Work Remotely RSS feeds."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        for feed in FEEDS:
            try:
                xml = await fetch_text(client, feed)
                items = re.findall(r"<item>(.*?)</item>", xml or "", re.DOTALL)
                for item_xml in items:
                    job = _parse_item(item_xml)
                    if job:
                        jobs.append(job)
            except Exception:
                pass

    return jobs
