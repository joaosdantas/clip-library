import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import {
  createVideo,
  fetchVideos,
  type VideoWithJobs,
} from '@/lib/videos'
import { analyzeVideoUrl } from '@/lib/video-source'
import { createProcessingJob } from '@/lib/processing-jobs'

export interface CreateVideoResult {
  video: VideoWithJobs
  jobError: string | null
}

export function useVideos(projectId: string | undefined) {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: ['videos', projectId, userId],
    queryFn: () => fetchVideos(projectId!),
    enabled: Boolean(projectId && userId),
  })
}

export function useCreateVideo(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation<CreateVideoResult, Error, string>({
    mutationFn: async (sourceUrl) => {
      const analysis = analyzeVideoUrl(sourceUrl)
      if (!analysis.ok) {
        throw new Error(analysis.error)
      }

      const video = await createVideo({
        projectId: projectId!,
        userId: userId!,
        sourceUrl: analysis.url,
        sourceType: analysis.metadata.sourceType,
        title: analysis.metadata.title,
        filename: analysis.metadata.filename,
      })

      try {
        const job = await createProcessingJob({
          videoId: video.id,
          userId: userId!,
          type: 'download',
        })
        return { video: { ...video, processing_jobs: [job] }, jobError: null }
      } catch (error) {
        return {
          video: { ...video, processing_jobs: [] },
          jobError:
            error instanceof Error
              ? error.message
              : 'Failed to schedule processing for this video.',
        }
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<VideoWithJobs[]>(
        ['videos', projectId, userId],
        (existing) => existing ? [result.video, ...existing] : [result.video],
      )
      queryClient.invalidateQueries({ queryKey: ['videos', projectId, userId] })
    },
  })
}
