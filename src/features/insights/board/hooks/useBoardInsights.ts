import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardInsightsService } from "@/services";

export function useBoardInsights() {
  return useQuery({
    queryKey: QUERY_KEYS.boardInsights.data,
    queryFn: () => boardInsightsService.getInsights(),
  });
}
