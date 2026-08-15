export type VideoSourceType = 'youtube' | 'direct_url'

export interface VideoSourceMetadata {
  sourceType: VideoSourceType
  title: string
  filename: string
}

export type AnalyzeVideoUrlResult =
  | { ok: true; url: string; metadata: VideoSourceMetadata }
  | { ok: false; error: string }

const YOUTUBE_HOSTNAMES = new Set([
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
])

export function analyzeVideoUrl(value: string): AnalyzeVideoUrlResult {
  const trimmed = value.trim()

  if (!trimmed) {
    return { ok: false, error: 'A video URL is required.' }
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return {
      ok: false,
      error: 'Enter a valid URL. It must start with http:// or https://.',
    }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return {
      ok: false,
      error: 'The URL must use http:// or https://.',
    }
  }

  const sourceType = isYouTubeUrl(url) ? 'youtube' : 'direct_url'
  const metadata = buildMetadata(url, sourceType)

  return { ok: true, url: url.href, metadata }
}

function isYouTubeUrl(url: URL): boolean {
  let hostname = url.hostname.toLowerCase()
  hostname = hostname.replace(/^www\./, '').replace(/^m\./, '')
  return (
    YOUTUBE_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.youtube.com') ||
    hostname.endsWith('.youtube-nocookie.com')
  )
}

function buildMetadata(
  url: URL,
  sourceType: VideoSourceType
): VideoSourceMetadata {
  if (sourceType === 'youtube') {
    const videoId = getYouTubeVideoId(url)
    const title = videoId ? `YouTube video ${videoId}` : url.hostname
    return { sourceType, title, filename: title }
  }

  const filename = getUrlFilename(url)
  const title = filename ? prettifyFilename(filename) : url.hostname
  return { sourceType, title, filename: filename ?? title }
}

function getYouTubeVideoId(url: URL): string | null {
  if (url.hostname.toLowerCase() === 'youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0] ?? null
  }

  const videoParam = url.searchParams.get('v')
  if (videoParam) {
    return videoParam
  }

  const segments = url.pathname.split('/').filter(Boolean)
  const embedIndex = segments.indexOf('embed')
  if (embedIndex !== -1 && segments[embedIndex + 1]) {
    return segments[embedIndex + 1]
  }

  return null
}

function getUrlFilename(url: URL): string | null {
  const lastSegment = url.pathname.split('/').filter(Boolean).pop()
  if (!lastSegment) {
    return null
  }

  try {
    const decoded = decodeURIComponent(lastSegment)
    if (!/^[^/]+\.[a-z0-9]{1,5}$/i.test(decoded)) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

function prettifyFilename(filename: string): string {
  return filename.replace(/\.[a-z0-9]{1,5}$/i, '').replace(/[-_]+/g, ' ').trim()
}
