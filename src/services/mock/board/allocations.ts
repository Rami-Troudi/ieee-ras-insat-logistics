import { IBoardAllocationService } from "@/services/contracts/board/allocations";
import { AllocationRecord } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import { requireOperatorInDraft } from "../authorization";
import { inventoryState, moveUnits, recordInventoryEvent } from "./inventoryState";

class MockBoardAllocationService implements IBoardAllocationService {
  async getAllocations(filters?: {
    requestId?: string;
    itemId?: string;
    status?: "ACTIVE" | "HANDED_OVER" | "RELEASED" | "EXPIRED";
  }): Promise<AllocationRecord[]> {
    let records = mockDb.getSnapshot().allocations;
    if (filters?.requestId)
      records = records.filter((record) => record.requestId === filters.requestId);
    if (filters?.itemId) records = records.filter((record) => record.itemId === filters.itemId);
    if (filters?.status) records = records.filter((record) => record.status === filters.status);
    return records.sort((a, b) => Date.parse(b.allocatedAt) - Date.parse(a.allocatedAt));
  }

  async releaseAllocation(
    allocationId: string,
    actorUserId: string,
    reason?: string
  ): Promise<AllocationRecord> {
    let released!: AllocationRecord;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const allocation = draft.allocations.find((entry) => entry.id === allocationId);
      if (!allocation || allocation.status !== "ACTIVE")
        throw new Error("Active allocation not found");
      const item = draft.inventory.find((entry) => entry.id === allocation.itemId);
      if (!item) throw new Error("Inventory item not found");
      const before = inventoryState(item);
      moveUnits(item, "allocated", "available", allocation.quantity, allocation.assetIds);
      allocation.status = "RELEASED";
      allocation.releasedAt = new Date().toISOString();
      allocation.releasedBy = actorUserId;
      allocation.releaseReason = reason || "Released by operator";
      recordInventoryEvent(
        draft,
        item,
        "RELEASE_ALLOCATION",
        allocation.quantity,
        before,
        actorUserId,
        actor.name,
        allocation.releaseReason
      );
      released = structuredClone(allocation);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName: "Operator",
      actorRole: "OPERATOR",
      action: "ALLOCATION_RELEASED",
      entityType: "INVENTORY",
      entityId: released.itemId,
      after: released,
      reason: reason || "Allocation released",
    });
    return released;
  }

  async checkAndExpireAllocations(): Promise<number> {
    const timestamp = new Date().toISOString();
    let count = 0;
    mockDb.mutate((draft) => {
      for (const allocation of draft.allocations) {
        if (allocation.status !== "ACTIVE" || Date.parse(allocation.expiresAt) > Date.now())
          continue;
        const item = draft.inventory.find((entry) => entry.id === allocation.itemId);
        if (!item) continue;
        const before = inventoryState(item);
        moveUnits(item, "allocated", "available", allocation.quantity, allocation.assetIds);
        allocation.status = "EXPIRED";
        allocation.releasedAt = timestamp;
        allocation.releaseReason = "48-hour collection window expired";
        count++;
        recordInventoryEvent(
          draft,
          item,
          "RELEASE_ALLOCATION",
          allocation.quantity,
          before,
          allocation.allocatedBy,
          "System",
          allocation.releaseReason
        );
        const request = draft.requests.find((entry) => entry.id === allocation.requestId);
        if (request && request.handoverStatus === "WAITING") {
          const remaining = draft.allocations.some(
            (entry) => entry.requestId === request.id && entry.status === "ACTIVE"
          );
          if (!remaining) {
            request.lifecycleStatus = "EXPIRED";
            request.status = "EXPIRED";
            request.timeline.push({
              status: "EXPIRED",
              timestamp,
              description: "The 48-hour collection window expired and reservations were released.",
              actor: "System",
            });
          }
        }
      }
    });
    return count;
  }
}

export const mockBoardAllocationService = new MockBoardAllocationService();
