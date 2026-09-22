import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardExportService, ExportDatasetType, ExportResult } from "@/services";

export function useExportCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      dataset: ExportDatasetType;
      actorUserId: string;
      actorRole: string;
    }): Promise<ExportResult> =>
      boardExportService.exportCsv(params.dataset, params.actorUserId, params.actorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardAuditLog.all });
    },
  });
}
