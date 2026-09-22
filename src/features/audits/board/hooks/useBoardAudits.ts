import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardAuditService, StartAuditPayload, RecordPhysicalCountPayload } from "@/services";

export function useBoardAudits(status?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardAudits.list,
    queryFn: () => boardAuditService.getAudits(status),
  });
}

export function useBoardAuditDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardAudits.detail(id),
    queryFn: () => boardAuditService.getAuditById(id),
    enabled: Boolean(id),
  });
}

export function useStartAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { payload: StartAuditPayload; actorUserId: string; actorRole: string }) =>
      boardAuditService.startAudit(params.payload, params.actorUserId, params.actorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAudits.all });
    },
  });
}

export function useRecordAuditCounts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      payload: RecordPhysicalCountPayload;
      actorUserId: string;
      actorRole: string;
    }) => boardAuditService.recordCounts(params.payload, params.actorUserId, params.actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAudits.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardAudits.detail(variables.payload.auditId),
      });
    },
  });
}

export function useCompleteAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { auditId: string; actorUserId: string; actorRole: string }) =>
      boardAuditService.completeAudit(params.auditId, params.actorUserId, params.actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAudits.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAudits.detail(variables.auditId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
    },
  });
}
