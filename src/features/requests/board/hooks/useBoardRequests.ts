import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardRequestService } from "@/services";
import {
  RequestFilterParams,
  ReviewRequestPayload,
  HandoverPayload,
} from "@/services/contracts/board/requests";

export interface ReviewBorrowRequestParams {
  payload: ReviewRequestPayload;
  actorUserId: string;
  actorRole: string;
  actorClearance: string;
}

export interface RejectEntireRequestParams {
  requestId: string;
  reason: string;
  actorUserId: string;
  actorRole: string;
}

export interface ConfirmHandoverParams {
  payload: HandoverPayload;
  actorUserId: string;
  actorRole: string;
}

export function useBoardRequests(filters?: RequestFilterParams) {
  return useQuery({
    queryKey: QUERY_KEYS.boardRequests.list(filters),
    queryFn: () => boardRequestService.getRequests(filters),
  });
}

export function useBoardRequestDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardRequests.detail(id),
    queryFn: () => boardRequestService.getRequestById(id),
    enabled: Boolean(id),
  });
}

export function useReviewBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId, actorRole, actorClearance }: ReviewBorrowRequestParams) =>
      boardRequestService.reviewRequest(payload, actorUserId, actorRole, actorClearance),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardRequests.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardRequests.detail(variables.payload.requestId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAllocations.all });
    },
  });
}

export function useRejectEntireRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reason, actorUserId, actorRole }: RejectEntireRequestParams) =>
      boardRequestService.rejectEntireRequest(requestId, reason, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardRequests.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardRequests.detail(variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
    },
  });
}

export function useConfirmHandover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId, actorRole }: ConfirmHandoverParams) =>
      boardRequestService.confirmHandover(payload, actorUserId, actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardRequests.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.requests.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardRequests.detail(variables.payload.requestId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardLoans.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardActionCenter.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAllocations.all });
    },
  });
}
