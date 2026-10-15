import json
import threading

from services.job_store import JobStore


def _store(tmp_path, monkeypatch) -> JobStore:
    monkeypatch.setenv("DOTMATCH_SNAPSHOT", str(tmp_path / "store.json"))
    return JobStore()


def _job(title: str) -> dict:
    return {
        "title": title,
        "company": {"name": "Acme"},
        "location": "Worldwide",
        "remote": True,
        "salary_min": None,
        "salary_max": None,
        "url": "https://boards.greenhouse.io/acme/jobs/1",
        "description": "python",
        "skills": ["python"],
        "experience_level": None,
        "employment_type": None,
        "source_type": "greenhouse",
        "posted_at": "2026-10-01",
        "deadline": None,
    }


def test_get_all_returns_a_copy(tmp_path, monkeypatch) -> None:
    store = _store(tmp_path, monkeypatch)
    store.add_jobs([_job("Backend Engineer")])

    snapshot = store.get_all()
    snapshot.append({"id": "999"})

    assert len(store.get_all()) == 1
    assert snapshot[0]["id"] == store.get_all()[0]["id"]


def test_concurrent_add_jobs_keeps_store_and_snapshot_consistent(tmp_path, monkeypatch) -> None:
    store = _store(tmp_path, monkeypatch)
    errors: list[Exception] = []
    barrier = threading.Barrier(6)

    def worker(worker_id: int) -> None:
        try:
            barrier.wait(timeout=10)
            for i in range(10):
                store.add_jobs([_job(f"Engineer {worker_id}-{i}")])
        except Exception as exc:
            errors.append(exc)

    threads = [threading.Thread(target=worker, args=(n,)) for n in range(6)]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join(timeout=30)

    assert errors == []
    assert not any(thread.is_alive() for thread in threads)
    assert len(store.get_all()) == 60

    data = json.loads((tmp_path / "store.json").read_text(encoding="utf-8"))
    assert len(data["jobs"]) == 60
    assert len({job["id"] for job in data["jobs"]}) == 60
    assert list(tmp_path.glob("*.tmp")) == []


def test_snapshot_write_is_replaced_atomically(tmp_path, monkeypatch) -> None:
    store = _store(tmp_path, monkeypatch)
    store.add_jobs([_job("Backend Engineer")])

    store.set_applied(store.get_all()[0]["id"], True)

    data = json.loads((tmp_path / "store.json").read_text(encoding="utf-8"))
    assert data["jobs"][0]["applied_at"]
    assert list(tmp_path.glob("*.tmp")) == []
