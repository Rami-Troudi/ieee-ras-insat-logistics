import {
  IBoardLoanService,
  ConfirmReturnPayload,
  ReviewExtensionPayload,
  BoardLoanFilterParams,
} from "@/services/contracts/board/loans";
import { LoanRecord, Role } from "@/types";
import { isDatePast } from "@/lib/dates";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";

class MockBoardLoanService implements IBoardLoanService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getLoans(filters?: BoardLoanFilterParams): Promise<LoanRecord[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let loans = [...snapshot.loans];

    if (filters?.lifecycleStatus && filters.lifecycleStatus !== "ALL") {
      loans = loans.filter((l) => l.lifecycleStatus === filters.lifecycleStatus);
    }
    if (filters?.dueStatus && filters.dueStatus !== "ALL") {
      if (filters.dueStatus === "OVERDUE") {
        loans = loans.filter(
          (l) =>
            l.lifecycleStatus === "ACTIVE" && (l.dueStatus === "OVERDUE" || isDatePast(l.dueDate))
        );
      } else {
        loans = loans.filter((l) => l.dueStatus === filters.dueStatus);
      }
    }
    if (filters?.returnStatus && filters.returnStatus !== "ALL") {
      loans = loans.filter((l) => l.returnStatus === filters.returnStatus);
    }
    if (filters?.extensionStatus && filters.extensionStatus !== "ALL") {
      loans = loans.filter((l) => l.extensionStatus === filters.extensionStatus);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      loans = loans.filter(
        (l) =>
          l.id.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.userEmail.toLowerCase().includes(q) ||
          (l.projectName && l.projectName.toLowerCase().includes(q)) ||
          l.items.some((i) => i.itemName.toLowerCase().includes(q))
      );
    }

    return loans.sort(
      (a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
    );
  }

  async getLoanById(loanId: string): Promise<LoanRecord | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const loan = snapshot.loans.find((l) => l.id === loanId);
    return loan ? { ...loan } : null;
  }

  async confirmReturn(
    payload: ConfirmReturnPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<LoanRecord> {
    await this.simulateLatency();
    let updatedLoan: LoanRecord | null = null;

    mockDb.mutate((draft) => {
      const loan = draft.loans.find((l) => l.id === payload.loanId);
      if (!loan) throw new Error("Loan record not found");
      if (loan.lifecycleStatus === "CLOSED") {
        throw new Error("Cannot confirm return for an already closed loan");
      }

      const nowIso = new Date().toISOString();
      const actorName =
        actorRole === "SUPERADMIN"
          ? "Amine Elkadhi (RAS Chairman)"
          : "Emna Taghlet (Logistics Board)";

      payload.items.forEach((itemInput) => {
        const line = loan.items.find((i) => i.id === itemInput.lineItemId);
        if (!line) throw new Error(`Loan line ${itemInput.lineItemId} not found`);

        const returnQty = itemInput.returnedQuantity;
        if (returnQty <= 0) return;

        const maxReturnable = line.borrowedQuantity - line.returnedQuantity;
        if (returnQty > maxReturnable) {
          throw new Error(
            `Cannot confirm return of ${returnQty} units for ${line.itemName}; only ${maxReturnable} units outstanding in custody.`
          );
        }

        // Adjust line quantities
        line.returnRequestedQuantity = Math.max(0, (line.returnRequestedQuantity || 0) - returnQty);
        line.returnedQuantity += returnQty;

        // Inventory Stock Accounting
        const invItem = draft.inventory.find((i) => i.id === line.itemId);
        if (invItem) {
          invItem.borrowedQuantity = Math.max(0, invItem.borrowedQuantity - returnQty);

          if (itemInput.condition === "GOOD" || itemInput.condition === "MINOR_ISSUE") {
            invItem.availableQuantity += returnQty;
          } else if (itemInput.condition === "DAMAGED" || itemInput.condition === "MAINTENANCE") {
            invItem.damagedQuantity += returnQty;

            // Log damage incident & recommendation for review
            draft.incidents.unshift({
              id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: `Hardware Damage on Return (${line.itemName})`,
              description: `Physical return inspection noted damaged equipment (${returnQty}x ${line.itemName}). Notes: ${itemInput.notes || "Damaged on return"}`,
              severity: "HIGH",
              category: "DAMAGE",
              status: "OPEN",
              userId: loan.userId,
              userName: loan.userName,
              relatedLoanId: loan.id,
              relatedItemId: line.itemId,
              reportedBy: actorUserId,
              reportedByName: actorName,
              reportedAt: nowIso,
            });

            draft.recommendations.unshift({
              id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              userId: loan.userId,
              userName: loan.userName,
              sourceType: "DAMAGE",
              sourceEntityId: loan.id,
              suggestedStrikeLevel: 1,
              description: `Physical return inspection noted damaged equipment (${returnQty}x ${line.itemName}) with condition ${itemInput.condition}.`,
              status: "PENDING_REVIEW",
              createdAt: nowIso,
            });
          } else if (itemInput.condition === "LOST") {
            invItem.totalQuantity = Math.max(0, invItem.totalQuantity - returnQty);

            draft.incidents.unshift({
              id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              title: `Hardware Lost on Return (${line.itemName})`,
              description: `Physical return confirmed lost equipment (${returnQty}x ${line.itemName}). Notes: ${itemInput.notes || "Lost on return"}`,
              severity: "CRITICAL",
              category: "LOST",
              status: "OPEN",
              userId: loan.userId,
              userName: loan.userName,
              relatedLoanId: loan.id,
              relatedItemId: line.itemId,
              reportedBy: actorUserId,
              reportedByName: actorName,
              reportedAt: nowIso,
            });

            draft.recommendations.unshift({
              id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              userId: loan.userId,
              userName: loan.userName,
              sourceType: "LOST",
              sourceEntityId: loan.id,
              suggestedStrikeLevel: 2,
              description: `Physical return confirmed lost equipment (${returnQty}x ${line.itemName}). Human review required.`,
              status: "PENDING_REVIEW",
              createdAt: nowIso,
            });
          }

          // Individual asset condition update
          if (invItem.assets && line.serialNumbers) {
            line.serialNumbers.forEach((sn) => {
              const asset = invItem.assets!.find((a) => a.serialNumber === sn);
              if (asset) {
                asset.condition = itemInput.condition;
                asset.isAvailable =
                  itemInput.condition === "GOOD" || itemInput.condition === "MINOR_ISSUE";
              }
            });
          }

          // Log return movement event
          draft.inventoryEvents.unshift({
            id: `iev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            itemId: invItem.id,
            itemName: invItem.name,
            type: "RETURN",
            quantity: returnQty,
            beforeState: {
              total: invItem.totalQuantity,
              available:
                invItem.availableQuantity -
                (itemInput.condition === "GOOD" || itemInput.condition === "MINOR_ISSUE"
                  ? returnQty
                  : 0),
              allocated: invItem.allocatedQuantity,
              borrowed: invItem.borrowedQuantity + returnQty,
              damaged:
                invItem.damagedQuantity - (itemInput.condition === "DAMAGED" ? returnQty : 0),
            },
            afterState: {
              total: invItem.totalQuantity,
              available: invItem.availableQuantity,
              allocated: invItem.allocatedQuantity,
              borrowed: invItem.borrowedQuantity,
              damaged: invItem.damagedQuantity,
            },
            reason: `Confirmed return from loan ${loan.id} (Condition: ${itemInput.condition})`,
            actorUserId,
            actorName,
            timestamp: nowIso,
          });
        }
      });

      // Update return requests record in loan
      if (payload.returnRequestId) {
        const retReq = loan.returnRequests.find((r) => r.id === payload.returnRequestId);
        if (retReq) {
          retReq.status = "CONFIRMED";
          retReq.confirmedAt = nowIso;
          retReq.confirmedBy = actorName;
        }
      } else if (loan.returnRequests.length > 0) {
        const latestPending = loan.returnRequests.find((r) => r.status === "PENDING");
        if (latestPending) {
          latestPending.status = "CONFIRMED";
          latestPending.confirmedAt = nowIso;
          latestPending.confirmedBy = actorName;
        }
      }

      // Check if all lines are fully returned
      const totalBorrowed = loan.items.reduce((s, i) => s + i.borrowedQuantity, 0);
      const totalReturned = loan.items.reduce((s, i) => s + i.returnedQuantity, 0);

      if (totalReturned >= totalBorrowed) {
        loan.lifecycleStatus = "CLOSED";
        loan.returnStatus = "COMPLETE";
        loan.status = "CLOSED";

        // Decrement borrower active loans count
        const borrower = draft.userProfiles[loan.userId];
        if (borrower) {
          borrower.activeLoansCount = Math.max(0, (borrower.activeLoansCount || 1) - 1);
        }
      } else {
        loan.lifecycleStatus = "ACTIVE";
        loan.returnStatus = "PARTIAL";
        loan.status = "PARTIALLY_RETURNED";
      }

      loan.updatedAt = nowIso;

      // Notification to member
      draft.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: loan.userId,
        title: `Return Confirmed for Loan (${loan.id})`,
        message:
          loan.lifecycleStatus === "CLOSED"
            ? `All equipment for loan ${loan.id} has been physically inspected, verified, and restocked. Your custody record is now CLOSED.`
            : `Partial return confirmed for loan ${loan.id}. Remaining units remain under active custody.`,
        type: "RETURN_CONFIRMED",
        read: false,
        link: `/app/loans/${loan.id}`,
        createdAt: nowIso,
      });

      updatedLoan = { ...loan };
    });

    if (updatedLoan) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "RETURN_CONFIRMED",
        entityType: "LOAN",
        entityId: (updatedLoan as LoanRecord).id,
        after: updatedLoan,
        reason: payload.inspectionNotes || "Physical return inspection completed",
      });

      return updatedLoan;
    }
    throw new Error("Failed to confirm return");
  }

  async reviewExtension(
    payload: ReviewExtensionPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<LoanRecord> {
    await this.simulateLatency();
    let updatedLoan: LoanRecord | null = null;

    mockDb.mutate((draft) => {
      const loan = draft.loans.find((l) => l.id === payload.loanId);
      if (!loan) throw new Error("Loan record not found");
      if (loan.lifecycleStatus === "CLOSED") {
        throw new Error("Cannot review extension on closed loans");
      }

      const ext =
        loan.extensionRequests.find((e) => e.id === payload.extensionRequestId) ||
        loan.extensionRequests[0];

      if (!ext) throw new Error("Extension request not found");

      const nowIso = new Date().toISOString();
      const actorName =
        actorRole === "SUPERADMIN"
          ? "Amine Elkadhi (RAS Chairman)"
          : "Emna Taghlet (Logistics Board)";

      ext.reviewedAt = nowIso;
      ext.reviewedBy = actorName;
      ext.decisionNotes = payload.decisionNotes;

      if (payload.decision === "APPROVED") {
        ext.status = "APPROVED";
        loan.dueDate = ext.proposedReturnDate;
        loan.extensionStatus = "APPROVED";
        loan.dueStatus = isDatePast(ext.proposedReturnDate) ? "OVERDUE" : "ON_TIME";

        draft.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: loan.userId,
          title: `Extension Approved for Loan (${loan.id})`,
          message: `Your extension request for loan ${loan.id} was approved. Your new return deadline is ${ext.proposedReturnDate}.`,
          type: "EXTENSION_APPROVED",
          read: false,
          link: `/app/loans/${loan.id}`,
          createdAt: nowIso,
        });
      } else {
        ext.status = "REJECTED";
        loan.extensionStatus = "REJECTED";

        draft.notifications.unshift({
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: loan.userId,
          title: `Extension Rejected for Loan (${loan.id})`,
          message: `Your extension request for loan ${loan.id} was rejected. Reason: ${payload.decisionNotes || "Disallowed by Board policy"}. Official due date remains ${loan.dueDate}.`,
          type: "REQUEST_REJECTED",
          read: false,
          link: `/app/loans/${loan.id}`,
          createdAt: nowIso,
        });
      }

      loan.updatedAt = nowIso;
      updatedLoan = { ...loan };
    });

    if (updatedLoan) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: payload.decision === "APPROVED" ? "EXTENSION_APPROVED" : "EXTENSION_REJECTED",
        entityType: "LOAN",
        entityId: (updatedLoan as LoanRecord).id,
        after: updatedLoan,
        reason: payload.decisionNotes || `Extension decision: ${payload.decision}`,
      });

      return updatedLoan;
    }
    throw new Error("Failed to process extension review");
  }
}

export const mockBoardLoanService = new MockBoardLoanService();
