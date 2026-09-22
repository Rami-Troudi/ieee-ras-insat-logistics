import { AuditEvent } from "@/types";

export interface IBoardAuditLogService {
  getEvents(filters?: {
    action?: string;
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    limit?: number;
  }): Promise<AuditEvent[]>;
  logEvent(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent>;
}
