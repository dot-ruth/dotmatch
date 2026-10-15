"""Apply tracking + cover letter draft tests. Run: pytest from backend/."""

from fastapi.testclient import TestClient

from main import app
from routes import jobs as jobs_routes
from services.job_store import JobStore

client = TestClient(app)


def _fresh_store(tmp_path, monkeypatch):
    monkeypatch.setenv("DOTMATCH_SNAPSHOT", str(tmp_path / "snap.json"))
    store = JobStore()
    monkeypatch.setattr(jobs_routes, "job_store", store)
    return store


def _seed(store, title="Backend Engineer", company="Acme", url="https://boards.greenhouse.io/acme/jobs/1"):
    store.add_jobs(
        [
            {
                "title": title,
                "company": {"name": company},
                "location": "Worldwide",
                "remote": True,
                "salary_min": None,
                "salary_max": None,
                "url": url,
                "description": "We need python and docker.",
                "skills": ["python", "docker"],
                "experience_level": None,
                "employment_type": None,
                "source_type": "greenhouse",
                "posted_at": "2026-10-01",
                "deadline": None,
            }
        ]
    )
    return store.get_all()[-1]["id"]


def test_mark_and_unmark_applied(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    job_id = _seed(store)

    first = client.post(f"/api/jobs/{job_id}/apply")
    assert first.status_code == 200
    assert first.json()["applied_at"]

    again = client.post(f"/api/jobs/{job_id}/apply")
    assert again.json()["applied_at"] == first.json()["applied_at"]

    applied = client.get("/api/jobs/", params={"applied_only": "true"})
    assert applied.status_code == 200
    assert applied.json()["total"] == 1

    hidden = client.get("/api/jobs/", params={"hide_applied": "true"})
    assert hidden.status_code == 200
    assert hidden.json()["total"] == 0

    cleared = client.delete(f"/api/jobs/{job_id}/apply")
    assert cleared.status_code == 200
    assert cleared.json()["applied_at"] is None

    back = client.get("/api/jobs/", params={"hide_applied": "true"})
    assert back.json()["total"] == 1


def test_apply_unknown_job_is_404(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    assert client.post("/api/jobs/999999/apply").status_code == 404
    assert client.delete("/api/jobs/999999/apply").status_code == 404


def test_cover_letter_requires_resume(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    job_id = _seed(store)

    resp = client.post("/api/jobs/cover-letter", json={"job_id": job_id})
    assert resp.status_code == 400
    assert "resume" in resp.json()["detail"].lower()


def test_cover_letter_by_url(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    url = "https://jobs.lever.co/acme/abc123"
    _seed(store, title="Platform Engineer", company="Lever Co", url=url)
    store.store_resume(
        filename="cv.txt",
        raw_text="Backend engineer with python and docker experience.",
        skills=["python", "docker", "kubernetes"],
        job_titles=["backend engineer"],
        experience_years=5.0,
        education=["BSc Computer Science"],
    )

    resp = client.post(
        "/api/jobs/cover-letter",
        json={
            "url": url,
            "name": "Ruth T.",
            "requirements": ["5+ years with Python", "Experience with Docker in production"],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    text = body["text"]
    assert "Platform Engineer" in text
    assert "Lever Co" in text
    assert "Ruth T." in text
    assert "5+ years with Python" in text
    assert body["matched_skills"]


def test_cover_letter_unknown_job_is_404(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    resp = client.post("/api/jobs/cover-letter", json={"url": "https://example.com/nope"})
    assert resp.status_code == 404


def test_find_by_url(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    url = "https://boards.greenhouse.io/acme/jobs/42"
    job_id = _seed(store, url=url)

    assert store.find_by_url(url)["id"] == job_id
    assert store.find_by_url(url + "/")["id"] == job_id
    assert store.find_by_url("https://example.com/other") is None
