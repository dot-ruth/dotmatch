"""Shared constants for job adapters."""

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
