import { MockDatabaseSchema } from "@/mocks/db";
import {
  AssetCondition,
  AssetState,
  InventoryEvent,
  InventoryEventType,
  InventoryItemSummary,
  InventoryQuantityState,
} from "@/types";

export type StockBucket =
  "available" | "allocated" | "borrowed" | "damaged" | "maintenance" | "lost";

const fields: Record<StockBucket, keyof InventoryItemSummary> = {
  available: "availableQuantity",
  allocated: "allocatedQuantity",
  borrowed: "borrowedQuantity",
  damaged: "damagedQuantity",
  maintenance: "maintenanceQuantity",
  lost: "lostQuantity",
};

const assetStates: Record<StockBucket, AssetState> = {
  available: "AVAILABLE",
  allocated: "ALLOCATED",
  borrowed: "BORROWED",
  damaged: "DAMAGED",
  maintenance: "MAINTENANCE",
  lost: "LOST",
};

export function inventoryState(item: InventoryItemSummary): InventoryQuantityState {
  return {
    total: item.totalQuantity,
    available: item.availableQuantity,
    allocated: item.allocatedQuantity,
    borrowed: item.borrowedQuantity,
    damaged: item.damagedQuantity,
    maintenance: item.maintenanceQuantity,
    lost: item.lostQuantity,
  };
}

export function onSiteQuantity(state: InventoryQuantityState): number {
  return state.available + state.allocated + state.damaged + state.maintenance;
}

export function assertInventoryConserved(item: InventoryItemSummary): void {
  const state = inventoryState(item);
  const buckets = [
    state.available,
    state.allocated,
    state.borrowed,
    state.damaged,
    state.maintenance,
    state.lost,
  ];
  if (
    !Number.isInteger(state.total) ||
    state.total < 0 ||
    buckets.some((count) => !Number.isInteger(count) || count < 0) ||
    buckets.reduce((sum, count) => sum + count, 0) !== state.total
  )
    throw new Error(`Inventory conservation failed for ${item.id}`);
  if (item.trackingMode === "INDIVIDUAL_ASSET") {
    if (!item.assets || item.assets.length !== state.total) {
      throw new Error(`Asset registry does not match owned inventory for ${item.id}`);
    }
    for (const bucket of Object.keys(assetStates) as StockBucket[]) {
      const count = item.assets.filter((asset) => asset.state === assetStates[bucket]).length;
      if (count !== Number(item[fields[bucket]])) {
        throw new Error(`Asset ${bucket} count differs from aggregate for ${item.id}`);
      }
    }
  }
}

export function moveUnits(
  item: InventoryItemSummary,
  from: StockBucket,
  to: StockBucket,
  quantity: number,
  assetIds?: string[],
  condition?: AssetCondition
): void {
  if (!Number.isInteger(quantity) || quantity <= 0 || from === to) {
    throw new Error("Invalid inventory movement");
  }
  const fromField = fields[from];
  const toField = fields[to];
  if (Number(item[fromField]) < quantity) throw new Error("Insufficient stock in source state");
  if (item.trackingMode === "INDIVIDUAL_ASSET") {
    if (!assetIds || assetIds.length !== quantity || new Set(assetIds).size !== quantity) {
      throw new Error("Exact distinct asset IDs required");
    }
    const assets = assetIds.map((id) => item.assets?.find((asset) => asset.id === id));
    if (assets.some((asset) => !asset || asset.state !== assetStates[from])) {
      throw new Error("Asset is absent or not in the expected state");
    }
    assets.forEach((asset) => {
      asset!.state = assetStates[to];
      if (condition) asset!.condition = condition;
      else if (to === "lost") asset!.condition = "LOST";
    });
  } else if (assetIds?.length) {
    throw new Error("Quantity-tracked items do not accept asset IDs");
  }
  (item as unknown as Record<string, number>)[fromField] -= quantity;
  (item as unknown as Record<string, number>)[toField] += quantity;
  assertInventoryConserved(item);
}

export function recordInventoryEvent(
  draft: MockDatabaseSchema,
  item: InventoryItemSummary,
  type: InventoryEventType,
  quantity: number,
  beforeState: InventoryQuantityState,
  actorUserId: string,
  actorName: string,
  reason: string,
  assetId?: string
): InventoryEvent {
  const event: InventoryEvent = {
    id: `iev-${crypto.randomUUID()}`,
    itemId: item.id,
    itemName: item.name,
    ...(assetId ? { assetId } : {}),
    type,
    quantity,
    beforeState,
    afterState: inventoryState(item),
    reason,
    actorUserId,
    actorName,
    timestamp: new Date().toISOString(),
  };
  draft.inventoryEvents.unshift(event);
  return event;
}
