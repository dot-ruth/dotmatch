import asyncio
import logging

from adapters.remoteok import fetch_remoteok
from adapters.weworkremotely import fetch_weworkremotely
from adapters.remotive import fetch_remotive
from adapters.arbeitnow import fetch_arbeitnow
from adapters.jobicy import fetch_jobicy
from adapters.findwork import fetch_findwork
from adapters.devjobsscanner import fetch_devjobsscanner
from adapters.himalayas import fetch_himalayas
from adapters.freehire import fetch_freehire
from adapters.remotejobs_org import fetch_remotejobs_org
from adapters.jobsbase import fetch_jobsbase
from services.job_store import job_store

logger = logging.getLogger(__name__)

FETCHERS = [
    ("RemoteOK", fetch_remoteok),
    ("WeWorkRemotely", fetch_weworkremotely),
    ("Remotive", fetch_remotive),
    ("Arbeitnow", fetch_arbeitnow),
    ("Jobicy", fetch_jobicy),
    ("Findwork", fetch_findwork),
    ("DevJobsScanner", fetch_devjobsscanner),
    ("Himalayas", fetch_himalayas),
    ("FreeHire", fetch_freehire),
    ("RemoteJobsOrg", fetch_remotejobs_org),
    ("JobsBase", fetch_jobsbase),
]

MAX_CONCURRENT = 5


async def discover_all_jobs() -> dict:
    """Discover jobs from all sources in parallel and store them."""
    all_fetched = []
    errors = []
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async def _fetch_one(name: str, fetcher):
        async with semaphore:
            try:
                fetched = await fetcher()
                logger.info("Fetched %d jobs from %s", len(fetched), name)
                return name, fetched, None
            except Exception as e:
                logger.error("Failed to fetch from %s: %s", name, e)
                return name, [], str(e)

    tasks = [_fetch_one(name, fetcher) for name, fetcher in FETCHERS]
    results = await asyncio.gather(*tasks)

    for name, fetched, error in results:
        if error:
            errors.append(f"{name}: {error}")
        all_fetched.extend(fetched)

    new_count = job_store.add_jobs(all_fetched)

    return {
        "new_jobs": new_count,
        "sources_checked": len(FETCHERS),
        "errors": errors,
    }
