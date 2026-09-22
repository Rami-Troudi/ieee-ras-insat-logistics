import { LoanRecord, AssetCondition } from "@/types";

export interface ReturnInspectionLineItem {
  lineItemId: string;
  returnedQuantity: number;
  condition: AssetCondition;
  notes?: string;
  damagedQuantity?: number;
  lostQuantity?: number;
}

export interface ConfirmReturnPayload {
  loanId: string;
  returnRequestId?: string;
  items: ReturnInspectionLineItem[];
  inspectionNotes?: string;
}

export interface ReviewExtensionPayload {
  loanId: string;
  extensionRequestId: string;
  decision: "APPROVED" | "REJECTED";
  decisionNotes?: string;
}

export interface BoardLoanFilterParams {
  lifecycleStatus?: "ACTIVE" | "CLOSED" | "ALL";
  dueStatus?: "ON_TIME" | "DUE_SOON" | "OVERDUE" | "ALL";
  returnStatus?: "NONE" | "PENDING_CONFIRMATION" | "PARTIAL" | "COMPLETE" | "ALL";
  extensionStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  search?: string;
}

export interface IBoardLoanService {
  getLoans(filters?: BoardLoanFilterParams): Promise<LoanRecord[]>;
  getLoanById(loanId: string): Promise<LoanRecord | null>;
  confirmReturn(
    payload: ConfirmReturnPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<LoanRecord>;
  reviewExtension(
    payload: ReviewExtensionPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<LoanRecord>;
  updateDueDate(loanId: string, dueDate: string, actorUserId: string): Promise<LoanRecord>;
}
