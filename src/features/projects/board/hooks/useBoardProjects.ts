import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardProjectService } from "@/services";
import { CreateProjectPayload, UpdateProjectPayload } from "@/services/contracts/board/projects";

export interface BoardProjectFilterParams {
  search?: string;
  status?: string;
}

export interface CreateProjectParams extends CreateProjectPayload {
  actorUserId: string;
  actorRole: string;
}

export interface UpdateProjectParams extends UpdateProjectPayload {
  actorUserId: string;
  actorRole: string;
}

export interface ProjectMemberParams {
  projectId: string;
  userId: string;
  actorUserId: string;
  actorRole: string;
}

export function useBoardProjects(filters?: BoardProjectFilterParams) {
  return useQuery({
    queryKey: QUERY_KEYS.boardProjects.list(filters),
    queryFn: () => boardProjectService.getProjects(filters),
  });
}

export function useBoardProjectDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardProjects.detail(id),
    queryFn: () => boardProjectService.getProjectById(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actorUserId, actorRole, ...payload }: CreateProjectParams) =>
      boardProjectService.createProject(payload, actorUserId, actorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardProjects.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.active });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actorUserId, actorRole, ...payload }: UpdateProjectParams) =>
      boardProjectService.updateProject(payload, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardProjects.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.active });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardProjects.detail(variables.projectId),
      });
    },
  });
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId, actorUserId, actorRole }: ProjectMemberParams) =>
      boardProjectService.assignMember(projectId, userId, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardProjects.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardProjects.detail(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId, actorUserId, actorRole }: ProjectMemberParams) =>
      boardProjectService.removeMember(projectId, userId, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardProjects.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardProjects.detail(variables.projectId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
    },
  });
}
