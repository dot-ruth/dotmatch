import httpx

from adapters.common import is_dev_job


def _parse_hn_item(item: dict) -> dict | None:
    """Parse a single HN item into a job dict."""
    text = item.get("text") or ""
    title = item.get("title") or ""

    if not text and not title:
        return None

    search_text = f"{title} {text}".lower()
    if not is_dev_job(search_text):
        return None

    url = item.get("url") or ""
    hn_id = item.get("id")
    hn_link = f"https://news.ycombinator.com/item?id={hn_id}" if hn_id else ""

    company = "Unknown"
    lines = text.split("\n")
    for line in lines[:5]:
        line_stripped = line.strip()
        if line_stripped and not line_stripped.startswith(("http", "www", "•")):
            if len(line_stripped) < 100:
                company = line_stripped.split("|")[0].strip().split("–")[0].strip()
                break

    skills = []
    tech_keywords = [
        "python", "javascript", "typescript", "go", "golang", "rust", "java",
        "ruby", "php", "swift", "kotlin", "scala", "elixir",
        "react", "vue", "angular", "svelte", "next.js", "nextjs",
        "node.js", "nodejs", "django", "flask", "fastapi", "rails", "spring",
        "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
        "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
        "graphql", "rest", "grpc", "machine learning", "ml", "ai",
        "postgres", "sqlite", "kafka", "spark", "airflow",
    ]
    search_lower = search_text
    for kw in tech_keywords:
        if kw in search_lower:
            skills.append(kw)

    is_remote = any(w in search_lower for w in ["remote", "worldwide", "anywhere", "distributed", "work from home"])

    salary_min = None
    salary_max = None
    import re
    salary_match = re.search(r"\$[\d,]+k?\s*[-–—to]+\s*\$[\d,]+k?", search_text)
    if salary_match:
        salary_text = salary_match.group(0).replace(",", "")
        nums = re.findall(r"\d+", salary_text)
        if len(nums) >= 2:
            salary_min = int(nums[0]) * (1000 if len(nums[0]) <= 2 else 1)
            salary_max = int(nums[1]) * (1000 if len(nums[1]) <= 2 else 1)

    posted_at = None
    if item.get("time"):
        from datetime import datetime, timezone
        posted_at = datetime.fromtimestamp(item["time"], tz=timezone.utc).isoformat()

    return {
        "title": title or "Software Engineer",
        "company": {"name": company[:80]},
        "location": "Remote" if is_remote else "",
        "remote": is_remote,
        "salary_min": salary_min,
        "salary_max": salary_max,
        "url": url or hn_link,
        "description": text[:3000],
        "skills": skills[:15],
        "experience_level": None,
        "employment_type": None,
        "source_type": "hn_hiring",
        "posted_at": posted_at,
    }


async def fetch_hn_hiring() -> list[dict]:
    """Fetch Who is Hiring threads from Hacker News and parse comments for dev jobs."""
    jobs = []

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            algolia_resp = await client.get(
                "https://hn.algolia.com/api/v1/search",
                params={
                    "query": "\"who is hiring\"",
                    "tags": "story",
                    "hitsPerPage": 5,
                },
            )
            if algolia_resp.status_code != 200:
                return jobs

            hits = algolia_resp.json().get("hits", [])

            hiring_ids = []
            for hit in hits:
                title = hit.get("title", "").lower()
                if "who is hiring" in title and "who is hiring" in title:
                    hiring_ids.append(hit.get("objectID"))

            if not hiring_ids:
                return jobs

            for thread_id in hiring_ids[:2]:
                item_resp = await client.get(
                    f"https://hacker-news.firebaseio.com/v0/item/{thread_id}.json"
                )
                if item_resp.status_code != 200:
                    continue

                thread = item_resp.json()
                comment_ids = thread.get("kids", [])[:100]

                for cid in comment_ids:
                    comment_resp = await client.get(
                        f"https://hacker-news.firebaseio.com/v0/item/{cid}.json"
                    )
                    if comment_resp.status_code != 200:
                        continue

                    comment = comment_resp.json()
                    if not comment or comment.get("deleted") or comment.get("dead"):
                        continue

                    job = _parse_hn_item(comment)
                    if job and job["url"]:
                        jobs.append(job)

        except Exception:
            pass

    return jobs
