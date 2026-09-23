import { ILoanService } from "../contracts/loans";
import { LoanRecord } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";

export class MockLoanService implements ILoanService {
  async listUserLoans(userId: string): Promise<LoanRecord[]> {
    await scenarioManager.simulateLatency(250);
    if (scenarioManager.isEmpty()) return [];
    return mockDb
      .getSnapshot()
      .loans.filter((loan) => loan.userId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  async getLoan(id: string, userId?: string): Promise<LoanRecord | null> {
    await scenarioManager.simulateLatency(250);
    if (scenarioManager.isEmpty()) return null;
    const loan = mockDb.getSnapshot().loans.find((record) => record.id === id);
    if (!loan) return null;
    if (userId && loan.userId !== userId)
      throw new Error("Unauthorized: you cannot view this loan");
    return loan;
  }
}

export const mockLoanService = new MockLoanService();
