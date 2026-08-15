import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import {
  createProject,
  fetchProjects,
  type CreateProjectInput,
  type Project,
} from '@/lib/projects'

export function useProjects() {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: ['projects', userId],
    queryFn: fetchProjects,
    enabled: Boolean(userId),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id

  return useMutation({
    mutationFn: (input: Omit<CreateProjectInput, 'userId'>) =>
      createProject({ ...input, userId: userId! }),
    onSuccess: (newProject) => {
      queryClient.setQueryData<Project[]>(
        ['projects', userId],
        (existing) => existing ? [newProject, ...existing] : [newProject],
      )
      queryClient.invalidateQueries({ queryKey: ['projects', userId] })
    },
  })
}
