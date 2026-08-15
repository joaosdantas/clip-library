import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateVideo } from '@/hooks/use-videos'
import { analyzeVideoUrl } from '@/lib/video-source'

interface AddVideoDialogProps {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddVideoDialog({
  projectId,
  open,
  onOpenChange,
}: AddVideoDialogProps) {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)
  const createVideo = useCreateVideo(projectId)

  useEffect(() => {
    if (!open) {
      setUrl('')
      setValidationError(null)
      setJobError(null)
    }
  }, [open])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const analysis = analyzeVideoUrl(url)
    if (!analysis.ok) {
      setValidationError(analysis.error)
      return
    }

    setValidationError(null)
    createVideo.mutate(analysis.url, {
      onSuccess: (result) => {
        if (result.jobError) {
          setJobError(result.jobError)
        } else {
          onOpenChange(false)
        }
      },
    })
  }

  const error =
    validationError ?? createVideo.error?.message ?? jobError ?? null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Video by URL</DialogTitle>
          <DialogDescription>
            Paste a YouTube, direct, or any other HTTP/HTTPS video URL. The
            video will be added and queued for processing later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                autoFocus
              />
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link2 className="size-3.5" aria-hidden />
                The video is not downloaded or validated yet.
              </p>
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
              disabled={createVideo.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createVideo.isPending}>
              {createVideo.isPending && <Loader2 className="animate-spin" />}
              Add Video
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
