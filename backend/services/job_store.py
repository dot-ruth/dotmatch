import json
import logging
import os
import re
from datetime import datetime

logger = logging.getLogger(__name__)

CLIENT_ID_RE = re.compile(r"[^A-Za-z0-9_-]")


def _client_key(client_id: str | None) -> str:
    """Normalize an anonymous browser ID. Missing/invalid IDs share 'default'."""
    key = CLIENT_ID_RE.sub("", (client_id or "").strip())[:64]
    return key or "default"


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


def _as_str(value) -> str | None:
    """Coerce an upstream value to str. Lists take the first item, dicts become None."""
    if value is None:
        return None
    if isinstance(value, list):
        value = value[0] if value else None
    if value is None or isinstance(value, dict):
        return None
    text = str(value).strip()
    return text or None


def _as_int(value) -> int | None:
    """Coerce an upstream value to int. Anything non-numeric becomes None."""
    if value is None or isinstance(value, bool):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _sanitize_job(job: dict) -> dict:
    """Coerce one upstream job dict into the stored contract.

    Upstream APIs change shapes without notice (e.g. a string field becoming
    a list). Without this, a single malformed job fails Pydantic validation
    and turns every serializing endpoint into a 500. Never raises.
    """
    try:
        company = job.get("company") or {}
        company_name = company.get("name") if isinstance(company, dict) else company
        skills = job.get("skills") or []
        if isinstance(skills, str):
            skills = [skills]
        job["title"] = str(job.get("title") or "")
        job["company"] = {"name": _as_str(company_name) or ""}
        job["location"] = _as_str(job.get("location"))
        job["remote"] = bool(job.get("remote"))
        job["salary_min"] = _as_int(job.get("salary_min"))
        job["salary_max"] = _as_int(job.get("salary_max"))
        job["url"] = _as_str(job.get("url"))
        job["description"] = _as_str(job.get("description"))
        job["skills"] = [s for s in (str(s).strip() for s in skills if s is not None and not isinstance(s, dict)) if s][:30]
        job["experience_level"] = _as_str(job.get("experience_level"))
        job["employment_type"] = _as_str(job.get("employment_type"))
        job["source_type"] = _as_str(job.get("source_type"))
        job["posted_at"] = _as_str(job.get("posted_at"))
    except Exception:
        logger.warning("job sanitize failed", exc_info=True)
    return job


def _is_worldwide(job: dict) -> bool:
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
    if location in ("remote", "anywhere", "global"):
        return True
    return False


class JobStore:
    """In-memory job storage with O(1) dedup and lookup."""

    def __init__(self):
        self._jobs: list[dict] = []
        self._counter = 0
        self._keys: set[str] = set()
        self._id_index: dict[str, dict] = {}
        self._resumes: dict[str, dict] = {}
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
        for job in jobs:
            if not isinstance(job, dict):
                continue
            _sanitize_job(job)
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
        return self._jobs

    def get_by_id(self, job_id: str) -> dict | None:
        return self._id_index.get(job_id)

    def search(
        self,
        remote_only: bool | None = None,
        worldwide_only: bool | None = None,
        search_query: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[dict], int]:
        """Search jobs with filters. Returns (filtered_jobs, total_count)."""
        filtered = self._jobs

        if remote_only is not None:
            filtered = [j for j in filtered if j["remote"] == remote_only]

        if worldwide_only:
            filtered = [j for j in filtered if _is_worldwide(j)]

        if search_query:
            query = search_query.lower()
            filtered = [
                j for j in filtered
                if query in j["title"].lower()
                or query in j["company"]["name"].lower()
                or any(query in s.lower() for s in j.get("skills", []))
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
        client_id: str | None = None,
    ) -> dict:
        """Store parsed resume data for one anonymous browser session."""
        key = _client_key(client_id)
        self._resumes[key] = {
            "id": key,
            "filename": filename,
            "raw_text": raw_text,
            "skills": skills,
            "job_titles": job_titles,
            "experience_years": experience_years,
            "education": education,
            "created_at": datetime.now().isoformat(),
        }
        self._save_snapshot()
        return self._resumes[key]

    def get_resume(self, client_id: str | None = None) -> dict | None:
        """Get the stored resume profile for one anonymous browser session."""
        return self._resumes.get(_client_key(client_id))

    def update_resume(self, client_id: str | None = None, **fields) -> dict | None:
        """Update stored resume profile fields. Returns updated profile or None."""
        resume = self._resumes.get(_client_key(client_id))
        if not resume:
            return None
        for key in ("skills", "job_titles", "experience_years", "education"):
            if fields.get(key) is not None:
                resume[key] = fields[key]
        self._save_snapshot()
        return resume

    def _save_snapshot(self) -> None:
        """Persist jobs + resumes to disk (stdlib json). Never crashes the app."""
        try:
            path = _snapshot_path()
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump({"jobs": self._jobs, "resumes": self._resumes}, f)
        except Exception:
            logger.warning("snapshot save failed", exc_info=True)

    def _load_snapshot(self) -> None:
        """Restore jobs + resume from disk. Missing/corrupt file = fresh start."""
        try:
            with open(_snapshot_path(), encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, ValueError):
            return
        jobs = [
            _sanitize_job(j)
            for j in data.get("jobs") or []
            if isinstance(j, dict) and j.get("id")
        ]
        self._jobs = jobs
        self._counter = len(jobs)
        self._id_index = {j["id"]: j for j in jobs}
        self._keys = {
            f"{(j.get('title') or '').lower()}|{((j.get('company') or {}).get('name') or '').lower()}"
            for j in jobs
        }
        resumes = data.get("resumes")
        if isinstance(resumes, dict):
            self._resumes = {str(k): v for k, v in resumes.items() if isinstance(v, dict)}
        if isinstance(data.get("resume"), dict) and "default" not in self._resumes:
            self._resumes["default"] = data["resume"]


job_store = JobStore()
