import { LoanRecord } from "@/types";

export interface ILoanService {
  listUserLoans(userId: string): Promise<LoanRecord[]>;
  getLoan(id: string, userId?: string): Promise<LoanRecord | null>;
}
