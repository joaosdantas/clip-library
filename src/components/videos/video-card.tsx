import { ExternalLink, Play, Globe, Upload } from 'lucide-react'
import type { VideoWithJobs } from '@/lib/videos'
import { formatSourceType, formatVideoDisplayStatus } from '@/lib/videos'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SOURCE_ICONS = {
  youtube: Play,
  direct_url: Globe,
  upload: Upload,
} as const

export function VideoCard({ video }: { video: VideoWithJobs }) {
  const SourceIcon = SOURCE_ICONS[video.source_type as keyof typeof SOURCE_ICONS] ?? Globe

  return (
    <Card size="sm" className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SourceIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{video.title}</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span className="truncate">
            {video.source_url ? (
              <a
                href={video.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-full items-center gap-1 underline-offset-4 hover:underline"
              >
                <span className="truncate">{video.source_url}</span>
                <ExternalLink className="size-3 shrink-0" aria-hidden />
              </a>
            ) : (
              video.filename
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2 pt-0">
        <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
          {formatSourceType(video.source_type)}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs',
            video.status === 'error'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {formatVideoDisplayStatus(video)}
        </span>
      </CardContent>
    </Card>
  )
}
