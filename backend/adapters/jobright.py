import re
from datetime import datetime, timedelta, timezone

import httpx

from adapters.common import fetch_text, is_dev_job

CARD_RE = re.compile(
    r'<a target="_blank"[^>]*href="(https://jobright\.ai/jobs/info/[^"]+)"[^>]*>(.*?)</a>',
    re.DOTALL,
)
RELATIVE_RE = re.compile(r"(\d+)\s+(minute|hour|day|week|month)s?\s+ago")


def _strip_tags(html: str) -> list[str]:
    """Split card HTML into readable text chunks."""
    parts = [p.strip() for p in re.sub(r"<[^>]+>", "\n", html).split("\n")]
    return [p for p in parts if p]


def _parse_posted_at(text: str) -> str | None:
    """Convert '39 minutes ago' style labels to ISO timestamps."""
    match = RELATIVE_RE.search(text.lower())
    if not match:
        return None
    amount = int(match.group(1))
    unit = match.group(2)
    delta = {
        "minute": timedelta(minutes=amount),
        "hour": timedelta(hours=amount),
        "day": timedelta(days=amount),
        "week": timedelta(weeks=amount),
        "month": timedelta(days=30 * amount),
    }[unit]
    return (datetime.now(timezone.utc) - delta).isoformat()


def _parse_card(url: str, body_html: str) -> dict | None:
    """Parse one Jobright job-card into a job dict. Returns None when unusable."""
    chunks = _strip_tags(body_html)
    if len(chunks) < 3:
        return None

    company = chunks[0]
    posted_label = next((c for c in chunks if "ago" in c.lower()), "")
    # Title is the chunk right after the time-ago label (or second chunk).
    try:
        title_idx = chunks.index(posted_label) + 1 if posted_label else 1
        title = chunks[title_idx]
    except (ValueError, IndexError):
        return None
    if not title or not is_dev_job(title):
        return None

    joined = " ".join(chunks).lower()
    separators = {"·", "|", "-", "•", "/"}
    location = next(
        (
            c for c in chunks[title_idx + 1:]
            if c and c not in separators and "view" not in c.lower() and "ago" not in c.lower()
        ),
        "Remote",
    )
    description = " ".join(chunks[title_idx + 1:])

    return {
        "title": title,
        "company": {"name": company[:80]},
        "location": location[:120] or "Remote",
        "remote": "remote" in joined,
        "salary_min": None,
        "salary_max": None,
        "url": url.split("?")[0],
        "description": description[:3000],
        "skills": [],
        "experience_level": None,
        "employment_type": None,
        "source_type": "jobright",
        "posted_at": _parse_posted_at(posted_label),
    }


async def fetch_jobright() -> list[dict]:
    """Fetch remote dev jobs from Jobright's server-rendered listings."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            html = await fetch_text(client, "https://jobright.ai/remote-jobs")
            for url, body in CARD_RE.findall(html or ""):
                try:
                    job = _parse_card(url, body)
                except Exception:
                    continue
                if job:
                    jobs.append(job)
        except Exception:
            pass

    return jobs
