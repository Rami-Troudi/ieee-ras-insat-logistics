import { LoanRecord, RequestExtensionPayload, RequestReturnPayload } from "@/types";

export interface ILoanService {
  listUserLoans(userId: string): Promise<LoanRecord[]>;
  getLoan(id: string): Promise<LoanRecord | null>;
  requestExtension(payload: RequestExtensionPayload, userId: string): Promise<LoanRecord>;
  requestReturn(payload: RequestReturnPayload, userId: string): Promise<LoanRecord>;
}
