import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardUserService } from "@/services";
import {
  ProcessUserPayload,
  UpdateUserClearancePayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
} from "@/services/contracts/board/users";
import { Role, ClearanceLevel, Affiliation, UserStatus } from "@/types";

export interface BoardUserFilterParams {
  search?: string;
  role?: Role | "ALL";
  clearance?: ClearanceLevel | "ALL";
  affiliation?: Affiliation | "ALL";
  unprocessedOnly?: boolean;
  status?: UserStatus | "ALL";
}

export interface ProcessUserParams {
  payload: ProcessUserPayload;
  actorUserId: string;
  actorRole: string;
}

export interface UpdateClearanceParams {
  payload: UpdateUserClearancePayload;
  actorUserId: string;
  actorRole: string;
  actorClearance: string;
}

export interface UpdateRoleParams {
  payload: UpdateUserRolePayload;
  actorUserId: string;
  actorRole: string;
}

export interface UpdateStatusParams {
  payload: UpdateUserStatusPayload;
  actorUserId: string;
  actorRole: string;
}

export function useBoardUsers(filters?: BoardUserFilterParams) {
  return useQuery({
    queryKey: QUERY_KEYS.boardUsers.list(filters),
    queryFn: () => boardUserService.getUsers(filters),
  });
}

export function useBoardUserDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardUsers.detail(id),
    queryFn: () => boardUserService.getUserById(id),
    enabled: Boolean(id),
  });
}

export function useProcessUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId, actorRole }: ProcessUserParams) =>
      boardUserService.processUser(payload, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardUsers.detail(variables.payload.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
    },
  });
}

export function useUpdateUserClearance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId, actorRole, actorClearance }: UpdateClearanceParams) =>
      boardUserService.updateClearance(payload, actorUserId, actorRole, actorClearance),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardUsers.detail(variables.payload.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId, actorRole }: UpdateRoleParams) =>
      boardUserService.updateRole(payload, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardUsers.detail(variables.payload.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId, actorRole }: UpdateStatusParams) =>
      boardUserService.updateStatus(payload, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardUsers.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardUsers.detail(variables.payload.userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
    },
  });
}
