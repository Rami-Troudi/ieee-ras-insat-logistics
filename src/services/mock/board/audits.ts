import {
  IBoardAuditService,
  StartAuditPayload,
  RecordPhysicalCountPayload,
  ReconcileAuditDiscrepancyPayload,
} from "@/services/contracts/board/audits";
import { InventoryAudit, InventoryAuditItem, Role } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import { mockBoardInventoryService } from "./inventory";

class MockBoardAuditService implements IBoardAuditService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getAudits(status?: string): Promise<InventoryAudit[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let audits = [...snapshot.audits];

    if (status && status !== "ALL") {
      audits = audits.filter((a) => a.status === status);
    }

    return audits.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async getAuditById(auditId: string): Promise<InventoryAudit | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const audit = snapshot.audits.find((a) => a.id === auditId);
    return audit ? { ...audit } : null;
  }

  async startAudit(
    payload: StartAuditPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let newAudit: InventoryAudit | null = null;

    mockDb.mutate((draft) => {
      const nowIso = new Date().toISOString();
      const auditId = `aud-2026-${String(draft.audits.length + 1).padStart(4, "0")}`;

      let inventoryItems = [...draft.inventory];
      if (payload.categoryFilter && payload.categoryFilter !== "ALL") {
        inventoryItems = inventoryItems.filter((i) => i.category === payload.categoryFilter);
      }

      const auditItems: InventoryAuditItem[] = inventoryItems.map((item) => ({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        equipmentClass: item.equipmentClass,
        expectedSnapshotQuantity: item.totalQuantity,
        movementsSinceSnapshot: 0,
        adjustedExpectedQuantity: item.totalQuantity,
        status: "PENDING_COUNT",
      }));

      newAudit = {
        id: auditId,
        title: payload.title,
        startedAt: nowIso,
        startedBy: actorUserId,
        startedByName:
          actorRole === "SUPERADMIN"
            ? "Amine Elkadhi (RAS Chairman)"
            : "Emna Taghlet (Logistics Board)",
        status: "IN_PROGRESS",
        snapshotAt: nowIso,
        items: auditItems,
        notes: payload.notes,
      };

      draft.audits.unshift(newAudit);
    });

    if (newAudit) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "AUDIT_STARTED",
        entityType: "AUDIT",
        entityId: (newAudit as InventoryAudit).id,
        after: newAudit,
        reason: payload.title,
      });

      return newAudit;
    }
    throw new Error("Failed to start audit");
  }

  async recordCounts(
    payload: RecordPhysicalCountPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let updatedAudit: InventoryAudit | null = null;

    mockDb.mutate((draft) => {
      const audit = draft.audits.find((a) => a.id === payload.auditId);
      if (!audit) throw new Error("Audit not found");
      if (audit.status !== "IN_PROGRESS") {
        throw new Error("Cannot record counts for an audit that is not in progress");
      }

      const snapshotTime = new Date(audit.snapshotAt).getTime();

      payload.counts.forEach((countEntry) => {
        const item = audit.items.find((i) => i.itemId === countEntry.itemId);
        if (!item) return;

        // Calculate movements recorded since T0
        const movements = draft.inventoryEvents.filter(
          (e) => e.itemId === item.itemId && new Date(e.timestamp).getTime() >= snapshotTime
        );

        let netDelta = 0;
        movements.forEach((m) => {
          if (m.type === "ADD") netDelta += m.quantity;
          else if (m.type === "REMOVE" || m.type === "CONSUME" || m.type === "RETIRE")
            netDelta -= m.quantity;
        });

        item.movementsSinceSnapshot = netDelta;
        item.adjustedExpectedQuantity = item.expectedSnapshotQuantity + netDelta;
        item.physicalCount = countEntry.physicalCount;
        item.discrepancy = countEntry.physicalCount - item.adjustedExpectedQuantity;

        if (item.discrepancy === 0) {
          item.status = "MATCHED";
        } else {
          item.status = "DISCREPANCY";
        }

        if (countEntry.notes) item.resolutionNotes = countEntry.notes;
      });

      updatedAudit = { ...audit };
    });

    if (updatedAudit) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "AUDIT_COUNTS_RECORDED",
        entityType: "AUDIT",
        entityId: payload.auditId,
        after: updatedAudit,
        reason: `Physical counts updated for audit ${payload.auditId}`,
      });

      return updatedAudit;
    }
    throw new Error("Failed to record physical counts");
  }

  async reconcileItem(
    payload: ReconcileAuditDiscrepancyPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();

    // 1. Execute stock mutation via inventory service
    const { event } = await mockBoardInventoryService.mutateStock(
      {
        itemId: payload.itemId,
        type: payload.resolutionType,
        quantity: payload.discrepancyQuantity,
        reason: `Audit reconciliation (${payload.auditId}): ${payload.reason}`,
      },
      actorUserId,
      actorRole
    );

    // 2. Mark audit line as reconciled
    let updatedAudit: InventoryAudit | null = null;
    mockDb.mutate((draft) => {
      const audit = draft.audits.find((a) => a.id === payload.auditId);
      if (!audit) throw new Error("Audit not found");

      const line = audit.items.find((i) => i.itemId === payload.itemId);
      if (line) {
        line.status = "RECONCILED";
        line.resolutionEventId = event.id;
        line.resolutionNotes = payload.reason;
        line.discrepancy = 0;
      }

      updatedAudit = { ...audit };
    });

    if (updatedAudit) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "AUDIT_RECONCILED",
        entityType: "AUDIT",
        entityId: payload.auditId,
        after: { itemId: payload.itemId, eventId: event.id },
        reason: payload.reason,
      });

      return updatedAudit;
    }
    throw new Error("Failed to reconcile audit item");
  }

  async completeAudit(
    auditId: string,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit> {
    await this.simulateLatency();
    let completedAudit: InventoryAudit | null = null;

    mockDb.mutate((draft) => {
      const audit = draft.audits.find((a) => a.id === auditId);
      if (!audit) throw new Error("Audit not found");

      const pending = audit.items.some(
        (i) => i.status === "PENDING_COUNT" || i.status === "DISCREPANCY"
      );
      if (pending) {
        throw new Error(
          "Cannot complete audit: All items must be matched or reconciled before closing."
        );
      }

      audit.status = "RECONCILED";
      audit.completedAt = new Date().toISOString();
      audit.completedBy = actorUserId;

      completedAudit = { ...audit };
    });

    if (completedAudit) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "AUDIT_COMPLETED",
        entityType: "AUDIT",
        entityId: auditId,
        after: completedAudit,
        reason: "All line items matched or reconciled",
      });

      return completedAudit;
    }
    throw new Error("Failed to complete audit");
  }
}

export const mockBoardAuditService = new MockBoardAuditService();
