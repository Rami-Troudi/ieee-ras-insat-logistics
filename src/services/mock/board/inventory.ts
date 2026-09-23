import {
  IBoardInventoryService,
  CreateInventoryItemPayload,
  MutateStockPayload,
  UpdateAssetPayload,
} from "@/services/contracts/board/inventory";
import { InventoryItemSummary, InventoryEvent, IndividualAsset, Role, AssetState } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import { inventoryState, assertInventoryConserved } from "./inventoryState";

class MockBoardInventoryService implements IBoardInventoryService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getItems(filters?: {
    search?: string;
    category?: string;
    equipmentClass?: string;
    lowStockOnly?: boolean;
  }): Promise<InventoryItemSummary[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let items = [...snapshot.inventory];

    if (filters?.category && filters.category !== "ALL") {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters?.equipmentClass && filters.equipmentClass !== "ALL") {
      items = items.filter((i) => i.equipmentClass === filters.equipmentClass);
    }
    if (filters?.lowStockOnly) {
      items = items.filter((i) => i.availableQuantity <= 2);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.location && i.location.toLowerCase().includes(q))
      );
    }

    return items;
  }

  async getItemById(itemId: string): Promise<InventoryItemSummary | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const item = snapshot.inventory.find((i) => i.id === itemId);
    return item ? { ...item } : null;
  }

  async createItem(
    payload: CreateInventoryItemPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryItemSummary> {
    await this.simulateLatency();
    let newItem: InventoryItemSummary | null = null;

    mockDb.mutate((draft) => {
      const itemId = `item-${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36).slice(-4)}`;
      const assets: IndividualAsset[] =
        payload.trackingMode === "INDIVIDUAL_ASSET"
          ? (payload.initialAssets || []).map((a, idx) => ({
              id: `ast-${itemId}-${idx + 1}`,
              serialNumber: a.serialNumber,
              condition: a.condition,
              state: "AVAILABLE" as AssetState,
            }))
          : [];

      const created: InventoryItemSummary = {
        id: itemId,
        name: payload.name,
        category: payload.category,
        equipmentClass: payload.equipmentClass,
        trackingMode: payload.trackingMode,
        totalQuantity: payload.totalQuantity,
        availableQuantity: payload.totalQuantity,
        allocatedQuantity: 0,
        borrowedQuantity: 0,
        damagedQuantity: 0,
        maintenanceQuantity: 0,
        lostQuantity: 0,
        description: payload.description,
        location: payload.location,
        specifications: payload.specifications,
        assets,
      };

      newItem = created;
      draft.inventory.unshift(created);

      // Log initial inventory event
      draft.inventoryEvents.unshift({
        id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: created.id,
        itemName: created.name,
        type: "ADD",
        quantity: payload.totalQuantity,
        beforeState: {
          total: 0,
          available: 0,
          allocated: 0,
          borrowed: 0,
          damaged: 0,
          maintenance: 0,
          lost: 0,
        },
        afterState: inventoryState(created),
        reason: "Initial catalog entry creation",
        actorUserId,
        actorName: "Board Custodian",
        timestamp: new Date().toISOString(),
      });
    });

    if (newItem) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "INVENTORY_ADDED",
        entityType: "INVENTORY",
        entityId: (newItem as InventoryItemSummary).id,
        after: newItem,
        reason: "New inventory item registered in catalog",
      });
      return newItem;
    }
    throw new Error("Failed to create inventory item");
  }

  async mutateStock(
    payload: MutateStockPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<{ item: InventoryItemSummary; event: InventoryEvent }> {
    await this.simulateLatency();
    let updatedItem: InventoryItemSummary | null = null;
    let createdEvent: InventoryEvent | null = null;

    mockDb.mutate((draft) => {
      const item = draft.inventory.find((i) => i.id === payload.itemId);
      if (!item) throw new Error("Inventory item not found");

      const before = inventoryState(item);

      const qty = payload.quantity;
      if (qty <= 0) throw new Error("Mutation quantity must be greater than 0");

      switch (payload.type) {
        case "ADD":
          item.totalQuantity += qty;
          item.availableQuantity += qty;
          break;

        case "REMOVE":
        case "RETIRE":
        case "CONSUME":
          if (qty > item.availableQuantity) {
            throw new Error(
              `Cannot remove ${qty} units; only ${item.availableQuantity} available in unreserved stock`
            );
          }
          item.totalQuantity = Math.max(0, item.totalQuantity - qty);
          item.availableQuantity = Math.max(0, item.availableQuantity - qty);
          break;

        case "DAMAGE":
          if (qty > item.availableQuantity) {
            throw new Error(
              `Cannot mark ${qty} units as damaged; only ${item.availableQuantity} available in unreserved stock`
            );
          }
          item.availableQuantity = Math.max(0, item.availableQuantity - qty);
          item.damagedQuantity += qty;
          break;

        case "REPAIR":
        case "RECOVER":
          if (qty > item.damagedQuantity) {
            throw new Error(
              `Cannot repair/recover ${qty} units; only ${item.damagedQuantity} recorded as damaged`
            );
          }
          item.damagedQuantity = Math.max(0, item.damagedQuantity - qty);
          item.availableQuantity += qty;
          break;

        case "CORRECT": {
          // Absolute reconciliation correction of available quantity
          const delta = qty - item.availableQuantity;
          item.availableQuantity = qty;
          item.totalQuantity = Math.max(0, item.totalQuantity + delta);
          break;
        }

        default:
          throw new Error(`Unsupported stock mutation type: ${payload.type}`);
      }

      if (payload.assetId && item.assets) {
        const asset = item.assets.find((a) => a.id === payload.assetId);
        if (asset) {
          if (payload.condition) asset.condition = payload.condition;
          if (payload.type === "DAMAGE") {
            asset.state = "DAMAGED";
          } else if (payload.type === "RETIRE") {
            asset.state = "RETIRED";
          } else if (payload.type === "REPAIR" || payload.type === "RECOVER") {
            asset.state = "AVAILABLE";
          }
        }
      }

      const after = inventoryState(item);

      createdEvent = {
        id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: item.id,
        itemName: item.name,
        assetId: payload.assetId,
        type: payload.type,
        quantity: qty,
        beforeState: before,
        afterState: after,
        reason: payload.reason,
        actorUserId,
        actorName: "Board Custodian",
        timestamp: new Date().toISOString(),
      };

      draft.inventoryEvents.unshift(createdEvent);
      updatedItem = { ...item };
    });

    if (updatedItem && createdEvent) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: `INVENTORY_${payload.type}`,
        entityType: "INVENTORY",
        entityId: (updatedItem as InventoryItemSummary).id,
        before: (createdEvent as InventoryEvent).beforeState,
        after: (createdEvent as InventoryEvent).afterState,
        reason: payload.reason,
      });

      return { item: updatedItem, event: createdEvent };
    }
    throw new Error("Failed to execute stock mutation");
  }

  async updateAsset(
    payload: UpdateAssetPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<IndividualAsset> {
    await this.simulateLatency();
    let updatedAsset: IndividualAsset | null = null;

    mockDb.mutate((draft) => {
      const item = draft.inventory.find((i) => i.id === payload.itemId);
      if (!item || !item.assets) throw new Error("Item or asset list not found");

      const asset = item.assets.find((a) => a.id === payload.assetId);
      if (!asset) throw new Error("Asset unit not found");

      const oldState = asset.state;
      let newState: AssetState = oldState;
      if (payload.state) {
        newState = payload.state;
      } else if (payload.isAvailable !== undefined) {
        newState = payload.isAvailable
          ? "AVAILABLE"
          : payload.condition === "DAMAGED"
            ? "DAMAGED"
            : "MAINTENANCE";
      }
      asset.condition = payload.condition;
      asset.state = newState;
      if (payload.notes) asset.notes = payload.notes;

      // Synchronize aggregate item counters atomically if state changed
      if (oldState !== newState) {
        const stateToField: Record<string, keyof InventoryItemSummary> = {
          AVAILABLE: "availableQuantity",
          ALLOCATED: "allocatedQuantity",
          BORROWED: "borrowedQuantity",
          DAMAGED: "damagedQuantity",
          MAINTENANCE: "maintenanceQuantity",
          LOST: "lostQuantity",
        };
        const oldField = stateToField[oldState];
        const newField = stateToField[newState];
        if (oldField && typeof item[oldField] === "number") {
          (item[oldField] as number) = Math.max(0, (item[oldField] as number) - 1);
        }
        if (newField && typeof item[newField] === "number") {
          (item[newField] as number) += 1;
        }
        assertInventoryConserved(item);
      }

      updatedAsset = { ...asset };
    });

    if (updatedAsset) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "INVENTORY_CORRECTED",
        entityType: "INVENTORY",
        entityId: payload.itemId,
        after: updatedAsset,
        reason: `Updated asset unit ${payload.assetId} condition to ${payload.condition}`,
      });
      return updatedAsset;
    }
    throw new Error("Failed to update asset");
  }

  async getMovementHistory(itemId?: string): Promise<InventoryEvent[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let events = [...snapshot.inventoryEvents];
    if (itemId) {
      events = events.filter((e) => e.itemId === itemId);
    }
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const mockBoardInventoryService = new MockBoardInventoryService();
