import { Link } from 'react-router-dom'
import { Folder } from 'lucide-react'
import type { Project } from '@/lib/projects'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="group/project">
      <Card
        size="sm"
        className={cn(
          'h-full transition-colors',
          'hover:bg-muted/50 hover:ring-foreground/20',
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="truncate">{project.name}</span>
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {project.description?.trim() || 'No description'}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
