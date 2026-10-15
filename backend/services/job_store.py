import contextlib
import json
import logging
import os
import threading
from datetime import datetime

logger = logging.getLogger(__name__)


def _snapshot_path() -> str:
    base = os.environ.get(
        "DOTMATCH_SNAPSHOT",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "store.json"),
    )
    return os.path.abspath(base)

WORLDWIDE_KEYWORDS = ("worldwide", "global", "anywhere", "distributed")
REGION_RESTRICTED = ("remote -", "remote,", "remote us", "remote usa", "remote eu",
                     "remote uk", "remote india", "remote brazil", "remote europe",
                     "remote canada", "remote australia", "remote japan",
                     "remote africa", "remote asia", "emea", "latam", "apac",
                     "north america", "south america", "europe", "asia pacific")


def is_worldwide(job: dict) -> bool:
    """Check if a job is available to work from anywhere (e.g. Ethiopia).

    Returns True only for truly worldwide/global remote jobs, not region-restricted ones.
    """
    if not job.get("remote"):
        return False
    location = (job.get("location") or "").lower().strip()
    if not location:
        return True
    if any(kw in location for kw in WORLDWIDE_KEYWORDS):
        return True
    if any(kw in location for kw in REGION_RESTRICTED):
        return False
    return location in ("remote", "anywhere", "global")


class JobStore:
    """In-memory job storage with O(1) dedup and lookup.

    All reads and writes go through a re-entrant lock so the store stays consistent when
    FastAPI runs handlers in its thread pool. The snapshot file is replaced atomically,
    so a crash or a concurrent reader can never observe a half-written store. The store
    is process-local: run a single uvicorn worker (never ``--workers N``).
    """

    def __init__(self) -> None:
        self._jobs: list[dict] = []
        self._counter = 0
        self._keys: set[str] = set()
        self._id_index: dict[str, dict] = {}
        self._resume: dict | None = None
        self._lock = threading.RLock()
        self._load_snapshot()

    def add_jobs(self, jobs: list[dict], skip_ghosts: bool = True) -> int:
        """Add jobs to store, deduplicating by title+company.

        Args:
            jobs: List of job dicts to add.
            skip_ghosts: If True, skip jobs without a valid apply URL.

        Returns:
            Count of new jobs added.
        """
        new_count = 0
        with self._lock:
            for job in jobs:
                if skip_ghosts and not (job.get("url") or "").strip():
                    continue

                title = (job.get("title") or "").strip()
                company_name = ((job.get("company") or {}).get("name") or "").strip()
                if not title or not company_name:
                    continue

                key = f"{title.lower()}|{company_name.lower()}"
                if key in self._keys:
                    continue

                self._counter += 1
                job["id"] = str(self._counter)
                job["created_at"] = datetime.now().isoformat()
                self._jobs.append(job)
                self._keys.add(key)
                self._id_index[job["id"]] = job
                new_count += 1
            if new_count:
                self._save_snapshot()
        return new_count

    def get_all(self) -> list[dict]:
        with self._lock:
            return list(self._jobs)

    def get_by_id(self, job_id: str) -> dict | None:
        with self._lock:
            return self._id_index.get(job_id)

    def find_by_url(self, url: str) -> dict | None:
        """Find a stored job by its application URL (exact match, then stripped)."""
        if not url:
            return None
        target = url.strip()
        stripped = target.rstrip("/")
        with self._lock:
            for job in self._jobs:
                if (job.get("url") or "").strip() == target:
                    return job
            for job in self._jobs:
                if (job.get("url") or "").strip().rstrip("/") == stripped:
                    return job
        return None

    def set_applied(self, job_id: str, applied: bool) -> dict | None:
        """Mark or unmark a job as applied to. Persists the snapshot."""
        with self._lock:
            job = self._id_index.get(job_id)
            if not job:
                return None
            if applied:
                if job.get("applied_at"):
                    return job
                job["applied_at"] = datetime.now().isoformat()
            else:
                if not job.get("applied_at"):
                    return job
                job.pop("applied_at", None)
            self._save_snapshot()
        return job

    def count_applied(self) -> int:
        with self._lock:
            return sum(1 for j in self._jobs if j.get("applied_at"))

    def search(
        self,
        remote_only: bool | None = None,
        worldwide_only: bool | None = None,
        search_query: str | None = None,
        hide_applied: bool | None = None,
        applied_only: bool | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[dict], int]:
        """Search jobs with filters. Returns (filtered_jobs, total_count)."""
        with self._lock:
            filtered = self._jobs

            if remote_only is not None:
                filtered = [j for j in filtered if bool(j.get("remote")) == remote_only]

            if worldwide_only:
                filtered = [j for j in filtered if is_worldwide(j)]

            if hide_applied:
                filtered = [j for j in filtered if not j.get("applied_at")]

            if applied_only:
                filtered = [j for j in filtered if j.get("applied_at")]

            if search_query:
                query = search_query.lower()
                filtered = [
                    j for j in filtered
                    if query in (j.get("title") or "").lower()
                    or query in ((j.get("company") or {}).get("name") or "").lower()
                    or any(query in s.lower() for s in j.get("skills") or [])
                ]

            def _sort_key(j):
                return j.get("posted_at") or j.get("created_at") or ""

            filtered = sorted(filtered, key=_sort_key, reverse=True)
            total = len(filtered)
            return filtered[offset:offset + limit], total

    def store_resume(
        self,
        filename: str,
        raw_text: str,
        skills: list[str],
        job_titles: list[str],
        experience_years: float | None,
        education: list[str],
    ) -> dict:
        """Store parsed resume data."""
        with self._lock:
            self._resume = {
                "id": "1",
                "filename": filename,
                "raw_text": raw_text,
                "skills": skills,
                "job_titles": job_titles,
                "experience_years": experience_years,
                "education": education,
                "created_at": datetime.now().isoformat(),
            }
            self._save_snapshot()
        return self._resume

    def get_resume(self) -> dict | None:
        """Get the stored resume profile."""
        with self._lock:
            return self._resume

    def _save_snapshot(self) -> None:
        """Persist jobs + resume to disk via an atomic replace. Never crashes the app."""
        with self._lock:
            path = _snapshot_path()
            tmp_path = f"{path}.{os.getpid()}.tmp"
            try:
                os.makedirs(os.path.dirname(path), exist_ok=True)
                payload = json.dumps({"jobs": self._jobs, "resume": self._resume})
                with open(tmp_path, "w", encoding="utf-8") as f:
                    f.write(payload)
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp_path, path)
            except Exception:
                logger.warning("snapshot save failed", exc_info=True)
            finally:
                with contextlib.suppress(OSError):
                    os.unlink(tmp_path)

    def _load_snapshot(self) -> None:
        """Restore jobs + resume from disk. Missing/corrupt file = fresh start."""
        try:
            with open(_snapshot_path(), encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, ValueError):
            return
        jobs = [j for j in data.get("jobs") or [] if isinstance(j, dict) and j.get("id")]
        self._jobs = jobs
        self._counter = len(jobs)
        self._id_index = {j["id"]: j for j in jobs}
        self._keys = {
            f"{(j.get('title') or '').lower()}|{((j.get('company') or {}).get('name') or '').lower()}"
            for j in jobs
        }
        if isinstance(data.get("resume"), dict):
            self._resume = data["resume"]


job_store = JobStore()
