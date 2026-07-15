import logging

from adapters.remoteok import fetch_remoteok
from adapters.weworkremotely import fetch_weworkremotely
from adapters.remotive import fetch_remotive
from adapters.arbeitnow import fetch_arbeitnow
from adapters.jobicy import fetch_jobicy
from services.job_store import job_store

logger = logging.getLogger(__name__)

FETCHERS = [
    ("RemoteOK", fetch_remoteok),
    ("WeWorkRemotely", fetch_weworkremotely),
    ("Remotive", fetch_remotive),
    ("Arbeitnow", fetch_arbeitnow),
    ("Jobicy", fetch_jobicy),
]


async def discover_all_jobs() -> dict:
    """Discover jobs from all sources and store them."""
    all_fetched = []
    errors = []

    for name, fetcher in FETCHERS:
        try:
            fetched = await fetcher()
            all_fetched.extend(fetched)
            logger.info("Fetched %d jobs from %s", len(fetched), name)
        except Exception as e:
            errors.append(f"{name}: {str(e)}")
            logger.error("Failed to fetch from %s: %s", name, e)

    new_count = job_store.add_jobs(all_fetched)

    return {
        "new_jobs": new_count,
        "sources_checked": len(FETCHERS),
        "errors": errors,
    }
