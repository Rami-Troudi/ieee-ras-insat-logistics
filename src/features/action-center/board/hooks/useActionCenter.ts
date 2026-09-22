import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardActionCenterService } from "@/services";

export function useBoardActionCenter() {
  const query = useQuery({
    queryKey: QUERY_KEYS.boardActionCenter.queue,
    queryFn: () => boardActionCenterService.getActions(),
  });

  return {
    ...query,
    actions: query.data || [],
  };
}
