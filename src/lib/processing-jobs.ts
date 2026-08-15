import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type ProcessingJob =
  Database['public']['Tables']['processing_jobs']['Row']

export type ProcessingJobType =
  | 'download'
  | 'transcription'
  | 'analysis'
  | 'clip_generation'

export type ProcessingJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface CreateProcessingJobInput {
  videoId: string
  userId: string
  type: ProcessingJobType
}

export async function createProcessingJob(
  input: CreateProcessingJobInput
): Promise<ProcessingJob> {
  const { data, error } = await supabase
    .from('processing_jobs')
    .insert({
      video_id: input.videoId,
      user_id: input.userId,
      type: input.type,
      status: 'pending',
      progress: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchProcessingJobsByVideoId(
  videoIds: string[]
): Promise<ProcessingJob[]> {
  if (videoIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('processing_jobs')
    .select('*')
    .in('video_id', videoIds)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
