import httpx

from adapters.common import is_dev_job


async def fetch_hn_hiring() -> list[dict]:
    """Fetch job listings from Hacker News 'Who is hiring?' monthly threads."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={
                    "query": "Ask HN: Who is hiring?",
                    "tags": "story",
                    "hitsPerPage": 5,
                },
            )
            if resp.status_code != 200:
                return jobs

            hits = resp.json().get("hits", [])
            if not hits:
                return jobs

            thread_id = hits[0].get("objectID")
            if not thread_id:
                return jobs

            comments_resp = await client.get(
                f"https://hacker-news.firebaseio.com/v0/item/{thread_id}.json",
            )
            if comments_resp.status_code != 200:
                return jobs

            thread_data = comments_resp.json()
            comment_ids = thread_data.get("kids", [])[:100]

            for cid in comment_ids[:80]:
                try:
                    c_resp = await client.get(
                        f"https://hacker-news.firebaseio.com/v0/item/{cid}.json",
                    )
                    if c_resp.status_code != 200:
                        continue

                    comment = c_resp.json()
                    if not comment or comment.get("type") != "comment":
                        continue

                    text = comment.get("text", "")
                    if not text:
                        continue

                    title = _extract_title(text)
                    if not title or not is_dev_job(title):
                        continue

                    company = _extract_company(text)
                    location = _extract_location(text)
                    skills = _extract_skills(text)
                    url = _extract_url(text)

                    jobs.append({
                        "title": title,
                        "company": {"name": company},
                        "location": location,
                        "remote": any(w in text.lower() for w in ["remote", "fully remote", "100% remote"]),
                        "salary_min": None,
                        "salary_max": None,
                        "url": url,
                        "description": text,
                        "skills": skills,
                        "experience_level": None,
                        "employment_type": None,
                        "source_type": "hn_hiring",
                    })
                except Exception:
                    continue

        except Exception:
            pass

    return jobs


def _extract_title(text: str) -> str | None:
    """Extract job title from the first line of a hiring comment."""
    import re
    first_line = text.split("<br>")[0] if "<br>" in text else text.split("\n")[0]
    clean = re.sub(r"<[^>]+>", "", first_line).strip()
    if not clean or len(clean) > 120:
        return None
    return clean


def _extract_company(text: str) -> str:
    """Extract company name from the first line (usually 'Company | Role')."""
    import re
    first_line = text.split("<br>")[0] if "<br>" in text else text.split("\n")[0]
    clean = re.sub(r"<[^>]+>", "", first_line).strip()
    parts = clean.split("|")
    if parts:
        return parts[0].strip()
    return clean


def _extract_location(text: str) -> str:
    """Try to find location info in the comment."""
    import re
    patterns = [
        r"(?:location|based in|located in|office)\s*[:=]?\s*([A-Z][a-zA-Z\s,]+)",
        r"\b(San Francisco|New York|London|Berlin|Tokyo|Remote|Worldwide|Global|US|EU|UTC)\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return "Remote"


def _extract_skills(text: str) -> list[str]:
    """Extract tech skills mentioned in the comment."""
    import re
    skill_keywords = [
        "python", "javascript", "typescript", "react", "node", "nodejs",
        "go", "golang", "rust", "java", "ruby", "php", "swift", "kotlin",
        "c++", "c#", ".net", "django", "fastapi", "postgresql", "postgres",
        "mysql", "mongodb", "redis", "kubernetes", "docker", "aws", "gcp",
        "azure", "terraform", "graphql", "vue", "angular", "svelte",
        "rails", "laravel", "spring", "elixir", "haskell", "scala",
    ]
    found = []
    text_lower = text.lower()
    for skill in skill_keywords:
        if skill in text_lower:
            found.append(skill)
    return found[:10]


def _extract_url(text: str) -> str:
    """Extract the first URL from the comment."""
    import re
    match = re.search(r'href="([^"]+)"', text)
    if match:
        return match.group(1)
    match = re.search(r'https?://[^\s<"]+', text)
    if match:
        return match.group(0)
    return ""
