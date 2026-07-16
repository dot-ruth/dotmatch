import re

import httpx

from adapters.common import is_dev_job


async def fetch_devjobsscanner() -> list[dict]:
    """Fetch dev jobs from DevJobsScanner RSS feed."""
    jobs = []

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.get("https://devjobsscanner.com/rss/")
            if resp.status_code != 200:
                return jobs

            xml = resp.text
            items = re.findall(r"<item>(.*?)</item>", xml, re.DOTALL)

            for item_xml in items:
                title_match = re.search(r"<title><!\[CDATA\[(.*?)\]\]></title>", item_xml)
                link_match = re.search(r"<link>(.*?)</link>", item_xml)
                desc_match = re.search(r"<description><!\[CDATA\[(.*?)\]\]></description>", item_xml, re.DOTALL)
                category_matches = re.findall(r"<category><!\[CDATA\[(.*?)\]\]></category>", item_xml)

                title = title_match.group(1).strip() if title_match else ""
                if not title or not is_dev_job(title):
                    continue

                url = link_match.group(1).strip() if link_match else ""
                description = desc_match.group(1).strip() if desc_match else ""
                skills = category_matches[:10]

                company = "Unknown"
                company_match = re.search(r"Company:\s*(.*?)(?:<br|<br/>|\n)", description, re.IGNORECASE)
                if company_match:
                    company = company_match.group(1).strip()
                else:
                    parts = title.split(" - ", 1)
                    if len(parts) == 2:
                        company = parts[0].strip()
                        title = parts[1].strip()

                location_match = re.search(r"Location:\s*(.*?)(?:<br|<br/>|\n)", description, re.IGNORECASE)
                location = location_match.group(1).strip() if location_match else "Remote"

                jobs.append({
                    "title": title,
                    "company": {"name": company},
                    "location": location,
                    "remote": any(w in description.lower() or w in location.lower() for w in ["remote", "worldwide"]),
                    "salary_min": None,
                    "salary_max": None,
                    "url": url,
                    "description": description,
                    "skills": skills,
                    "experience_level": None,
                    "employment_type": None,
                    "source_type": "devjobsscanner",
                })
        except Exception:
            pass

    return jobs
