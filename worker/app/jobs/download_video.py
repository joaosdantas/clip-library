"""Processing job: download the video referenced by a source URL."""

import logging
from datetime import datetime, timezone

from app import config
from app.services.downloader import download_file

logger = logging.getLogger(__name__)

_ERROR_MESSAGE_MAX_LENGTH = 500


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _update_job(supabase, job_id: str, fields: dict) -> None:
    supabase.table("processing_jobs").update(fields).eq("id", job_id).execute()


def _update_video(supabase, video_id: str, fields: dict) -> None:
    supabase.table("videos").update(fields).eq("id", video_id).execute()


def process_download_job(supabase, job: dict) -> None:
    """Run one download job. Raises on failure so the caller can persist it."""
    video = job.get("videos")
    if not video:
        raise ValueError(f"Job {job['id']} has no associated video.")

    video_id = video["id"]
    source_url = video.get("source_url")
    if not source_url:
        raise ValueError(f"Video {video_id} has no source_url.")

    logger.info(
        "Processing download job %s for video %s (type=%s)",
        job["id"],
        video_id,
        job.get("type"),
    )

    _update_job(
        supabase,
        job["id"],
        {"status": "processing", "progress": 10, "started_at": _now_iso()},
    )
    _update_video(
        supabase,
        video_id,
        {"status": "processing", "processing_progress": 10},
    )

    destination = download_file(
        source_url,
        config.DOWNLOAD_DIR / str(video_id),
        timeout=config.DOWNLOAD_TIMEOUT_SECONDS,
    )

    _update_job(
        supabase,
        job["id"],
        {"status": "completed", "progress": 100, "finished_at": _now_iso()},
    )
    _update_video(
        supabase,
        video_id,
        {"status": "processing", "processing_progress": 100},
    )

    logger.info("Completed download job %s -> %s", job["id"], destination)


def fail_download_job(supabase, job: dict, error: Exception) -> None:
    """Persist a failed job and mark its video as errored."""
    video = job.get("videos")
    message = str(error) if str(error) else error.__class__.__name__

    logger.error("Failing download job %s: %s", job["id"], message)

    _update_job(
        supabase,
        job["id"],
        {
            "status": "failed",
            "error_message": message[:_ERROR_MESSAGE_MAX_LENGTH],
            "finished_at": _now_iso(),
        },
    )

    if video:
        _update_video(
            supabase,
            video["id"],
            {"status": "error", "error_message": message[:_ERROR_MESSAGE_MAX_LENGTH]},
        )
