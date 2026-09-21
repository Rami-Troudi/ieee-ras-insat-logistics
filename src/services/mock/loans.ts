import { ILoanService } from "../contracts/loans";
import { LoanRecord, RequestExtensionPayload, RequestReturnPayload } from "@/types";
import { mockDb } from "@/mocks/db";

export class MockLoanService implements ILoanService {
  private defaultDelayMs = 250;

  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
  }

  async listUserLoans(userId: string): Promise<LoanRecord[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    return snapshot.loans
      .filter((l) => l.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLoan(id: string): Promise<LoanRecord | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    return snapshot.loans.find((l) => l.id === id) || null;
  }

  async requestExtension(payload: RequestExtensionPayload, userId: string): Promise<LoanRecord> {
    await this.simulateLatency();
    let updatedLoan: LoanRecord | null = null;

    mockDb.mutate((draft) => {
      const loan = draft.loans.find((l) => l.id === payload.loanId && l.userId === userId);
      if (!loan) {
        throw new Error("Loan record not found or unauthorized");
      }
      if (loan.status === "CLOSED" || loan.status === "RETURNED") {
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
          const maxReturnable = line.borrowedQuantity - line.returnedQuantity;
          if (item.quantity > maxReturnable) {
            throw new Error(
              `Cannot return ${item.quantity} units; only ${maxReturnable} outstanding.`
            );
          }
          line.returnRequestedQuantity = (line.returnRequestedQuantity || 0) + item.quantity;
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
