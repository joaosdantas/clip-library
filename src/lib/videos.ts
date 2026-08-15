import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { fetchProject } from '@/lib/projects'
import {
  fetchProcessingJobsByVideoId,
  type ProcessingJob,
} from '@/lib/processing-jobs'

export type Video = Database['public']['Tables']['videos']['Row']

export type VideoWithJobs = Video & {
  processing_jobs: ProcessingJob[]
}

export type VideoSourceType = 'upload' | 'youtube' | 'direct_url'

export interface CreateVideoInput {
  projectId: string
  userId: string
  sourceUrl: string
  sourceType: VideoSourceType
  title: string
  filename: string
}

const SOURCE_TYPE_LABELS: Record<VideoSourceType, string> = {
  upload: 'Upload',
  youtube: 'YouTube',
  direct_url: 'Direct URL',
}

const STATUS_LABELS: Record<string, string> = {
  uploaded: 'Uploaded',
  processing: 'Processing',
  transcribing: 'Transcribing',
  analyzing: 'Analyzing',
  ready: 'Ready',
  error: 'Error',
}

export function formatSourceType(sourceType: string): string {
  return SOURCE_TYPE_LABELS[sourceType as VideoSourceType] ?? sourceType
}

export function formatVideoStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export function formatVideoDisplayStatus(video: VideoWithJobs): string {
  const hasPendingJob = video.processing_jobs.some(
    (job) => job.status === 'pending',
  )
  if (hasPendingJob) {
    return 'Waiting for processing'
  }
  return formatVideoStatus(video.status)
}

export async function fetchVideos(projectId: string): Promise<VideoWithJobs[]> {
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const videoIds = videos.map((video) => video.id)
  const jobs = await fetchProcessingJobsByVideoId(videoIds)
  const jobsByVideoId = groupJobsByVideoId(jobs)

  return videos.map((video) => ({
    ...video,
    processing_jobs: jobsByVideoId.get(video.id) ?? [],
  }))
}

function groupJobsByVideoId(
  jobs: ProcessingJob[]
): Map<string, ProcessingJob[]> {
  const grouped = new Map<string, ProcessingJob[]>()
  for (const job of jobs) {
    const existing = grouped.get(job.video_id)
    if (existing) {
      existing.push(job)
    } else {
      grouped.set(job.video_id, [job])
    }
  }
  return grouped
}

export async function createVideo(input: CreateVideoInput): Promise<Video> {
  await fetchProject(input.projectId)

  const { data, error } = await supabase
    .from('videos')
    .insert({
      project_id: input.projectId,
      user_id: input.userId,
      title: input.title,
      filename: input.filename,
      storage_path: '',
      source_type: input.sourceType,
      source_url: input.sourceUrl,
      status: 'uploaded',
      processing_progress: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
