"""Shared constants for job adapters."""

from datetime import datetime, timezone


DEV_TITLE_KEYWORDS = (
    "software", "engineer", "developer", "programming",
    "architect", "backend", "frontend", "fullstack", "full-stack",
    "devops", "sre", "infrastructure",
    "python", "javascript", "typescript", "react", "node",
    "java", "golang", "rust", "ruby", "php", "swift", "kotlin",
    "data scientist", "machine learning", "ai ", "ml ",
    "security", "cloud", "platform", "systems",
    "qa", "test", "quality",
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
