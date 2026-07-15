import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class JobStore:
    """Simple in-memory job storage."""

    def __init__(self):
        self._jobs: list[dict] = []
        self._counter = 0

    def add_jobs(self, jobs: list[dict]) -> int:
        """Add jobs to store, deduplicating by title+company. Returns count of new jobs."""
        new_count = 0
        for job in jobs:
            key = f"{job['title'].lower()}|{job['company']['name'].lower()}"
            if not self._find_by_key(key):
                self._counter += 1
                job["id"] = str(self._counter)
                job["created_at"] = datetime.now().isoformat()
                self._jobs.append(job)
                new_count += 1
        return new_count

    def get_all(self) -> list[dict]:
        return self._jobs

    def get_by_id(self, job_id: str) -> dict | None:
        for job in self._jobs:
            if job["id"] == job_id:
                return job
        return None

    def search(
        self,
        remote_only: bool | None = None,
        search_query: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[dict], int]:
        """Search jobs with filters. Returns (filtered_jobs, total_count)."""
        filtered = self._jobs

        if remote_only is not None:
            filtered = [j for j in filtered if j["remote"] == remote_only]

        if search_query:
            query = search_query.lower()
            filtered = [
                j for j in filtered
                if query in j["title"].lower()
                or query in j["company"]["name"].lower()
                or any(query in s.lower() for s in j.get("skills", []))
            ]

        total = len(filtered)
        return filtered[offset:offset + limit], total

    def _find_by_key(self, key: str) -> dict | None:
        for job in self._jobs:
            job_key = f"{job['title'].lower()}|{job['company']['name'].lower()}"
            if job_key == key:
                return job
        return None


job_store = JobStore()
