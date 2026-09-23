import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";
import { InventoryQueryFilter } from "@/types";
import { useSession } from "@/hooks/useSession";

export function useInventoryItems(filters?: InventoryQueryFilter) {
  const { currentPersona } = useSession();
  return useQuery({
    queryKey: QUERY_KEYS.inventory.list({
      ...filters,
      userId: currentPersona.id,
      clearance: currentPersona.clearance,
      status: currentPersona.status,
      strikesCount: currentPersona.strikesCount,
    }),
    queryFn: () => inventoryService.listItems(filters, currentPersona.id),
  });
}

export function useInventoryItem(id: string) {
  const { currentPersona } = useSession();
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.inventory.detail(id),
      currentPersona.id,
      currentPersona.clearance,
      currentPersona.status,
      currentPersona.strikesCount,
    ],
    queryFn: () => inventoryService.getItem(id, currentPersona.id),
    enabled: !!id,
  });
}

export function useInventoryCategories() {
  const { currentPersona } = useSession();
  return useQuery({
    queryKey: [...QUERY_KEYS.inventory.categories, currentPersona.id, currentPersona.clearance],
    queryFn: () => inventoryService.getCategories(currentPersona.id),
  });
}
