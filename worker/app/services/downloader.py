"""Video download service.

Filenames coming from URLs are never trusted. A safe, sanitized filename is
always generated locally before saving the file.
"""

import logging
import re
from pathlib import Path
from urllib.parse import urlparse

import requests

logger = logging.getLogger(__name__)

_EXTENSION_BY_CONTENT_TYPE = {
    "video/mp4": ".mp4",
    "video/x-m4v": ".m4v",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/x-msvideo": ".avi",
    "video/mpeg": ".mpeg",
    "video/ogg": ".ogv",
    "video/x-matroska": ".mkv",
    "video/mp2t": ".ts",
}

_SAFE_MEDIA_EXTENSIONS = {
    ".mp4",
    ".m4v",
    ".webm",
    ".mov",
    ".avi",
    ".mpeg",
    ".mpg",
    ".mkv",
    ".ogv",
    ".ts",
    ".3gp",
}

_UNSAFE_CHARS = re.compile(r"[<>:\"/\\|?*\x00-\x1f]")

CHUNK_SIZE = 256 * 1024


def sanitize_filename(name: str) -> str:
    """Return a filesystem-safe basename, never trusting the input."""
    name = name.replace("\\", "/")
    name = name.rsplit("/", 1)[-1]

    name = _UNSAFE_CHARS.sub("_", name)
    name = name.strip().strip(".")

    if not name or name in (".", ".."):
        name = "video"

    if len(name) > 120:
        stem, dot, ext = name.rpartition(".")
        if dot and len(stem) > 100:
            name = stem[:100] + "." + ext
        else:
            name = name[:120]

    return name


def _extension_from(response: requests.Response, url: str) -> str:
    content_type = (response.headers.get("content-type") or "").split(";")[0]
    content_type = content_type.strip().lower()

    extension = _EXTENSION_BY_CONTENT_TYPE.get(content_type)
    if extension:
        return extension

    url_suffix = Path(urlparse(url).path).suffix.lower()
    if url_suffix in _SAFE_MEDIA_EXTENSIONS:
        return url_suffix

    return ""


def download_file(url: str, destination_dir: Path, timeout: int = 60) -> Path:
    """Download ``url`` into ``destination_dir`` and return the saved path.

    Raises on HTTP/network errors or when the resulting file is empty.
    """
    destination_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Downloading %s", url)
    response = requests.get(
        url,
        stream=True,
        allow_redirects=True,
        timeout=timeout,
    )
    response.raise_for_status()

    extension = _extension_from(response, url)
    filename = sanitize_filename(f"video{extension}")
    destination = destination_dir / filename

    with destination.open("wb") as file:
        for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
            if chunk:
                file.write(chunk)

    size = destination.stat().st_size
    if size == 0:
        destination.unlink(missing_ok=True)
        raise ValueError(f"Downloaded file from {url} is empty.")

    logger.info("Saved %d bytes to %s", size, destination)
    return destination
