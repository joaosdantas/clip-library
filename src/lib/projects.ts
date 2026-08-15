import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type Project = Database['public']['Tables']['projects']['Row']

export interface CreateProjectInput {
  name: string
  description?: string
  userId: string
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchProject(projectId: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: input.name,
      description: input.description?.trim() || null,
      user_id: input.userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
