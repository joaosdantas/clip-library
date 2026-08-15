import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clapperboard, Loader2, Plus } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddVideoDialog } from '@/components/videos/add-video-dialog'
import { VideoCard } from '@/components/videos/video-card'
import { useAuth } from '@/lib/auth'
import { fetchProject } from '@/lib/projects'
import { useVideos } from '@/hooks/use-videos'

function VideosEmpty({ onAddVideo }: { onAddVideo: () => void }) {
  return (
    <Card className="items-center py-12 text-center">
      <CardHeader className="items-center gap-3">
        <Clapperboard className="size-8 text-muted-foreground" aria-hidden />
        <CardTitle>No videos yet</CardTitle>
        <CardDescription className="max-w-sm">
          Add a video by URL to start building the clip library for this
          project.
        </CardDescription>
        <Button onClick={onAddVideo} className="mt-2">
          <Plus />
          Add Video
        </Button>
      </CardHeader>
    </Card>
  )
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', projectId, user?.id],
    queryFn: () => fetchProject(projectId!),
    enabled: Boolean(projectId && user),
  })

  const {
    data: videos,
    isLoading: videosLoading,
    isError: videosError,
    error: videosErrorData,
  } = useVideos(projectId)

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <span className="sr-only">Loading project</span>
          </div>
        )}

        {isError && (
          <Card>
            <CardHeader>
              <CardTitle>Project not found</CardTitle>
              <CardDescription>
                This project does not exist or you do not have access to it.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {project && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              {project.description?.trim() && (
                <p className="mt-1 text-muted-foreground">
                  {project.description.trim()}
                </p>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Videos
                </h2>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus />
                  Add Video
                </Button>
              </div>

              {videosLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="sr-only">Loading videos</span>
                </div>
              )}

              {videosError && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Failed to load videos
                    </CardTitle>
                    <CardDescription>
                      {videosErrorData?.message ?? 'Something went wrong.'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {!videosLoading &&
                !videosError &&
                videos &&
                videos.length === 0 && (
                  <VideosEmpty onAddVideo={() => setDialogOpen(true)} />
                )}

              {!videosLoading &&
                !videosError &&
                videos &&
                videos.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                )}
            </div>
          </>
        )}
      </main>

      <AddVideoDialog
        projectId={projectId!}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
