import { useQuery } from "@tanstack/react-query";
import { loanService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";

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
