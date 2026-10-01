"""Adapter parser checks: WWR items, Jobright cards, Jobgether mapping. Run: pytest."""

import os

from adapters.jobgether import _map_job
from adapters.jobright import _parse_card, _parse_posted_at
from adapters.weworkremotely import _parse_item, _parse_skills
from services.job_store import JobStore

WWR_ITEM = """<item>
<title>Twikey: Senior Java Developer</title>
<region>Anywhere in the World</region>
<skills>Java, PostgreSQL, and Spring</skills>
<type>Full-Time</type>
<link>https://weworkremotely.com/remote-jobs/twikey-senior-java-developer</link>
<description>&lt;p&gt;A driven back-end developer.&lt;/p&gt;</description>
<pubDate>Mon, 29 Sep 2026 10:00:00 +0000</pubDate>
</item>"""

JOBRIGHT_CARD = """
<div><img alt="img" src="https://example.com/logo.png"></div>
<div>Liviniti</div><div>39 minutes ago</div>
<div>Software Developer Engineer in Test</div>
<div>United States</div><div>·</div><div>Remote</div><div>·</div>
<div>Mid Level</div><div>View</div>
<div>Pharmacy benefit management services.</div>
"""


def test_wwr_skills_split():
    assert _parse_skills("Java, PostgreSQL, and Spring") == ["Java", "PostgreSQL", "Spring"]
    assert _parse_skills("") == []


def test_wwr_item_parsing():
    job = _parse_item(WWR_ITEM)
    assert job is not None
    assert job["title"] == "Senior Java Developer"
    assert job["company"] == {"name": "Twikey"}
    assert job["location"] == "Anywhere in the World"
    assert job["skills"] == ["Java", "PostgreSQL", "Spring"]
    assert job["employment_type"] == "Full-Time"
    assert job["source_type"] == "weworkremotely"
    assert job["url"].startswith("https://weworkremotely.com/")
    assert job["posted_at"] is not None


def test_wwr_item_rejects_non_dev():
    item = WWR_ITEM.replace("Senior Java Developer", "Office Manager")
    assert _parse_item(item) is None


def test_jobright_card_parsing():
    job = _parse_card("https://jobright.ai/jobs/info/abc?utm_source=1", JOBRIGHT_CARD)
    assert job is not None
    assert job["title"] == "Software Developer Engineer in Test"
    assert job["company"] == {"name": "Liviniti"}
    assert job["location"] == "United States"
    assert job["remote"] is True
    assert job["url"] == "https://jobright.ai/jobs/info/abc"
    assert job["source_type"] == "jobright"
    assert job["posted_at"] is not None


def test_jobright_card_rejects_non_dev():
    card = JOBRIGHT_CARD.replace("Software Developer Engineer in Test", "Recruiter Trainee")
    assert _parse_card("https://jobright.ai/jobs/info/abc", card) is None


def test_jobright_relative_time():
    assert _parse_posted_at("39 minutes ago") is not None
    assert _parse_posted_at("2 days ago") is not None
    assert _parse_posted_at("no time info") is None


def test_jobgether_mapping():
    job = _map_job({
        "title": "Senior Backend Developer",
        "company": "Quartile",
        "url": "https://jobgether.com/offer/abc",
        "location": "South America, Brazil",
        "remote": "Full Remote",
        "contractType": "Freelance",
        "experience": "Senior (5-10 years)",
        "jobFunctions": ["Backend Developer"],
        "postedAt": "2026-10-01T05:31:53.757Z",
    })
    assert job is not None
    assert job["company"] == {"name": "Quartile"}
    assert job["remote"] is True
    assert job["source_type"] == "jobgether"
    assert job["posted_at"] is not None


def test_jobgether_mapping_rejects_non_dev():
    assert _map_job({"title": "Marketing Specialist", "company": "Acme"}) is None


def test_update_resume_fields(tmp_path, monkeypatch):
    monkeypatch.setenv("DOTMATCH_SNAPSHOT", str(tmp_path / "store.json"))
    store = JobStore()
    assert store.update_resume(skills=["python"]) is None

    store.store_resume(
        filename="cv.pdf",
        raw_text="python dev",
        skills=["python"],
        job_titles=["backend engineer"],
        experience_years=3,
        education=[],
    )
    updated = store.update_resume(skills=["python", "go"], education=["BSc Software Engineering"])
    assert updated is not None
    assert updated["skills"] == ["python", "go"]
    assert updated["education"] == ["BSc Software Engineering"]
    assert updated["job_titles"] == ["backend engineer"]
    assert updated["experience_years"] == 3

    # Snapshot round-trip preserves the edit.
    reloaded = JobStore()
    assert reloaded.get_resume()["skills"] == ["python", "go"]
    assert os.path.exists(tmp_path / "store.json")
