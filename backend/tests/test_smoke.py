"""Smoke checks: worldwide filter + match-score thresholds. Run: pytest."""

from services.job_store import _is_worldwide
from services.resume_service import calculate_match_score


def test_worldwide():
    assert _is_worldwide({"remote": True, "location": "Worldwide"})
    assert _is_worldwide({"remote": True, "location": ""})
    assert _is_worldwide({"remote": True, "location": "Remote"})
    assert not _is_worldwide({"remote": True, "location": "Remote US"})
    assert not _is_worldwide({"remote": True, "location": "EMEA"})
    assert not _is_worldwide({"remote": False, "location": "Worldwide"})


def test_match_thresholds():
    resume = {
        "skills": ["python", "django", "aws", "react", "postgres", "docker", "linux", "git"],
        "job_titles": ["backend engineer"],
        "experience_years": 5,
    }
    good = {
        "title": "Senior Backend Engineer",
        "skills": ["python", "django"],
        "description": "python django role",
        "remote": True,
    }
    score, matched = calculate_match_score(good, resume)
    assert score > 0
    assert "python" in matched

    bad = {
        "title": "Sales Manager",
        "skills": ["salesforce"],
        "description": "sell stuff",
        "remote": False,
    }
    assert calculate_match_score(bad, resume) == (0, [])
