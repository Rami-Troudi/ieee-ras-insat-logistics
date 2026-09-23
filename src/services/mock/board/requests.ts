import {
  IBoardRequestService,
  ReviewRequestPayload,
  HandoverPayload,
  RequestFilterParams,
} from "@/services/contracts/board/requests";
import { BorrowRequest, LoanRecord, LoanLineItem, AllocationRecord, Role } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";

class MockBoardRequestService implements IBoardRequestService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getRequests(filters?: RequestFilterParams): Promise<BorrowRequest[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let requests = [...snapshot.requests];

    if (filters?.decisionStatus && filters.decisionStatus !== "ALL") {
      requests = requests.filter((r) => r.decisionStatus === filters.decisionStatus);
    }
    if (filters?.handoverStatus && filters.handoverStatus !== "ALL") {
      requests = requests.filter((r) => r.handoverStatus === filters.handoverStatus);
    }
    if (filters?.needsSupervision) {
      requests = requests.filter((r) => r.items.some((i) => i.equipmentClass === "F"));
    }
    if (filters?.needsLevelVI) {
      requests = requests.filter((r) => r.items.some((i) => i.equipmentClass === "G"));
    }
    if (filters?.needsVerification) {
      const unprocessedUserIds = Object.values(snapshot.userProfiles)
        .filter((u) => !u.isProcessed)
        .map((u) => u.id);
      requests = requests.filter((r) => unprocessedUserIds.includes(r.userId));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q) ||
          (r.projectName && r.projectName.toLowerCase().includes(q)) ||
          r.items.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }

    return requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getRequestById(requestId: string): Promise<BorrowRequest | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const req = snapshot.requests.find((r) => r.id === requestId);
    return req ? { ...req } : null;
  }

  async reviewRequest(
    payload: ReviewRequestPayload,
    actorUserId: string,
    actorRole: string,
    actorClearance: string
  ): Promise<BorrowRequest> {
    await this.simulateLatency();
    let updatedRequest: BorrowRequest | null = null;
    let decisionOutcome: "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED" = "REJECTED";

    mockDb.mutate((draft) => {
      const req = draft.requests.find((r) => r.id === payload.requestId);
      if (!req) throw new Error("Request not found");
      if (req.decisionStatus !== "PENDING") {
        throw new Error(`Request has already been reviewed (${req.decisionStatus})`);
      }

      const borrowerProfile = draft.userProfiles[req.userId];
      const strikesCount = borrowerProfile?.strikesCount || 0;

      let totalRequested = 0;
      let totalApproved = 0;
      const createdAllocations: AllocationRecord[] = [];

      payload.lines.forEach((lineInput) => {
        const line = req.items.find((i) => i.id === lineInput.lineId);
        if (!line) throw new Error(`Request line ${lineInput.lineId} not found`);

        totalRequested += line.requestedQuantity;
        const appQty = lineInput.approvedQuantity;

        if (appQty > 0) {
          // 1. Class G Authority Check: Requires Level VI (SUPERADMIN)
          if (line.equipmentClass === "G" && actorClearance !== "VI") {
            throw new Error(
              `Unauthorized: Approving Class G equipment (${line.itemName}) requires explicit Level VI authority (RAS Chairman / Logistics Manager).`
            );
          }

          // 2. Strike 2/3 Restriction Check for F and G
          if (strikesCount >= 2 && (line.equipmentClass === "F" || line.equipmentClass === "G")) {
            throw new Error(
              `Cannot approve ${line.itemName} (Class ${line.equipmentClass}); member has ${strikesCount} active disciplinary strikes restricting Classes F & G.`
            );
          }

          // 3. Stock Availability Check
          const item = draft.inventory.find((i) => i.id === line.itemId);
          if (!item) throw new Error(`Inventory item ${line.itemId} not found`);

          if (appQty > item.availableQuantity) {
            throw new Error(
              `Cannot approve ${appQty} units for ${line.itemName}; only ${item.availableQuantity} available in unreserved stock.`
            );
          }

          // Deduct from available, add to allocated
          item.availableQuantity -= appQty;
          item.allocatedQuantity += appQty;

          // Assign individual assets if tracked
          const assignedAssetIds: string[] = [];
          if (item.trackingMode === "INDIVIDUAL_ASSET" && item.assets) {
            const availableAssets = item.assets.filter((a) => a.isAvailable);
            const toAssign =
              lineInput.assignedAssetIds || availableAssets.slice(0, appQty).map((a) => a.id);
            toAssign.forEach((astId) => {
              const ast = item.assets!.find((a) => a.id === astId);
              if (ast) {
                ast.isAvailable = false;
                assignedAssetIds.push(ast.id);
              }
            });
          }

          // Create 48-Hour Allocation Record
          const allocRecord: AllocationRecord = {
            id: `alloc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            requestId: req.id,
            requestLineId: line.id,
            itemId: item.id,
            itemName: item.name,
            quantity: appQty,
            assetIds: assignedAssetIds.length > 0 ? assignedAssetIds : undefined,
            status: "ACTIVE",
            allocatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            allocatedBy: actorUserId,
            allocatedByName: actorRole === "SUPERADMIN" ? "RAS Chairman" : "Logistics Board",
          };

          draft.allocations.unshift(allocRecord);
          createdAllocations.push(allocRecord);

          // Inventory Event
          draft.inventoryEvents.unshift({
            id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            itemId: item.id,
            itemName: item.name,
            type: "ALLOCATE",
            quantity: appQty,
            beforeState: {
              total: item.totalQuantity,
              available: item.availableQuantity + appQty,
              allocated: item.allocatedQuantity - appQty,
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
            reason: `48h reservation allocated for request ${req.id}`,
            actorUserId,
            actorName: "Board Custodian",
            timestamp: new Date().toISOString(),
          });

          line.approvedQuantity = appQty;
          line.status = "APPROVED";
          totalApproved += appQty;
        } else {
          line.approvedQuantity = 0;
          line.status = "REJECTED";
          line.rejectionReason = lineInput.rejectionReason || "Quantity adjusted to 0 by Board";
        }
      });

      if (totalApproved === totalRequested && totalApproved > 0) {
        decisionOutcome = "APPROVED";
      } else if (totalApproved > 0) {
        decisionOutcome = "PARTIALLY_APPROVED";
      } else {
        decisionOutcome = "REJECTED";
      }

      const nowIso = new Date().toISOString();
      req.decisionStatus = decisionOutcome;
      req.status = decisionOutcome;
      req.reviewedAt = nowIso;
      req.reviewedBy =
        actorRole === "SUPERADMIN"
          ? "Amine Elkadhi (RAS Chairman)"
          : "Emna Taghlet (Logistics Board)";
      req.decisionNotes = payload.decisionNotes;
      req.scheduledPickup = payload.scheduledPickup;
      req.pickupDeadline =
        decisionOutcome === "APPROVED" || decisionOutcome === "PARTIALLY_APPROVED"
          ? payload.scheduledPickup
            ? new Date(new Date(payload.scheduledPickup).getTime() + 24 * 60 * 60 * 1000).toISOString()
            : new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
          : undefined;

      if (decisionOutcome === "REJECTED") {
        req.lifecycleStatus = "CLOSED";
      }

      req.timeline.push({
        status: decisionOutcome,
        timestamp: nowIso,
        description: `Request reviewed by Board: ${decisionOutcome}. ${payload.decisionNotes || ""}`,
        actor: req.reviewedBy,
      });

      // Send In-App Notification to Member
      draft.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: req.userId,
        title:
          decisionOutcome === "APPROVED"
            ? `Borrow Request Approved (${req.id})`
            : decisionOutcome === "PARTIALLY_APPROVED"
              ? `Borrow Request Partially Approved (${req.id})`
              : `Borrow Request Rejected (${req.id})`,
        message:
          decisionOutcome === "REJECTED"
            ? `Your request ${req.id} was not approved. Reason: ${payload.decisionNotes || "See line details"}.`
            : payload.scheduledPickup
              ? `Your request ${req.id} is approved! You are invited to pick up your gear on ${new Date(payload.scheduledPickup).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} at the RAS desk.`
              : `Your request ${req.id} is approved for collection! A 48-hour pickup window is active at the RAS Workshop counter.`,
        type:
          decisionOutcome === "APPROVED"
            ? "REQUEST_APPROVED"
            : decisionOutcome === "PARTIALLY_APPROVED"
              ? "REQUEST_PARTIALLY_APPROVED"
              : "REQUEST_REJECTED",
        read: false,
        link: `/app/requests/${req.id}`,
        createdAt: nowIso,
      });

      updatedRequest = { ...req };
    });

    if (updatedRequest) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: actorRole === "SUPERADMIN" ? "RAS Chairman" : "Board Custodian",
        actorRole: actorRole as Role,
        action: `REQUEST_${decisionOutcome}`,
        entityType: "REQUEST",
        entityId: (updatedRequest as BorrowRequest).id,
        after: updatedRequest,
        reason: payload.decisionNotes || `Request review completed: ${decisionOutcome}`,
      });

      return updatedRequest;
    }
    throw new Error("Failed to process request review");
  }

  async rejectEntireRequest(
    requestId: string,
    reason: string,
    actorUserId: string,
    actorRole: string
  ): Promise<BorrowRequest> {
    await this.simulateLatency();
    let updatedRequest: BorrowRequest | null = null;

    mockDb.mutate((draft) => {
      const req = draft.requests.find((r) => r.id === requestId);
      if (!req) throw new Error("Request not found");
      if (req.decisionStatus !== "PENDING") {
        throw new Error(`Request has already been reviewed (${req.decisionStatus})`);
      }

      req.items.forEach((line) => {
        line.approvedQuantity = 0;
        line.status = "REJECTED";
        line.rejectionReason = reason;
      });

      const nowIso = new Date().toISOString();
      req.decisionStatus = "REJECTED";
      req.lifecycleStatus = "CLOSED";
      req.status = "REJECTED";
      req.reviewedAt = nowIso;
      req.reviewedBy =
        actorRole === "SUPERADMIN"
          ? "Amine Elkadhi (RAS Chairman)"
          : "Emna Taghlet (Logistics Board)";
      req.rejectionReason = reason;

      req.timeline.push({
        status: "REJECTED",
        timestamp: nowIso,
        description: `Request rejected by Board. Reason: ${reason}`,
        actor: req.reviewedBy,
      });

      draft.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: req.userId,
        title: `Borrow Request Rejected (${req.id})`,
        message: `Your request ${req.id} was rejected. Reason: ${reason}`,
        type: "REQUEST_REJECTED",
        read: false,
        link: `/app/requests/${req.id}`,
        createdAt: nowIso,
      });

      updatedRequest = { ...req };
    });

    if (updatedRequest) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "REQUEST_REJECTED",
        entityType: "REQUEST",
        entityId: (updatedRequest as BorrowRequest).id,
        after: updatedRequest,
        reason,
      });

      return updatedRequest;
    }
    throw new Error("Failed to reject request");
  }

  async confirmHandover(
    payload: HandoverPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<{ request: BorrowRequest; loanId: string }> {
    await this.simulateLatency();
    let updatedRequest: BorrowRequest | null = null;
    let newLoanId = "";

    mockDb.mutate((draft) => {
      const req = draft.requests.find((r) => r.id === payload.requestId);
      if (!req) throw new Error("Request not found");
      if (req.decisionStatus !== "APPROVED" && req.decisionStatus !== "PARTIALLY_APPROVED") {
        throw new Error("Cannot confirm handover for a request that has not been approved");
      }
      if (req.handoverStatus === "HANDED_OVER") {
        throw new Error("Equipment has already been handed over for this request");
      }

      const nowIso = new Date().toISOString();

      // 1. Release active allocations and convert allocated -> borrowed in inventory
      const allocations = draft.allocations.filter(
        (a) => a.requestId === req.id && a.status === "ACTIVE"
      );

      allocations.forEach((alloc) => {
        alloc.status = "HANDED_OVER";
        const item = draft.inventory.find((i) => i.id === alloc.itemId);
        if (item) {
          item.allocatedQuantity = Math.max(0, item.allocatedQuantity - alloc.quantity);
          item.borrowedQuantity += alloc.quantity;

          draft.inventoryEvents.unshift({
            id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            itemId: item.id,
            itemName: item.name,
            type: "HANDOVER",
            quantity: alloc.quantity,
            beforeState: {
              total: item.totalQuantity,
              available: item.availableQuantity,
              allocated: item.allocatedQuantity + alloc.quantity,
              borrowed: item.borrowedQuantity - alloc.quantity,
              damaged: item.damagedQuantity,
            },
            afterState: {
              total: item.totalQuantity,
              available: item.availableQuantity,
              allocated: item.allocatedQuantity,
              borrowed: item.borrowedQuantity,
              damaged: item.damagedQuantity,
            },
            reason: `Physical handover confirmed for request ${req.id}`,
            actorUserId,
            actorName: "Board Custodian",
            timestamp: nowIso,
          });
        }
      });

      // 2. Update Request State
      req.handoverStatus = "HANDED_OVER";
      req.lifecycleStatus = "CLOSED";
      req.status = "HANDED_OVER";
      req.items.forEach((line) => {
        if (line.approvedQuantity > 0) {
          line.handedOverQuantity = line.approvedQuantity;
          line.status = "FULFILLED";
        }
      });

      req.timeline.push({
        status: "HANDED_OVER",
        timestamp: nowIso,
        description: `Physical equipment handover confirmed at logistics counter. Active loan created.`,
        actor:
          actorRole === "SUPERADMIN"
            ? "Amine Elkadhi (RAS Chairman)"
            : "Emna Taghlet (Logistics Board)",
      });

      // 3. Create Corresponding Active Loan Record
      newLoanId = `LN-2026-${String(draft.loans.length + 1).padStart(4, "0")}`;
      const loanLines: LoanLineItem[] = req.items
        .filter((line) => line.approvedQuantity > 0)
        .map((line, idx) => {
          const matchingAlloc = allocations.find((a) => a.requestLineId === line.id);
          const serials = payload.lineHandoverDetails?.find((d) => d.lineId === line.id)
            ?.serialNumbers ||
            matchingAlloc?.assetIds || [
              `SN-${line.itemId.toUpperCase().slice(-6)}-${String(idx + 1).padStart(3, "0")}`,
            ];

          return {
            id: `lline-${newLoanId}-${idx + 1}`,
            itemId: line.itemId,
            itemName: line.itemName,
            category: line.category,
            equipmentClass: line.equipmentClass,
            borrowedQuantity: line.approvedQuantity,
            returnedQuantity: 0,
            conditionOnHandover: "GOOD",
            serialNumbers: serials,
            returnRequestedQuantity: 0,
          };
        });

      const newLoan: LoanRecord = {
        id: newLoanId,
        requestId: req.id,
        userId: req.userId,
        userName: req.userName,
        userEmail: req.userEmail,
        projectId: req.projectId,
        projectName: req.projectName,
        borrowDate: nowIso,
        dueDate: req.expectedReturnDate,
        lifecycleStatus: "ACTIVE",
        dueStatus: "ON_TIME",
        returnStatus: "NONE",
        status: "ACTIVE",
        items: loanLines,
        extensionStatus: "NONE",
        extensionRequests: [],
        returnRequests: [],
        handedOverBy:
          actorRole === "SUPERADMIN"
            ? "Amine Elkadhi (RAS Chairman)"
            : "Emna Taghlet (Logistics Board)",
        notes: payload.notes,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      draft.loans.unshift(newLoan);

      // Update user active loans count
      const borrower = draft.userProfiles[req.userId];
      if (borrower) {
        borrower.activeLoansCount = (borrower.activeLoansCount || 0) + 1;
      }

      // 4. Send Notification to Member
      draft.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: req.userId,
        title: `Equipment Handover Complete (${newLoanId})`,
        message: `Your physical handover has been verified at the workshop. Active loan ${newLoanId} is on track with return deadline ${req.expectedReturnDate}.`,
        type: "REQUEST_APPROVED",
        read: false,
        link: `/app/loans/${newLoanId}`,
        createdAt: nowIso,
      });

      updatedRequest = { ...req };
    });

    if (updatedRequest && newLoanId) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "HANDOVER_CONFIRMED",
        entityType: "LOAN",
        entityId: newLoanId,
        after: { requestId: payload.requestId, loanId: newLoanId },
        reason: payload.notes || "Physical equipment handover completed",
      });

      return { request: updatedRequest, loanId: newLoanId };
    }
    throw new Error("Failed to confirm handover");
  }
}

export const mockBoardRequestService = new MockBoardRequestService();
