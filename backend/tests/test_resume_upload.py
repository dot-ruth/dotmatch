"""Resume upload, search robustness, and matched pagination tests. Run: pytest from backend/."""

import io
import zipfile

from fastapi.testclient import TestClient

from main import app
from routes import jobs as jobs_routes
from services.job_store import JobStore

client = TestClient(app)

DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _fresh_store(tmp_path, monkeypatch):
    monkeypatch.setenv("DOTMATCH_SNAPSHOT", str(tmp_path / "snap.json"))
    store = JobStore()
    monkeypatch.setattr(jobs_routes, "job_store", store)
    return store


def _docx(text: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as archive:
        archive.writestr(
            "word/document.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            f"<w:body><w:p><w:r><w:t>{text}</w:t></w:r></w:p></w:body></w:document>",
        )
    return buf.getvalue()


def _upload(filename: str, content: bytes, content_type: str = "application/octet-stream"):
    return client.post(
        "/api/jobs/resume",
        files={"file": (filename, content, content_type)},
    )


def test_upload_docx_extracts_text(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    resp = _upload(
        "cv.docx",
        _docx("Backend engineer with python, docker and kubernetes experience."),
        DOCX_TYPE,
    )
    assert resp.status_code == 200, resp.text
    profile = resp.json()
    assert profile["filename"] == "cv.docx"
    assert "python" in profile["skills"]
    assert store.get_resume()["filename"] == "cv.docx"


def test_upload_txt_extracts_text(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    resp = _upload("cv.txt", b"Senior python engineer, 5 years experience with docker.")
    assert resp.status_code == 200, resp.text
    assert "python" in resp.json()["skills"]


def test_upload_rejects_legacy_doc(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    resp = _upload("cv.doc", b"\xd0\xcf\xe0\xe0\x01\x00", "application/msword")
    assert resp.status_code == 400
    assert "docx" in resp.json()["detail"].lower()


def test_upload_rejects_unknown_extension(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    resp = _upload("resume.exe", b"MZ")
    assert resp.status_code == 400


def test_upload_rejects_corrupt_docx(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    resp = _upload("cv.docx", b"this is not a zip archive", DOCX_TYPE)
    assert resp.status_code == 400
    assert "docx" in resp.json()["detail"].lower()


def test_upload_rejects_empty_text(tmp_path, monkeypatch):
    _fresh_store(tmp_path, monkeypatch)
    resp = _upload("cv.txt", b"   \n\t  ")
    assert resp.status_code == 400
    assert "text" in resp.json()["detail"].lower()


def test_list_and_search_tolerate_partial_jobs(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    store.add_jobs(
        [
            {
                "title": "Backend Engineer",
                "company": {"name": "Acme"},
                "location": "Worldwide",
                "remote": True,
                "url": "https://example.com/jobs/1",
                "description": "Build things in python.",
                "skills": ["python"],
            }
        ]
    )
    stored = store.get_all()[0]
    stored.pop("remote")
    stored["company"] = None

    listed = client.get("/api/jobs/", params={"search_query": "backend"})
    assert listed.status_code == 200
    assert listed.json()["total"] == 1

    remote = client.get("/api/jobs/", params={"remote_only": "true"})
    assert remote.status_code == 200

    worldwide = client.get("/api/jobs/", params={"worldwide_only": "true"})
    assert worldwide.status_code == 200
    assert worldwide.json()["total"] == 0

    detail = client.get(f"/api/jobs/{stored['id']}")
    assert detail.status_code == 200
    assert detail.json()["company"] is None


def test_matched_offset_paginates(tmp_path, monkeypatch):
    store = _fresh_store(tmp_path, monkeypatch)
    store.store_resume(
        filename="cv.txt",
        raw_text="Backend engineer with python and docker experience.",
        skills=["python", "docker", "kubernetes"],
        job_titles=["backend engineer"],
        experience_years=5.0,
        education=[],
    )
    for i in range(3):
        store.add_jobs(
            [
                {
                    "title": f"Backend Engineer {i}",
                    "company": {"name": f"Acme {i}"},
                    "location": "Worldwide",
                    "remote": True,
                    "url": f"https://example.com/jobs/{i}",
                    "description": "python and docker role",
                    "skills": ["python", "docker"],
                }
            ]
        )

    first = client.get("/api/jobs/matched", params={"limit": 2, "offset": 0})
    second = client.get("/api/jobs/matched", params={"limit": 2, "offset": 2})
    assert first.status_code == 200 and second.status_code == 200

    first_ids = {m["job"]["id"] for m in first.json()}
    second_ids = {m["job"]["id"] for m in second.json()}
    assert len(first.json()) == 2
    assert len(second.json()) == 1
    assert first_ids.isdisjoint(second_ids)
