import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardAuditLogService } from "@/services";

export function useBoardAuditLog(filters?: {
  action?: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.boardAuditLog.list(filters),
    queryFn: () => boardAuditLogService.getEvents(filters),
  });
}
