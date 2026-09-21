import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestService, projectService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";
import { CreateBorrowRequestPayload } from "@/types";

export function useUserRequests(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.requests.mine(userId),
    queryFn: () => requestService.listUserRequests(userId),
    enabled: !!userId,
  });
}

export function useRequestDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.requests.detail(id),
    queryFn: () => requestService.getRequest(id),
    enabled: !!id,
  });
}

export function useActiveProjects() {
  return useQuery({
    queryKey: QUERY_KEYS.projects.active,
    queryFn: () => projectService.listActiveProjects(),
  });
}

export function useCreateRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBorrowRequestPayload) =>
      requestService.createRequest(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests.mine(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.detail(userId) });
    },
  });
}

export function useCancelRequest(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason?: string }) =>
      requestService.cancelRequest(requestId, userId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests.mine(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests.detail(data.id) });
    },
  });
}
