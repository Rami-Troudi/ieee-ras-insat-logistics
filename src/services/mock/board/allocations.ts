import { IBoardAllocationService } from "@/services/contracts/board/allocations";
import { AllocationRecord } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";

class MockBoardAllocationService implements IBoardAllocationService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getAllocations(filters?: {
    requestId?: string;
    itemId?: string;
    status?: "ACTIVE" | "HANDED_OVER" | "RELEASED" | "EXPIRED";
  }): Promise<AllocationRecord[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let allocations = [...snapshot.allocations];

    if (filters?.requestId) {
      allocations = allocations.filter((a) => a.requestId === filters.requestId);
    }
    if (filters?.itemId) {
      allocations = allocations.filter((a) => a.itemId === filters.itemId);
    }
    if (filters?.status) {
      allocations = allocations.filter((a) => a.status === filters.status);
    }

    return allocations.sort(
      (a, b) => new Date(b.allocatedAt).getTime() - new Date(a.allocatedAt).getTime()
    );
  }

  async releaseAllocation(
    allocationId: string,
    actorUserId: string,
    reason?: string
  ): Promise<AllocationRecord> {
    await this.simulateLatency();
    let releasedAlloc: AllocationRecord | null = null;

    mockDb.mutate((draft) => {
      const alloc = draft.allocations.find((a) => a.id === allocationId);
      if (!alloc) throw new Error("Allocation not found");
      if (alloc.status !== "ACTIVE") {
        throw new Error(`Cannot release allocation in status ${alloc.status}`);
      }

      alloc.status = "RELEASED";
      alloc.releasedAt = new Date().toISOString();
      alloc.releasedBy = actorUserId;
      alloc.releaseReason = reason || "Released by Board";

      // Return allocated stock back to availableQuantity
      const item = draft.inventory.find((i) => i.id === alloc.itemId);
      if (item) {
        item.allocatedQuantity = Math.max(0, item.allocatedQuantity - alloc.quantity);
        item.availableQuantity = item.availableQuantity + alloc.quantity;

        if (alloc.assetIds && item.assets) {
          item.assets.forEach((asset) => {
            if (alloc.assetIds!.includes(asset.id)) {
              asset.isAvailable = true;
            }
          });
        }

        draft.inventoryEvents.unshift({
          id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          itemId: item.id,
          itemName: item.name,
          type: "RELEASE_ALLOCATION",
          quantity: alloc.quantity,
          beforeState: {
            total: item.totalQuantity,
            available: item.availableQuantity - alloc.quantity,
            allocated: item.allocatedQuantity + alloc.quantity,
            borrowed: item.borrowedQuantity,
            damaged: item.damagedQuantity,
          },
          afterState: {
            total: item.totalQuantity,
            available: item.availableQuantity,
            allocated: item.allocatedQuantity,
            borrowed: item.borrowedQuantity,
            damaged: item.damagedQuantity,
          },
          reason: reason || `Manual release of allocation ${alloc.id}`,
          actorUserId,
          actorName: "Board Custodian",
          timestamp: new Date().toISOString(),
        });
      }

      releasedAlloc = { ...alloc };
    });

    if (releasedAlloc) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: "BOARD",
        action: "ALLOCATION_RELEASED",
        entityType: "INVENTORY",
        entityId: (releasedAlloc as AllocationRecord).itemId,
        reason: reason || "Manual allocation release",
        after: releasedAlloc,
      });
      return releasedAlloc;
    }
    throw new Error("Failed to release allocation");
  }

  async checkAndExpireAllocations(): Promise<number> {
    const now = Date.now();
    let expiredCount = 0;

    mockDb.mutate((draft) => {
      draft.allocations.forEach((alloc) => {
        if (alloc.status === "ACTIVE" && new Date(alloc.expiresAt).getTime() <= now) {
          alloc.status = "EXPIRED";
          expiredCount++;

          const item = draft.inventory.find((i) => i.id === alloc.itemId);
          if (item) {
            item.allocatedQuantity = Math.max(0, item.allocatedQuantity - alloc.quantity);
            item.availableQuantity = item.availableQuantity + alloc.quantity;

            if (alloc.assetIds && item.assets) {
              item.assets.forEach((asset) => {
                if (alloc.assetIds!.includes(asset.id)) {
                  asset.isAvailable = true;
                }
              });
            }

            draft.inventoryEvents.unshift({
              id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              itemId: item.id,
              itemName: item.name,
              type: "RELEASE_ALLOCATION",
              quantity: alloc.quantity,
              beforeState: {
                total: item.totalQuantity,
                available: item.availableQuantity - alloc.quantity,
                allocated: item.allocatedQuantity + alloc.quantity,
                borrowed: item.borrowedQuantity,
                damaged: item.damagedQuantity,
              },
              afterState: {
                total: item.totalQuantity,
                available: item.availableQuantity,
                allocated: item.allocatedQuantity,
                borrowed: item.borrowedQuantity,
                damaged: item.damagedQuantity,
              },
              reason: `Automatic expiration of 48-hour pickup window for allocation ${alloc.id}`,
              actorUserId: "system",
              actorName: "Logistics Allocation Engine",
              timestamp: new Date().toISOString(),
            });
          }

          // Update corresponding request
          const req = draft.requests.find((r) => r.id === alloc.requestId);
          if (req && req.handoverStatus === "WAITING") {
            req.lifecycleStatus = "EXPIRED";
            req.status = "EXPIRED";
            req.timeline.push({
              status: "EXPIRED",
              timestamp: new Date().toISOString(),
              description: `48-hour collection deadline expired. Uncollected equipment (${alloc.quantity}x ${alloc.itemName}) released to stock.`,
              actor: "System",
            });
          }
        }
      });
    });

    return expiredCount;
  }
}

export const mockBoardAllocationService = new MockBoardAllocationService();
