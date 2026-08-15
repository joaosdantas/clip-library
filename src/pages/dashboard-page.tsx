import { useState } from 'react'
import { FolderPlus, Plus } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { ProjectCard } from '@/components/projects/project-card'
import { useProjects } from '@/hooks/use-projects'

function ProjectsLoading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-xl bg-muted/70 h-24" />
      ))}
    </div>
  )
}

function ProjectsError({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Failed to load projects</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function ProjectsEmpty({ onNewProject }: { onNewProject: () => void }) {
  return (
    <Card className="items-center py-10 text-center">
      <CardHeader className="items-center gap-3">
        <FolderPlus className="size-8 text-muted-foreground" aria-hidden />
        <CardTitle>No projects yet</CardTitle>
        <CardDescription className="max-w-sm">
          Create your first project to start building a library of clips from
          your videos.
        </CardDescription>
        <Button onClick={onNewProject} className="mt-2">
          <Plus />
          New Project
        </Button>
      </CardHeader>
    </Card>
  )
}

export function DashboardPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { data: projects, isLoading, isError, error } = useProjects()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the projects where your video clips live.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus />
            New Project
          </Button>
        </div>

        {isLoading && <ProjectsLoading />}

        {isError && (
          <ProjectsError message={error?.message ?? 'Something went wrong.'} />
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <ProjectsEmpty onNewProject={() => setDialogOpen(true)} />
        )}

        {!isLoading && !isError && projects && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
