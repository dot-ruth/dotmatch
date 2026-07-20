import logging

from adapters.remoteok import fetch_remoteok
from adapters.weworkremotely import fetch_weworkremotely
from adapters.remotive import fetch_remotive
from adapters.arbeitnow import fetch_arbeitnow
from adapters.jobicy import fetch_jobicy
from adapters.findwork import fetch_findwork
from adapters.hn_hiring import fetch_hn_hiring
from adapters.workingnomads import fetch_workingnomads
from adapters.devjobsscanner import fetch_devjobsscanner
from adapters.himalayas import fetch_himalayas
from adapters.freehire import fetch_freehire
from services.job_store import job_store

logger = logging.getLogger(__name__)

FETCHERS = [
    ("RemoteOK", fetch_remoteok),
    ("WeWorkRemotely", fetch_weworkremotely),
    ("Remotive", fetch_remotive),
    ("Arbeitnow", fetch_arbeitnow),
    ("Jobicy", fetch_jobicy),
    ("Findwork", fetch_findwork),
    ("HN_Hiring", fetch_hn_hiring),
    ("WorkingNomads", fetch_workingnomads),
    ("DevJobsScanner", fetch_devjobsscanner),
    ("Himalayas", fetch_himalayas),
    ("FreeHire", fetch_freehire),
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
