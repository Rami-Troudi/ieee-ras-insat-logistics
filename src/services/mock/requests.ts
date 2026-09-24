import { IRequestService } from "../contracts/requests";
import { BorrowRequest, CreateBorrowRequestPayload, RequestLineItem } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";
import { requireMemberInDraft } from "./authorization";
import {
  getBorrowerCatalogAccess,
  isFormalRequestClass,
} from "@/features/inventory/utils/catalogAccess";

export class MockRequestService implements IRequestService {
  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(250);
  }

  async listUserRequests(userId: string): Promise<BorrowRequest[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    return mockDb
      .getSnapshot()
      .requests.filter((request) => request.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getRequest(id: string, userId?: string): Promise<BorrowRequest | null> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return null;
    const request = mockDb.getSnapshot().requests.find((candidate) => candidate.id === id);
    if (request && userId && request.userId !== userId) {
      throw new Error("Unauthorized: request belongs to another member");
    }
    return request || null;
  }

  async createRequest(userId: string, payload: CreateBorrowRequestPayload): Promise<BorrowRequest> {
    await this.simulateLatency();
    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new Error("Add at least one item");
    }
    if (
      !payload.expectedReturnDate ||
      Number.isNaN(new Date(payload.expectedReturnDate).getTime())
    ) {
      throw new Error("Choose an expected return date");
    }
    const ids = payload.items.map((line) => line.itemId);
    if (new Set(ids).size !== ids.length) throw new Error("Duplicate items are not allowed");

    return mockDb.mutate((draft) => {
      const user = requireMemberInDraft(draft, userId);
      const now = new Date().toISOString();
      const requestId = `REQ-${crypto.randomUUID()}`;
      const items: RequestLineItem[] = payload.items.map((line, index) => {
        if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
          throw new Error("Item quantities must be positive whole numbers");
        }
        const item = draft.inventory.find((candidate) => candidate.id === line.itemId);
        if (!item) throw new Error("Unknown equipment item");
        if (!isFormalRequestClass(item))
          throw new Error("Only Class C and E can be requested online");
        const access = getBorrowerCatalogAccess(user, item);
        if (!access.visible || access.action !== "REQUEST") {
          throw new Error("This item is not available to this member");
        }
        return {
          id: `rline-${requestId}-${index + 1}`,
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          equipmentClass: item.equipmentClass,
          requestedQuantity: line.quantity,
          approvedQuantity: 0,
          handedOverQuantity: 0,
          returnedQuantity: 0,
          damagedQuantity: 0,
          lostQuantity: 0,
          status: "PENDING",
        };
      });
      const request: BorrowRequest = {
        id: requestId,
        userId,
        userName: user.name,
        userEmail: user.email,
        userClearance: user.clearance,
        ...(payload.note?.trim() ? { note: payload.note.trim() } : {}),
        expectedReturnDate: payload.expectedReturnDate,
        decisionStatus: "PENDING",
        handoverStatus: "WAITING",
        lifecycleStatus: "ACTIVE",
        status: "PENDING",
        items,
        createdAt: now,
        updatedAt: now,
        timeline: [
          {
            status: "PENDING",
            timestamp: now,
            description: "Request sent. Waiting for logistics review.",
            actor: user.name,
          },
        ],
      };
      draft.requests.unshift(request);
      user.totalRequestsCount += 1;
      Object.values(draft.userProfiles)
        .filter((operator) => operator.role === "OPERATOR" || operator.role === "SUPERADMIN")
        .forEach((operator) => {
          draft.notifications.unshift({
            id: `notif-${crypto.randomUUID()}`,
            userId: operator.id,
            title: "New request",
            message: `${user.name} requested ${items.map((item) => `${item.itemName} ×${item.requestedQuantity}`).join(", ")}.`,
            type: "GENERAL",
            read: false,
            link: `/board/requests/${requestId}`,
            createdAt: now,
            metadata: { requestId },
          });
        });
      draft.auditEvents.unshift({
        id: `audit-${crypto.randomUUID()}`,
        actorUserId: user.id,
        actorName: user.name,
        actorRole: "MEMBER",
        action: "REQUEST_CREATED",
        entityType: "REQUEST",
        entityId: request.id,
        after: request,
        createdAt: now,
      });
      return request;
    });
  }

  async cancelRequest(requestId: string, userId: string, reason?: string): Promise<BorrowRequest> {
    await this.simulateLatency();
    return mockDb.mutate((draft) => {
      const request = draft.requests.find((candidate) => candidate.id === requestId);
      if (!request || request.userId !== userId) throw new Error("Request not found");
      if (request.decisionStatus !== "PENDING" || request.lifecycleStatus !== "ACTIVE") {
        throw new Error("Only PENDING requests can be cancelled by members");
      }
      request.lifecycleStatus = "CANCELLED";
      request.status = "CANCELLED";
      request.rejectionReason = reason;
      request.updatedAt = new Date().toISOString();
      request.timeline.push({
        status: "CANCELLED",
        timestamp: request.updatedAt,
        description: reason || "Request cancelled by member",
        actor: request.userName,
      });
      return request;
    });
  }
}

export const mockRequestService = new MockRequestService();
