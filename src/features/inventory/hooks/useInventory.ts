import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, favoritesService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";
import { InventoryQueryFilter } from "@/types";

export function useInventoryItems(filters?: InventoryQueryFilter) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.list(filters as Record<string, unknown>),
    queryFn: () => inventoryService.listItems(filters),
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

export function useUserFavorites(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.favorites.mine(userId),
    queryFn: () => favoritesService.getFavoriteIds(userId),
    enabled: !!userId,
  });
}

export function useToggleFavorite(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => favoritesService.toggleFavorite(userId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites.mine(userId) });
    },
  });
}
