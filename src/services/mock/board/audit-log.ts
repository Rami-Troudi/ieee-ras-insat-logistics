import { IBoardAuditLogService } from "@/services/contracts/board/audit-log";
import { AuditEvent } from "@/types";
import { mockDb } from "@/mocks/db";
import { requireOperatorInDraft } from "../authorization";

class MockBoardAuditLogService implements IBoardAuditLogService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getEvents(filters?: {
    action?: string;
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    limit?: number;
  }): Promise<AuditEvent[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let events = [...snapshot.auditEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filters?.action) {
      events = events.filter((e) => e.action === filters.action);
    }
    if (filters?.entityType) {
      events = events.filter((e) => e.entityType === filters.entityType);
    }
    if (filters?.entityId) {
      events = events.filter((e) => e.entityId === filters.entityId);
    }
    if (filters?.actorUserId) {
      events = events.filter((e) => e.actorUserId === filters.actorUserId);
    }
    if (filters?.limit) {
      events = events.slice(0, filters.limit);
    }

    return events;
  }

  async logEvent(event: Omit<AuditEvent, "id" | "createdAt">): Promise<AuditEvent> {
    let newEvent!: AuditEvent;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, event.actorUserId);
      newEvent = {
        id: `aev-${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        ...event,
        actorName: actor.name,
        actorRole: actor.role,
      };
      draft.auditEvents.unshift(newEvent);
    });

    return newEvent;
  }
}

export const mockBoardAuditLogService = new MockBoardAuditLogService();
