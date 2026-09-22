import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loanService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";
import { RequestExtensionPayload, RequestReturnPayload } from "@/types";

export function useUserLoans(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.loans.mine(userId),
    queryFn: () => loanService.listUserLoans(userId),
    enabled: !!userId,
  });
}

export function useLoanDetail(id: string, userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.loans.detail(id),
    queryFn: () => loanService.getLoan(id, userId),
    enabled: !!id,
  });
}

export function useRequestExtension(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestExtensionPayload) => loanService.requestExtension(payload, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.mine(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.detail(data.id) });
    },
  });
}

export function useRequestReturn(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestReturnPayload) => loanService.requestReturn(payload, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.mine(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.detail(data.id) });
    },
  });
}
