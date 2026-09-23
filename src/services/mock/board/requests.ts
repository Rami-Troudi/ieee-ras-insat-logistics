import {
  IBoardRequestService,
  ReviewRequestPayload,
  HandoverPayload,
  RequestFilterParams,
} from "@/services/contracts/board/requests";
import { BorrowRequest, LoanRecord, LoanLineItem, AllocationRecord } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import { requireOperatorInDraft } from "../authorization";
import {
  inventoryState,
  moveUnits,
  recordInventoryEvent,
  assertInventoryConserved,
} from "./inventoryState";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

class MockBoardRequestService implements IBoardRequestService {
  async getRequests(filters?: RequestFilterParams): Promise<BorrowRequest[]> {
    const snapshot = mockDb.getSnapshot();
    let requests = snapshot.requests;
    if (filters?.decisionStatus && filters.decisionStatus !== "ALL")
      requests = requests.filter((r) => r.decisionStatus === filters.decisionStatus);
    if (filters?.handoverStatus && filters.handoverStatus !== "ALL")
      requests = requests.filter((r) => r.handoverStatus === filters.handoverStatus);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          r.items.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }
    return requests.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  async getRequestById(requestId: string): Promise<BorrowRequest | null> {
    return mockDb.getSnapshot().requests.find((r) => r.id === requestId) ?? null;
  }

  async reviewRequest(payload: ReviewRequestPayload, actorUserId: string): Promise<BorrowRequest> {
    let updated!: BorrowRequest;
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const req = draft.requests.find((r) => r.id === payload.requestId);
      if (!req || req.decisionStatus !== "PENDING") throw new Error("Pending request not found");
      const lineIds = req.items.map((line) => line.id);
      if (
        payload.lines.length !== lineIds.length ||
        new Set(payload.lines.map((line) => line.lineId)).size !== lineIds.length ||
        payload.lines.some((line) => !lineIds.includes(line.lineId))
      )
        throw new Error("Review must include each request line exactly once");
      const borrower = draft.userProfiles[req.userId];
      if (!borrower || borrower.status !== "ACTIVE" || (borrower.strikesCount ?? 0) >= 4)
        throw new Error("Member is not currently eligible to borrow");

      const plan = payload.lines.map((input) => {
        const line = req.items.find((candidate) => candidate.id === input.lineId)!;
        if (
          !Number.isInteger(input.approvedQuantity) ||
          input.approvedQuantity < 0 ||
          input.approvedQuantity > line.requestedQuantity
        )
          throw new Error(`Invalid approved quantity for ${line.itemName}`);
        if (!(["C", "E"] as string[]).includes(line.equipmentClass))
          throw new Error("Only Class C and E requests can be approved online");
        const item = draft.inventory.find((candidate) => candidate.id === line.itemId);
        if (!item) throw new Error(`Inventory item ${line.itemId} not found`);
        if (input.approvedQuantity > item.availableQuantity)
          throw new Error(`Only ${item.availableQuantity} units of ${line.itemName} are available`);
        const availableAssets = item.assets?.filter((asset) => asset.state === "AVAILABLE") ?? [];
        const assetIds =
          input.approvedQuantity === 0 || item.trackingMode !== "INDIVIDUAL_ASSET"
            ? []
            : (input.assignedAssetIds ??
              availableAssets.slice(0, input.approvedQuantity).map((asset) => asset.id));
        if (
          item.trackingMode === "INDIVIDUAL_ASSET" &&
          (assetIds.length !== input.approvedQuantity ||
            new Set(assetIds).size !== assetIds.length ||
            assetIds.some((assetId) => !availableAssets.some((asset) => asset.id === assetId)))
        )
          throw new Error(
            `Choose exactly ${input.approvedQuantity} available assets for ${line.itemName}`
          );
        return { line, item, input, assetIds };
      });

      const timestamp = now();
      let approvedTotal = 0;
      for (const entry of plan) {
        const { line, item, input, assetIds } = entry;
        const quantity = input.approvedQuantity;
        line.approvedQuantity = quantity;
        line.status = quantity === 0 ? "REJECTED" : "APPROVED";
        if (!quantity) {
          line.rejectionReason = input.rejectionReason || "Not approved";
          continue;
        }
        const before = inventoryState(item);
        moveUnits(item, "available", "allocated", quantity, assetIds);
        assertInventoryConserved(item);
        const allocation: AllocationRecord = {
          id: id("alloc"),
          requestId: req.id,
          requestLineId: line.id,
          itemId: item.id,
          itemName: item.name,
          quantity,
          ...(assetIds.length ? { assetIds } : {}),
          status: "ACTIVE",
          allocatedAt: timestamp,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          allocatedBy: actorUserId,
          allocatedByName: actor.name,
        };
        draft.allocations.unshift(allocation);
        recordInventoryEvent(
          draft,
          item,
          "ALLOCATE",
          quantity,
          before,
          actorUserId,
          actor.name,
          `Reservation for ${req.id}`
        );
        approvedTotal += quantity;
      }
      const requestedTotal = req.items.reduce((sum, line) => sum + line.requestedQuantity, 0);
      const decision =
        approvedTotal === 0
          ? "REJECTED"
          : approvedTotal === requestedTotal
            ? "APPROVED"
            : "PARTIALLY_APPROVED";
      req.decisionStatus = decision;
      req.status = decision;
      req.reviewedAt = timestamp;
      req.reviewedBy = actor.name;
      req.decisionNotes = payload.decisionNotes;
      req.pickupDeadline = approvedTotal
        ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        : undefined;
      if (!approvedTotal) req.lifecycleStatus = "CLOSED";
      req.timeline.push({
        status: decision,
        timestamp,
        description: `Request reviewed: ${decision}${payload.decisionNotes ? `. ${payload.decisionNotes}` : ""}`,
        actor: actor.name,
      });
      draft.notifications.unshift({
        id: id("notif"),
        userId: req.userId,
        title: `Request ${decision.toLowerCase().replaceAll("_", " ")}`,
        message: approvedTotal
          ? `Your request ${req.id} is ready for collection within 48 hours.`
          : `Your request ${req.id} was declined.`,
        type:
          decision === "REJECTED"
            ? "REQUEST_REJECTED"
            : decision === "APPROVED"
              ? "REQUEST_APPROVED"
              : "REQUEST_PARTIALLY_APPROVED",
        read: false,
        link: `/app/requests/${req.id}`,
        createdAt: timestamp,
      });
      updated = structuredClone(req);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName: "Operator",
      actorRole: "OPERATOR",
      action: `REQUEST_${updated.decisionStatus}`,
      entityType: "REQUEST",
      entityId: updated.id,
      after: updated,
      reason: payload.decisionNotes || "Request reviewed",
    });
    return updated;
  }

  async rejectEntireRequest(
    requestId: string,
    reason: string,
    actorUserId: string
  ): Promise<BorrowRequest> {
    return this.reviewRequest(
      {
        requestId,
        lines:
          (await this.getRequestById(requestId))?.items.map((line) => ({
            lineId: line.id,
            approvedQuantity: 0,
            rejectionReason: reason,
          })) ?? [],
        decisionNotes: reason,
      },
      actorUserId
    );
  }

  async confirmHandover(
    payload: HandoverPayload,
    actorUserId: string
  ): Promise<{ request: BorrowRequest; loanId: string }> {
    let updated!: BorrowRequest;
    let loanId = "";
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      const req = draft.requests.find((r) => r.id === payload.requestId);
      if (
        !req ||
        !["APPROVED", "PARTIALLY_APPROVED"].includes(req.decisionStatus) ||
        req.handoverStatus === "HANDED_OVER"
      )
        throw new Error("Request is not ready for handover");
      const allocations = draft.allocations.filter(
        (a) => a.requestId === req.id && a.status === "ACTIVE"
      );
      if (!allocations.length || allocations.some((a) => Date.parse(a.expiresAt) <= Date.now()))
        throw new Error("Reservation expired; review the request again");
      const approvedLines = req.items.filter((line) => line.approvedQuantity > 0);
      if (
        allocations.length !== approvedLines.length ||
        approvedLines.some(
          (line) =>
            !allocations.some(
              (a) => a.requestLineId === line.id && a.quantity === line.approvedQuantity
            )
        )
      )
        throw new Error("Active reservations do not match approved request lines");
      const handoverDetails = payload.lineHandoverDetails ?? [];
      if (
        handoverDetails.some(
          (detail) => !approvedLines.some((line) => line.id === detail.lineId)
        ) ||
        new Set(handoverDetails.map((detail) => detail.lineId)).size !== handoverDetails.length
      )
        throw new Error("Invalid handover line details");
      const timestamp = now();
      const lines: LoanLineItem[] = approvedLines.map((line) => {
        const allocation = allocations.find((a) => a.requestLineId === line.id)!;
        const item = draft.inventory.find((candidate) => candidate.id === line.itemId)!;
        const chosenIds =
          handoverDetails.find((detail) => detail.lineId === line.id)?.serialNumbers ??
          allocation.assetIds ??
          [];
        if (
          item.trackingMode === "INDIVIDUAL_ASSET" &&
          (chosenIds.length !== allocation.quantity ||
            new Set(chosenIds).size !== chosenIds.length ||
            chosenIds.some((assetId) => !allocation.assetIds?.includes(assetId)))
        )
          throw new Error(`Handover assets do not match reservation for ${line.itemName}`);
        if (item.trackingMode === "QUANTITY" && chosenIds.length)
          throw new Error("Quantity tracked items cannot include asset identifiers");
        const before = inventoryState(item);
        moveUnits(
          item,
          "allocated",
          "borrowed",
          allocation.quantity,
          item.trackingMode === "INDIVIDUAL_ASSET" ? chosenIds : undefined,
          "GOOD"
        );
        allocation.status = "HANDED_OVER";
        recordInventoryEvent(
          draft,
          item,
          "HANDOVER",
          allocation.quantity,
          before,
          actorUserId,
          actor.name,
          `Physical handover for ${req.id}`
        );
        line.handedOverQuantity = line.approvedQuantity;
        line.status = "FULFILLED";
        return {
          id: id("lline"),
          itemId: line.itemId,
          itemName: line.itemName,
          category: line.category,
          equipmentClass: line.equipmentClass,
          borrowedQuantity: line.approvedQuantity,
          returnedQuantity: 0,
          lostQuantity: 0,
          conditionOnHandover: "GOOD",
          ...(chosenIds.length ? { assetIds: chosenIds, resolvedAssetIds: [] } : {}),
        };
      });
      loanId = `LN-${new Date().getFullYear()}-${String(draft.loans.length + 1).padStart(4, "0")}`;
      const loan: LoanRecord = {
        id: loanId,
        requestId: req.id,
        userId: req.userId,
        userName: req.userName,
        userEmail: req.userEmail,
        borrowDate: timestamp,
        dueDate: req.expectedReturnDate,
        lifecycleStatus: "ACTIVE",
        dueStatus: "ON_TIME",
        returnStatus: "NONE",
        status: "ACTIVE",
        items: lines,
        handedOverBy: actor.name,
        notes: payload.notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      draft.loans.unshift(loan);
      req.handoverStatus = "HANDED_OVER";
      req.lifecycleStatus = "CLOSED";
      req.status = "HANDED_OVER";
      req.timeline.push({
        status: "HANDED_OVER",
        timestamp,
        description: "Physical handover confirmed. Active loan created.",
        actor: actor.name,
      });
      const member = draft.userProfiles[req.userId];
      if (member) member.activeLoansCount = (member.activeLoansCount ?? 0) + 1;
      draft.notifications.unshift({
        id: id("notif"),
        userId: req.userId,
        title: "Equipment handed over",
        message: `Loan ${loanId} is active. Expected return: ${req.expectedReturnDate}.`,
        type: "REQUEST_APPROVED",
        read: false,
        link: `/app/loans/${loanId}`,
        createdAt: timestamp,
      });
      updated = structuredClone(req);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName: "Operator",
      actorRole: "OPERATOR",
      action: "HANDOVER_CONFIRMED",
      entityType: "LOAN",
      entityId: loanId,
      after: { requestId: payload.requestId, loanId },
      reason: payload.notes || "Physical handover completed",
    });
    return { request: updated, loanId };
  }
}

export const mockBoardRequestService = new MockBoardRequestService();
