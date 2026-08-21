import logging
from datetime import datetime

logger = logging.getLogger(__name__)

WORLDWIDE_KEYWORDS = ("worldwide", "global", "anywhere", "distributed")
REGION_RESTRICTED = ("remote -", "remote,", "remote us", "remote usa", "remote eu",
                     "remote uk", "remote india", "remote brazil", "remote europe",
                     "remote canada", "remote australia", "remote japan",
                     "remote africa", "remote asia", "emea", "latam", "apac",
                     "north america", "south america", "europe", "asia pacific")


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
        self._resume: dict | None = None

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
            if skip_ghosts and not job.get("url", "").strip():
                continue

            key = f"{job['title'].lower()}|{job['company']['name'].lower()}"
            if key in self._keys:
                continue

            self._counter += 1
            job["id"] = str(self._counter)
            job["created_at"] = datetime.now().isoformat()
            self._jobs.append(job)
            self._keys.add(key)
            self._id_index[job["id"]] = job
            new_count += 1
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

        filtered.sort(key=_sort_key, reverse=True)
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
        return self._resume

    def get_resume(self) -> dict | None:
        """Get the stored resume profile."""
        return self._resume


job_store = JobStore()
