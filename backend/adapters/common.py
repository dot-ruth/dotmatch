"""Shared constants for job adapters."""

import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)


DEV_TITLE_KEYWORDS = (
    "software engineer", "software developer",
    "backend engineer", "backend developer",
    "frontend engineer", "frontend developer",
    "fullstack engineer", "fullstack developer",
    "full-stack engineer", "full-stack developer",
    "devops engineer", "sre", "site reliability",
    "infrastructure engineer",
    "platform engineer",
    "python developer", "python engineer",
    "javascript developer", "javascript engineer",
    "typescript developer", "typescript engineer",
    "react developer", "react engineer",
    "node developer", "node engineer",
    "java developer", "java engineer",
    "golang developer", "golang engineer",
    "rust developer", "rust engineer",
    "ruby developer", "ruby engineer",
    "php developer", "php engineer",
    "swift developer", "swift engineer",
    "kotlin developer", "kotlin engineer",
    "mobile engineer", "mobile developer",
    "ios engineer", "ios developer",
    "android engineer", "android developer",
    "machine learning engineer",
    "ml engineer",
    "data engineer",
    "cloud engineer",
    "security engineer",
    "developer",
    "engineer",
)


def is_dev_job(title: str) -> bool:
    """Check if a job title is related to software engineering."""
    return any(kw in title.lower() for kw in DEV_TITLE_KEYWORDS)


def parse_iso_date(date_str: str | None) -> str | None:
    """Parse an ISO 8601 date string and return normalized ISO string."""
    if not date_str:
        return None
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    except Exception:
        return None


def parse_unix_timestamp(ts) -> str | None:
    """Parse a unix timestamp (int or float) and return ISO string."""
    if ts is None:
        return None
    try:
        dt = datetime.fromtimestamp(float(ts), tz=timezone.utc)
        return dt.isoformat()
    except Exception:
        return None


def parse_rfc2822_date(date_str: str | None) -> str | None:
    """Parse an RFC 2822 date string (used in RSS pubDate)."""
    if not date_str:
        return None
    try:
        from email.utils import parsedate_to_datetime
        dt = parsedate_to_datetime(date_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    except Exception:
        return None


async def fetch_json(client: httpx.AsyncClient, method: str, url: str, **kwargs):
    """Request JSON, returning None on bad status, network, or decode failure."""
    try:
        resp = await client.request(method, url, **kwargs)
        return resp.json() if resp.status_code == 200 else None
    except Exception as e:
        logger.debug("fetch_json %s %s failed: %s", method, url, e)
        return None


async def fetch_text(client: httpx.AsyncClient, url: str, **kwargs) -> str | None:
    """GET text (RSS feeds), returning None on bad status or network failure."""
    try:
        resp = await client.get(url, **kwargs)
        return resp.text if resp.status_code == 200 else None
    except Exception as e:
        logger.debug("fetch_text %s failed: %s", url, e)
        return None
