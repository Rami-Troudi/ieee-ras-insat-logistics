import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/app/query-client";
import { boardInventoryService, CreateInventoryItemPayload, MutateStockPayload } from "@/services";

export function useBoardInventory(filters?: {
  search?: string;
  category?: string;
  equipmentClass?: string;
  lowStockOnly?: boolean;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.boardInventory.list(filters),
    queryFn: () => boardInventoryService.getItems(filters),
  });
}

export function useBoardItemDetail(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardInventory.detail(id),
    queryFn: () => boardInventoryService.getItemById(id),
    enabled: Boolean(id),
  });
}

export function useBoardItemEvents(itemId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.boardInventory.events(itemId),
    queryFn: () => boardInventoryService.getMovementHistory(itemId),
    enabled: Boolean(itemId),
  });
}

export function useMutateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { payload: MutateStockPayload; actorUserId: string; actorRole: string }) =>
      boardInventoryService.mutateStock(params.payload, params.actorUserId, params.actorRole),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardInventory.detail(variables.payload.itemId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardInventory.events(variables.payload.itemId),
      });
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      payload: CreateInventoryItemPayload;
      actorUserId: string;
      actorRole: string;
    }) => boardInventoryService.createItem(params.payload, params.actorUserId, params.actorRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
    },
  });
}

export function useSetBorrowerVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { itemId: string; visible: boolean; actorUserId: string }) =>
      boardInventoryService.setBorrowerVisibility(
        params.itemId,
        params.visible,
        params.actorUserId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.boardInventory.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.boardInventory.detail(variables.itemId),
      });
    },
  });
}
