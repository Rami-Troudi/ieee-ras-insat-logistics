import { InventoryAudit } from "@/types";

export interface StartAuditPayload {
  title: string;
  notes?: string;
  categoryFilter?: string;
}

export interface RecordPhysicalCountPayload {
  auditId: string;
  counts: {
    itemId: string;
    physicalCount: number;
    notes?: string;
  }[];
}

export interface ReconcileAuditDiscrepancyPayload {
  auditId: string;
  itemId: string;
  reason: string;
  assetIds?: string[];
  newAssets?: {
    serialNumber: string;
    condition: "GOOD" | "MINOR_ISSUE" | "DAMAGED" | "MAINTENANCE" | "LOST";
  }[];
}

export interface IBoardAuditService {
  getAudits(status?: string): Promise<InventoryAudit[]>;
  getAuditById(auditId: string): Promise<InventoryAudit | null>;
  startAudit(
    payload: StartAuditPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit>;
  recordCounts(
    payload: RecordPhysicalCountPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit>;
  reconcileItem(
    payload: ReconcileAuditDiscrepancyPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<InventoryAudit>;
  completeAudit(auditId: string, actorUserId: string, actorRole: string): Promise<InventoryAudit>;
}
