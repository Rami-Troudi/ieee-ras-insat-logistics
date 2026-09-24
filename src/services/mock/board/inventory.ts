import {
  IBoardInventoryService,
  CreateInventoryItemPayload,
  MutateStockPayload,
  UpdateAssetPayload,
} from "@/services/contracts/board/inventory";
import { InventoryItemSummary, InventoryEvent, IndividualAsset, AssetState, Role } from "@/types";
import { mockDb, MockDatabaseSchema } from "@/mocks/db";
import {
  assertInventoryConserved,
  inventoryState,
  moveUnits,
  recordInventoryEvent,
  StockBucket,
} from "./inventoryState";
import { requireOperatorInDraft, requireSuperadminInDraft } from "../authorization";

const bucketForState: Record<AssetState, StockBucket> = {
  AVAILABLE: "available",
  ALLOCATED: "allocated",
  BORROWED: "borrowed",
  DAMAGED: "damaged",
  MAINTENANCE: "maintenance",
  LOST: "lost",
};
const createAuditEvent = (
  draft: MockDatabaseSchema,
  actorUserId: string,
  actorName: string,
  actorRole: Role,
  action: string,
  entityId: string,
  before: unknown,
  after: unknown,
  reason: string
) => {
  draft.auditEvents.unshift({
    id: `aev-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    actorUserId,
    actorName,
    actorRole,
    action,
    entityType: "INVENTORY",
    entityId,
    before,
    after,
    reason,
  });
};

class MockBoardInventoryService implements IBoardInventoryService {
  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async getItems(filters?: {
    search?: string;
    category?: string;
    equipmentClass?: string;
    lowStockOnly?: boolean;
  }): Promise<InventoryItemSummary[]> {
    await this.simulateLatency();
    let items = mockDb.getSnapshot().inventory;
    if (filters?.category && filters.category !== "ALL")
      items = items.filter((item) => item.category === filters.category);
    if (filters?.equipmentClass && filters.equipmentClass !== "ALL")
      items = items.filter((item) => item.equipmentClass === filters.equipmentClass);
    if (filters?.lowStockOnly) items = items.filter((item) => item.availableQuantity <= 2);
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
      );
    }
    return items;
  }

  async getItemById(itemId: string): Promise<InventoryItemSummary | null> {
    await this.simulateLatency();
    return mockDb.getSnapshot().inventory.find((item) => item.id === itemId) ?? null;
  }

  async createItem(
    payload: CreateInventoryItemPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<InventoryItemSummary> {
    await this.simulateLatency();
    let created!: InventoryItemSummary;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      if (
        !payload.name.trim() ||
        !Number.isInteger(payload.totalQuantity) ||
        payload.totalQuantity <= 0
      )
        throw new Error("Name and positive whole-unit quantity are required");
      const initialAssets = payload.initialAssets ?? [];
      if (
        payload.trackingMode === "INDIVIDUAL_ASSET" &&
        initialAssets.length !== payload.totalQuantity
      )
        throw new Error("Enter one serial number for every individually tracked unit");
      if (payload.trackingMode === "QUANTITY" && initialAssets.length)
        throw new Error("Quantity-tracked items cannot have individual asset entries");
      const serials = initialAssets.map((asset) => asset.serialNumber.trim());
      if (serials.some((serial) => !serial) || new Set(serials).size !== serials.length)
        throw new Error("Asset serial numbers must be unique and nonempty");
      const id = `item-${crypto.randomUUID()}`;
      const assets: IndividualAsset[] =
        payload.trackingMode === "INDIVIDUAL_ASSET"
          ? initialAssets.map((asset, index) => ({
              id: `ast-${crypto.randomUUID()}`,
              serialNumber: serials[index],
              condition: asset.condition,
              state: "AVAILABLE",
            }))
          : [];
      created = {
        id,
        name: payload.name.trim(),
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
      assertInventoryConserved(created);
      draft.inventory.unshift(created);
      const after = inventoryState(created);
      const before = {
        total: 0,
        available: 0,
        allocated: 0,
        borrowed: 0,
        damaged: 0,
        maintenance: 0,
        lost: 0,
      };
      const event = recordInventoryEvent(
        draft,
        created,
        "ADD",
        payload.totalQuantity,
        before,
        actorUserId,
        actor.name,
        "Initial catalog entry creation"
      );
      if (assets.length) event.assetIds = assets.map((asset) => asset.id);
      createAuditEvent(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "INVENTORY_ADDED",
        id,
        before,
        after,
        "New inventory item registered"
      );
    });
    return created;
  }

  async mutateStock(
    payload: MutateStockPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<{ item: InventoryItemSummary; event: InventoryEvent }> {
    await this.simulateLatency();
    let itemResult!: InventoryItemSummary;
    let eventResult!: InventoryEvent;
    mockDb.mutate((draft) => {
      const sensitive = ["CORRECT", "REMOVE", "RETIRE", "CONSUME"].includes(payload.type);
      const actor = sensitive
        ? requireSuperadminInDraft(draft, actorUserId)
        : requireOperatorInDraft(draft, actorUserId);
      const item = draft.inventory.find((candidate) => candidate.id === payload.itemId);
      if (!item) throw new Error("Inventory item not found");
      if (!payload.reason.trim()) throw new Error("A reason is required for every stock movement");
      if (!Number.isInteger(payload.quantity))
        throw new Error("Stock movement must be a whole number");
      const before = inventoryState(item);
      const assetIds = payload.assetIds ?? (payload.assetId ? [payload.assetId] : []);
      const addedAssetIds: string[] = [];
      const qty = payload.quantity;
      const requireIds = (count: number) => {
        if (
          item.trackingMode === "INDIVIDUAL_ASSET" &&
          (assetIds.length !== count || new Set(assetIds).size !== count)
        )
          throw new Error(`Select exactly ${count} individual assets`);
        if (item.trackingMode === "QUANTITY" && assetIds.length)
          throw new Error("Quantity-tracked inventory does not accept asset IDs");
      };
      const addNewAssets = (count: number) => {
        if (assetIds.length)
          throw new Error("Additions require new asset metadata, not existing asset identifiers");
        if (item.trackingMode === "INDIVIDUAL_ASSET") {
          const additions = payload.newAssets ?? [];
          if (additions.length !== count)
            throw new Error(`Enter serial numbers for all ${count} added units`);
          const existing = new Set(item.assets?.map((asset) => asset.serialNumber) ?? []);
          const serials = additions.map((asset) => asset.serialNumber.trim());
          if (
            serials.some((serial) => !serial) ||
            new Set(serials).size !== serials.length ||
            serials.some((serial) => existing.has(serial))
          )
            throw new Error("Added asset serial numbers must be unique and nonempty");
          item.assets ??= [];
          additions.forEach((asset, index) => {
            const assetId = `ast-${crypto.randomUUID()}`;
            addedAssetIds.push(assetId);
            item.assets!.push({
              id: assetId,
              serialNumber: serials[index],
              condition: asset.condition,
              state: "AVAILABLE",
            });
          });
        } else if (payload.newAssets?.length)
          throw new Error("Quantity-tracked inventory cannot accept individual asset metadata");
      };
      const removeAvailable = (count: number) => {
        if (count > item.availableQuantity)
          throw new Error(`Only ${item.availableQuantity} units are available to remove`);
        requireIds(count);
        if (item.trackingMode === "INDIVIDUAL_ASSET") {
          const assets = assetIds.map((id) => item.assets?.find((asset) => asset.id === id));
          if (assets.some((asset) => !asset || asset.state !== "AVAILABLE"))
            throw new Error("Only available assets can be removed or retired");
          item.assets = item.assets!.filter((asset) => !assetIds.includes(asset.id));
        }
        item.availableQuantity -= count;
        item.totalQuantity -= count;
      };
      let eventQuantity = qty;
      switch (payload.type) {
        case "ADD":
          if (qty <= 0) throw new Error("Add quantity must be positive");
          addNewAssets(qty);
          item.availableQuantity += qty;
          item.totalQuantity += qty;
          break;
        case "REMOVE":
        case "RETIRE":
        case "CONSUME":
          if (qty <= 0) throw new Error("Removal quantity must be positive");
          removeAvailable(qty);
          break;
        case "CORRECT":
          if (qty === 0) throw new Error("Correction delta cannot be zero");
          if (qty > 0) {
            addNewAssets(qty);
            item.availableQuantity += qty;
            item.totalQuantity += qty;
          } else {
            removeAvailable(Math.abs(qty));
            eventQuantity = qty;
          }
          break;
        case "DAMAGE":
          if (qty <= 0) throw new Error("Damage quantity must be positive");
          requireIds(qty);
          moveUnits(
            item,
            "available",
            "damaged",
            qty,
            item.trackingMode === "INDIVIDUAL_ASSET" ? assetIds : undefined,
            "DAMAGED"
          );
          break;
        case "REPAIR":
          if (qty <= 0) throw new Error("Repair quantity must be positive");
          requireIds(qty);
          moveUnits(
            item,
            "damaged",
            "available",
            qty,
            item.trackingMode === "INDIVIDUAL_ASSET" ? assetIds : undefined,
            "GOOD"
          );
          break;
        case "RECOVER":
          if (qty <= 0) throw new Error("Recovery quantity must be positive");
          requireIds(qty);
          moveUnits(
            item,
            "lost",
            "available",
            qty,
            item.trackingMode === "INDIVIDUAL_ASSET" ? assetIds : undefined,
            "GOOD"
          );
          break;
        default:
          throw new Error(`${payload.type} is managed by its dedicated request or loan workflow`);
      }
      assertInventoryConserved(item);
      eventResult = recordInventoryEvent(
        draft,
        item,
        payload.type,
        eventQuantity,
        before,
        actorUserId,
        actor.name,
        payload.reason,
        assetIds.length === 1 ? assetIds[0] : undefined
      );
      const changedAssetIds = [...assetIds, ...addedAssetIds];
      if (changedAssetIds.length) eventResult.assetIds = changedAssetIds;
      createAuditEvent(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        `INVENTORY_${payload.type}`,
        item.id,
        before,
        inventoryState(item),
        payload.reason
      );
      itemResult = structuredClone(item);
    });
    return { item: itemResult, event: eventResult };
  }

  async updateAsset(
    payload: UpdateAssetPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<IndividualAsset> {
    await this.simulateLatency();
    let updated!: IndividualAsset;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const item = draft.inventory.find((candidate) => candidate.id === payload.itemId);
      if (!item?.assets) throw new Error("Item or asset list not found");
      const asset = item.assets.find((candidate) => candidate.id === payload.assetId);
      if (!asset) throw new Error("Asset unit not found");
      const allowed = new Set<AssetState>(["AVAILABLE", "DAMAGED", "MAINTENANCE"]);
      const newState =
        payload.state ??
        (payload.isAvailable === true
          ? "AVAILABLE"
          : payload.isAvailable === false
            ? payload.condition === "DAMAGED"
              ? "DAMAGED"
              : "MAINTENANCE"
            : asset.state);
      if (!allowed.has(asset.state) || !allowed.has(newState))
        throw new Error(
          "Asset allocation, custody, and loss states must use their dedicated workflows"
        );
      const before = inventoryState(item);
      const oldState = asset.state;
      if (oldState !== newState)
        moveUnits(
          item,
          bucketForState[oldState],
          bucketForState[newState],
          1,
          [asset.id],
          payload.condition
        );
      else asset.condition = payload.condition;
      if (payload.notes !== undefined) asset.notes = payload.notes;
      assertInventoryConserved(item);
      updated = structuredClone(asset);
      recordInventoryEvent(
        draft,
        item,
        "CORRECT",
        oldState === newState ? 0 : 1,
        before,
        actorUserId,
        actor.name,
        payload.notes?.trim() || `Asset ${asset.serialNumber} set to ${newState}`,
        asset.id
      );
      createAuditEvent(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "ASSET_STATE_CHANGED",
        item.id,
        { state: oldState },
        updated,
        payload.notes?.trim() || `Asset ${asset.serialNumber} updated`
      );
    });
    return updated;
  }

  async getMovementHistory(itemId?: string): Promise<InventoryEvent[]> {
    await this.simulateLatency();
    let events = mockDb.getSnapshot().inventoryEvents;
    if (itemId) events = events.filter((event) => event.itemId === itemId);
    return events.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  }
}

export const mockBoardInventoryService = new MockBoardInventoryService();
