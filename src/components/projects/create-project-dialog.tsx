import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateProject } from '@/hooks/use-projects'

const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 500

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const createProject = useCreateProject()

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
      setValidationError(null)
    }
  }, [open])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setValidationError('Project name is required.')
      return
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setValidationError(
        `Project name must be ${MAX_NAME_LENGTH} characters or fewer.`
      )
      return
    }

    setValidationError(null)
    createProject.mutate(
      { name: trimmedName, description },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  const error = validationError ?? createProject.error?.message ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            Create a project to organize your video clips.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My first project"
                maxLength={MAX_NAME_LENGTH}
                required
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this project about?"
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={3}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending && <Loader2 className="animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
