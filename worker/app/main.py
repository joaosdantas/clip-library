"""Clip Library processing worker.

Polls Supabase for pending "download" processing jobs and processes them one by
one. Run from the worker/ directory with:

    python -m app.main
"""

import logging
import sys
import time

from app import config
from app.jobs.download_video import fail_download_job, process_download_job
from app.supabase_client import get_supabase

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

MAX_JOBS_PER_POLL = 50


def fetch_pending_download_jobs(supabase) -> list:
    """Return pending download jobs, each including its associated video."""
    response = (
        supabase.table("processing_jobs")
        .select("*, videos(*)")
        .eq("type", "download")
        .eq("status", "pending")
        .order("created_at")
        .limit(MAX_JOBS_PER_POLL)
        .execute()
    )
    return response.data or []


def run_once(supabase) -> int:
    """Process all pending download jobs. Returns how many were processed."""
    jobs = fetch_pending_download_jobs(supabase)
    logger.info("Found %d pending download job(s).", len(jobs))

    for job in jobs:
        try:
            process_download_job(supabase, job)
        except Exception as exc:
            logger.exception("Download job %s failed.", job.get("id"))
            try:
                fail_download_job(supabase, job, exc)
            except Exception:
                logger.exception("Could not persist failure for job %s.", job.get("id"))

    return len(jobs)


def main() -> None:
    config.ensure_configured()
    supabase = get_supabase()

    logger.info(
        "Clip Library worker started. "
        "Polling every %d second(s) when idle, downloads in %s.",
        config.POLL_INTERVAL_SECONDS,
        config.DOWNLOAD_DIR,
    )

    try:
        while True:
            try:
                processed = run_once(supabase)
            except Exception:
                logger.exception("Poll failed; will retry on the next cycle.")
                processed = 0
            if processed == 0:
                time.sleep(config.POLL_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        logger.info("Worker stopped (Ctrl+C).")
        sys.exit(0)


if __name__ == "__main__":
    main()
