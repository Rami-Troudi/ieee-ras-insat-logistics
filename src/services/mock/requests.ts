import { IRequestService } from "../contracts/requests";
import { BorrowRequest, CreateBorrowRequestPayload, RequestLineItem } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";

export class MockRequestService implements IRequestService {
  private defaultDelayMs = 250;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listUserRequests(userId: string): Promise<BorrowRequest[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    return snapshot.requests
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRequest(id: string, userId?: string): Promise<BorrowRequest | null> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return null;
    const snapshot = mockDb.getSnapshot();
    const req = snapshot.requests.find((r) => r.id === id);
    if (!req) return null;
    // Ownership check if userId is provided
    if (userId && req.userId !== userId) {
      throw new Error("Unauthorized: You do not have permission to view this borrow request.");
    }
    return req;
  }

  async createRequest(userId: string, payload: CreateBorrowRequestPayload): Promise<BorrowRequest> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const user = snapshot.userProfiles[userId] || {
      name: "Member User",
      email: "member@insat.u-carthage.tn",
      clearance: "I",
    };

    const project = payload.projectId
      ? snapshot.projects.find((p) => p.id === payload.projectId)
      : undefined;

    const newId = `REQ-2026-0${Math.floor(100 + Math.random() * 900)}`;

    const items: RequestLineItem[] = payload.items.map((item, idx) => {
      const invItem = snapshot.inventory.find((i) => i.id === item.itemId);
      return {
        id: `rline-${Date.now()}-${idx}`,
        itemId: item.itemId,
        itemName: invItem ? invItem.name : "Equipment",
        category: invItem ? invItem.category : "General",
        equipmentClass: invItem ? invItem.equipmentClass : "E",
        requestedQuantity: item.quantity,
        approvedQuantity: 0,
        handedOverQuantity: 0,
        returnedQuantity: 0,
        damagedQuantity: 0,
        lostQuantity: 0,
        status: "PENDING",
      };
    });

    const newRequest: BorrowRequest = {
      id: newId,
      userId,
      userName: user.name,
      userEmail: user.email,
      userClearance: user.clearance,
      projectId: payload.projectId,
      projectName: project ? project.name : undefined,
      purpose: payload.purpose,
      expectedReturnDate: payload.expectedReturnDate,
      decisionStatus: "PENDING",
      handoverStatus: "WAITING",
      lifecycleStatus: "ACTIVE",
      status: "PENDING",
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: "PENDING",
          timestamp: new Date().toISOString(),
          description: "Request submitted by member. Waiting for Logistics Board review.",
          actor: user.name,
        },
      ],
    };

    mockDb.mutate((draft) => {
      draft.requests.unshift(newRequest);
      if (draft.userProfiles[userId]) {
        draft.userProfiles[userId].totalRequestsCount += 1;
      }
    });

    return newRequest;
  }

  async cancelRequest(requestId: string, userId: string, reason?: string): Promise<BorrowRequest> {
    await this.simulateLatency();
    let updatedRequest: BorrowRequest | null = null;

    mockDb.mutate((draft) => {
      const req = draft.requests.find((r) => r.id === requestId && r.userId === userId);
      if (!req) {
        throw new Error("Request not found or not owned by user");
      }
      if (req.status !== "PENDING") {
        throw new Error("Only PENDING requests can be cancelled by members");
      }

      req.status = "CANCELLED";
      req.lifecycleStatus = "CANCELLED";
      req.updatedAt = new Date().toISOString();
      req.rejectionReason = reason || "Cancelled by member";
      req.timeline.push({
        status: "CANCELLED",
        timestamp: new Date().toISOString(),
        description: `Request cancelled by member: ${reason || "No reason specified"}`,
        actor: req.userName,
      });

      updatedRequest = { ...req };
    });

    if (!updatedRequest) {
      throw new Error("Failed to cancel request");
    }

    return updatedRequest;
  }
}

export const mockRequestService = new MockRequestService();
