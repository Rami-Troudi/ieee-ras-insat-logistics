import {
  IBoardAuditService,
  StartAuditPayload,
  RecordPhysicalCountPayload,
  ReconcileAuditDiscrepancyPayload,
} from "@/services/contracts/board/audits";
import { InventoryAudit, InventoryAuditItem, InventoryEvent, Role } from "@/types";
import { mockDb, MockDatabaseSchema } from "@/mocks/db";
import { requireOperatorInDraft } from "../authorization";
import {
  assertInventoryConserved,
  inventoryState,
  onSiteQuantity,
  recordInventoryEvent,
} from "./inventoryState";

const auditLog = (
  draft: MockDatabaseSchema,
  actorUserId: string,
  actorName: string,
  actorRole: Role,
  action: string,
  entityId: string,
  before: unknown,
  after: unknown,
  reason: string,
  entityType: "AUDIT" | "INVENTORY" = "AUDIT"
) => {
  draft.auditEvents.unshift({
    id: `aev-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    actorUserId,
    actorName,
    actorRole,
    action,
    entityType,
    entityId,
    before,
    after,
    reason,
  });
};

class MockBoardAuditService implements IBoardAuditService {
  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async getAudits(status?: string): Promise<InventoryAudit[]> {
    await this.simulateLatency();
    let audits = mockDb.getSnapshot().audits;
    if (status && status !== "ALL") audits = audits.filter((audit) => audit.status === status);
    return audits.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
  }

  async getAuditById(auditId: string): Promise<InventoryAudit | null> {
    await this.simulateLatency();
    return mockDb.getSnapshot().audits.find((audit) => audit.id === auditId) ?? null;
  }

  async startAudit(
    payload: StartAuditPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let result!: InventoryAudit;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const startedAt = new Date().toISOString();
      let items = draft.inventory;
      if (payload.categoryFilter && payload.categoryFilter !== "ALL")
        items = items.filter((item) => item.category === payload.categoryFilter);
      const auditItems: InventoryAuditItem[] = items.map((item) => {
        const physical = onSiteQuantity(inventoryState(item));
        return {
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          equipmentClass: item.equipmentClass,
          expectedSnapshotQuantity: physical,
          movementsSinceSnapshot: 0,
          adjustedExpectedQuantity: physical,
          status: "PENDING_COUNT",
        };
      });
      result = {
        id: `aud-${crypto.randomUUID()}`,
        title: payload.title,
        startedAt,
        startedBy: actorUserId,
        startedByName: actor.name,
        status: "IN_PROGRESS",
        snapshotAt: startedAt,
        items: auditItems,
        notes: payload.notes,
      };
      draft.audits.unshift(result);
      auditLog(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "AUDIT_STARTED",
        result.id,
        undefined,
        result,
        payload.title
      );
    });
    return result;
  }

  async recordCounts(
    payload: RecordPhysicalCountPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let result!: InventoryAudit;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const audit = draft.audits.find((entry) => entry.id === payload.auditId);
      if (!audit || audit.status !== "IN_PROGRESS") throw new Error("In-progress audit not found");
      if (new Set(payload.counts.map((entry) => entry.itemId)).size !== payload.counts.length)
        throw new Error("Each audit line can be counted once per save");
      const timestamp = new Date().toISOString();
      const snapshotTime = Date.parse(audit.snapshotAt);
      for (const count of payload.counts) {
        if (!Number.isInteger(count.physicalCount) || count.physicalCount < 0)
          throw new Error("Physical counts must be nonnegative whole numbers");
        const line = audit.items.find((entry) => entry.itemId === count.itemId);
        if (!line) throw new Error(`Item ${count.itemId} is not part of this audit`);
        const movements = draft.inventoryEvents.filter(
          (event) => event.itemId === line.itemId && Date.parse(event.timestamp) >= snapshotTime
        );
        const netDelta = movements.reduce(
          (sum, event) =>
            sum + onSiteQuantity(event.afterState) - onSiteQuantity(event.beforeState),
          0
        );
        line.movementsSinceSnapshot = netDelta;
        line.adjustedExpectedQuantity = line.expectedSnapshotQuantity + netDelta;
        line.physicalCount = count.physicalCount;
        line.countedAt = timestamp;
        line.discrepancy = count.physicalCount - line.adjustedExpectedQuantity;
        line.status = line.discrepancy === 0 ? "MATCHED" : "DISCREPANCY";
        if (count.notes !== undefined) line.resolutionNotes = count.notes;
      }
      audit.updatedAt = timestamp;
      result = structuredClone(audit);
      auditLog(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "AUDIT_COUNTS_RECORDED",
        audit.id,
        undefined,
        result,
        "Physical counts recorded"
      );
    });
    return result;
  }

  async reconcileItem(
    payload: ReconcileAuditDiscrepancyPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let result!: InventoryAudit;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const audit = draft.audits.find((entry) => entry.id === payload.auditId);
      if (!audit || audit.status !== "IN_PROGRESS") throw new Error("In-progress audit not found");
      const line = audit.items.find((entry) => entry.itemId === payload.itemId);
      if (
        !line ||
        line.status !== "DISCREPANCY" ||
        line.discrepancy === undefined ||
        line.physicalCount === undefined
      )
        throw new Error("Count and discrepancy are required before reconciliation");
      if (!payload.reason.trim()) throw new Error("A reconciliation reason is required");
      const item = draft.inventory.find((entry) => entry.id === payload.itemId);
      if (!item) throw new Error("Inventory item not found");
      const delta = line.discrepancy;
      const before = inventoryState(item);
      const beforeAssets = structuredClone(item.assets ?? []);
      const changedAssetIds: string[] = [];
      if (delta > 0) {
        if (payload.assetIds?.length)
          throw new Error(
            "Positive corrections use new asset metadata, not existing asset identifiers"
          );
        if (item.trackingMode === "INDIVIDUAL_ASSET") {
          const additions = payload.newAssets ?? [];
          if (additions.length !== delta)
            throw new Error(`Enter serial numbers for all ${delta} additional physical assets`);
          const existing = new Set(item.assets?.map((asset) => asset.serialNumber) ?? []);
          const serials = additions.map((asset) => asset.serialNumber.trim());
          if (
            serials.some((serial) => !serial) ||
            new Set(serials).size !== serials.length ||
            serials.some((serial) => existing.has(serial))
          )
            throw new Error("New asset serial numbers must be unique and nonempty");
          item.assets ??= [];
          additions.forEach((asset, index) => {
            const assetId = `ast-${crypto.randomUUID()}`;
            changedAssetIds.push(assetId);
            item.assets!.push({
              id: assetId,
              serialNumber: serials[index],
              condition: asset.condition,
              state: "AVAILABLE",
            });
          });
        } else if (payload.newAssets?.length)
          throw new Error("Quantity-tracked items do not accept asset records");
        item.totalQuantity += delta;
        item.availableQuantity += delta;
      } else {
        if (payload.newAssets?.length)
          throw new Error("Negative corrections remove identified assets; they do not add assets");
        const quantity = Math.abs(delta);
        const assetIds = payload.assetIds ?? [];
        if (quantity > item.availableQuantity)
          throw new Error(
            "Correction exceeds available stock; allocated, damaged, maintenance, and borrowed units cannot be silently removed"
          );
        if (item.trackingMode === "INDIVIDUAL_ASSET") {
          if (assetIds.length !== quantity || new Set(assetIds).size !== quantity)
            throw new Error(`Select exactly ${quantity} missing available assets`);
          if (
            assetIds.some(
              (id) => !item.assets?.some((asset) => asset.id === id && asset.state === "AVAILABLE")
            )
          )
            throw new Error("Only available assets can be removed by physical correction");
          changedAssetIds.push(...assetIds);
          item.assets = item.assets!.filter((asset) => !assetIds.includes(asset.id));
        } else if (assetIds.length)
          throw new Error("Quantity-tracked items do not accept asset IDs");
        item.totalQuantity -= quantity;
        item.availableQuantity -= quantity;
      }
      assertInventoryConserved(item);
      line.status = "RECONCILED";
      line.resolutionNotes = payload.reason;
      line.discrepancy = 0;
      const event: InventoryEvent = recordInventoryEvent(
        draft,
        item,
        "CORRECT",
        delta,
        before,
        actorUserId,
        actor.name,
        payload.reason
      );
      if (changedAssetIds.length) event.assetIds = changedAssetIds;
      line.resolutionEventId = event.id;
      audit.updatedAt = new Date().toISOString();
      result = structuredClone(audit);
      auditLog(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "INVENTORY_PHYSICAL_CORRECTION",
        item.id,
        { state: before, assets: beforeAssets },
        { state: inventoryState(item), assets: structuredClone(item.assets ?? []) },
        payload.reason,
        "INVENTORY"
      );
      auditLog(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "AUDIT_RECONCILED",
        audit.id,
        { itemId: item.id, discrepancy: delta },
        { itemId: item.id, eventId: event.id },
        payload.reason
      );
    });
    return result;
  }

  async completeAudit(
    auditId: string,
    actorUserId: string,
    _actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let result!: InventoryAudit;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const audit = draft.audits.find((entry) => entry.id === auditId);
      if (!audit || audit.status !== "IN_PROGRESS") throw new Error("In-progress audit not found");
      if (
        audit.items.some((item) => item.status === "PENDING_COUNT" || item.status === "DISCREPANCY")
      )
        throw new Error("Count and reconcile every audit line before closing");
      audit.status = "RECONCILED";
      audit.completedAt = new Date().toISOString();
      audit.completedBy = actorUserId;
      audit.updatedAt = audit.completedAt;
      result = structuredClone(audit);
      auditLog(
        draft,
        actorUserId,
        actor.name,
        actor.role,
        "AUDIT_COMPLETED",
        auditId,
        undefined,
        result,
        "All audit lines matched or were reconciled"
      );
    });
    return result;
  }
}

export const mockBoardAuditService = new MockBoardAuditService();
