import { Loader2 } from 'lucide-react'

export function AuthLoading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
