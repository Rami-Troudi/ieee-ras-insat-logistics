import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardLoanService } from "@/services";
import { BoardLoanFilterParams, ConfirmReturnPayload } from "@/services/contracts/board/loans";

export interface ConfirmReturnMutationParams {
  payload: ConfirmReturnPayload;
  actorUserId: string;
}

export function useBoardLoans(filters?: BoardLoanFilterParams) {
  return useQuery({
    queryKey: QUERY_KEYS.boardLoans.list(filters),
    queryFn: () => boardLoanService.getLoans(filters),
  });
}

export function useBoardLoanDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardLoans.detail(id),
    queryFn: () => boardLoanService.getLoanById(id),
    enabled: Boolean(id),
  });
}

export function useConfirmReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, actorUserId }: ConfirmReturnMutationParams) =>
      boardLoanService.confirmReturn(payload, actorUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardLoans.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardLoans.detail(variables.payload.loanId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardDiscipline.all });
    },
  });
}

export function useUpdateLoanDueDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      dueDate,
      actorUserId,
    }: {
      loanId: string;
      dueDate: string;
      actorUserId: string;
    }) => boardLoanService.updateDueDate(loanId, dueDate, actorUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardLoans.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loans.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardLoans.detail(variables.loanId),
      });
    },
  });
}
