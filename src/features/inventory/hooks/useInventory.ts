import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, favoritesService } from "@/services";
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
    onMutate: async (itemId: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.favorites.mine(userId) });
      const previousFavorites =
        queryClient.getQueryData<string[]>(QUERY_KEYS.favorites.mine(userId)) || [];
      const isFav = previousFavorites.includes(itemId);
      const nextFavorites = isFav
        ? previousFavorites.filter((id) => id !== itemId)
        : [...previousFavorites, itemId];
      queryClient.setQueryData(QUERY_KEYS.favorites.mine(userId), nextFavorites);
      return { previousFavorites };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(QUERY_KEYS.favorites.mine(userId), context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites.mine(userId) });
    },
  });
}
