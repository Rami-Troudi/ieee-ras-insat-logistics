import { ILoanService } from "../contracts/loans";
import { LoanRecord, RequestExtensionPayload, RequestReturnPayload } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";

export class MockLoanService implements ILoanService {
  private defaultDelayMs = 250;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listUserLoans(userId: string): Promise<LoanRecord[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    return snapshot.loans
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLoan(id: string, userId?: string): Promise<LoanRecord | null> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return null;
    const snapshot = mockDb.getSnapshot();
    const loan = snapshot.loans.find((l) => l.id === id);
    if (!loan) return null;
    // Ownership check if userId is provided
    if (userId && loan.userId !== userId) {
      throw new Error("Unauthorized: You do not have permission to view this loan record.");
    }
    return loan;
  }

  async requestExtension(payload: RequestExtensionPayload, userId: string): Promise<LoanRecord> {
    await this.simulateLatency();
    let updatedLoan: LoanRecord | null = null;

    mockDb.mutate((draft) => {
      const loan = draft.loans.find((l) => l.id === payload.loanId && l.userId === userId);
      if (!loan) {
        throw new Error("Loan record not found or unauthorized");
      }
      if (loan.lifecycleStatus === "CLOSED") {
        throw new Error("Cannot request extension on closed loans");
      }
      if (loan.extensionStatus === "PENDING") {
        throw new Error("An extension request is already pending board review");
      }

      const extRecord = {
        id: `ext-${Date.now()}`,
        requestedDate: new Date().toISOString(),
        proposedReturnDate: payload.proposedReturnDate,
        reason: payload.reason,
        status: "PENDING" as const,
      };

      // Crucial: do NOT change loan.dueDate (official due date remains unchanged)
      loan.extensionStatus = "PENDING";
      loan.extensionRequests.unshift(extRecord);
      loan.updatedAt = new Date().toISOString();

      updatedLoan = { ...loan };
    });

    if (!updatedLoan) {
      throw new Error("Failed to request loan extension");
    }

    return updatedLoan;
  }

  async requestReturn(payload: RequestReturnPayload, userId: string): Promise<LoanRecord> {
    await this.simulateLatency();
    let updatedLoan: LoanRecord | null = null;

    mockDb.mutate((draft) => {
      const loan = draft.loans.find((l) => l.id === payload.loanId && l.userId === userId);
      if (!loan) {
        throw new Error("Loan record not found or unauthorized");
      }

      payload.items.forEach((item) => {
        const line = loan.items.find((i) => i.id === item.lineItemId);
        if (line) {
          // Authoritative returnable quantity formula:
          // returnable = borrowedQuantity - returnedQuantity - (pending returnRequestedQuantity)
          const alreadyPending = line.returnRequestedQuantity || 0;
          const maxReturnable = line.borrowedQuantity - line.returnedQuantity - alreadyPending;
          if (item.quantity > maxReturnable) {
            throw new Error(
              `Cannot request return of ${item.quantity} units for ${line.itemName}; only ${maxReturnable} available to return (${alreadyPending} already pending confirmation).`
            );
          }
          line.returnRequestedQuantity = alreadyPending + item.quantity;
        }
      });

      const retRecord = {
        id: `ret-${Date.now()}`,
        requestedAt: new Date().toISOString(),
        status: "PENDING" as const,
        items: payload.items,
        memberNotes: payload.memberNotes,
      };

      loan.returnRequests.unshift(retRecord);
      loan.status = "RETURN_REQUESTED";
      loan.returnStatus = "PENDING_CONFIRMATION";
      loan.updatedAt = new Date().toISOString();

      updatedLoan = { ...loan };
    });

    if (!updatedLoan) {
      throw new Error("Failed to submit return request");
    }

    return updatedLoan;
  }
}

export const mockLoanService = new MockLoanService();
