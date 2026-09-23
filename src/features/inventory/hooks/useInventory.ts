import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";
import { InventoryQueryFilter } from "@/types";

export function useInventoryItems(filters?: InventoryQueryFilter, userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.list({ ...(filters as Record<string, unknown>), userId }),
    queryFn: () => inventoryService.listItems(filters, userId),
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.detail(id),
    queryFn: () => inventoryService.getItem(id),
    enabled: !!id,
  });
}

export function useInventoryCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.categories,
    queryFn: () => inventoryService.getCategories(),
  });
}
