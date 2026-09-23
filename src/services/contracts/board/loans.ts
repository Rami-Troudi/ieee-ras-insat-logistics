import { LoanRecord, AssetCondition } from "@/types";

export interface ReturnInspectionLineItem {
  lineItemId: string;
  returnedQuantity: number;
  condition: AssetCondition;
  notes?: string;
  damagedQuantity?: number;
  lostQuantity?: number;
  assetIds?: string[];
}

export interface ConfirmReturnPayload {
  loanId: string;
  returnRequestId?: string;
  items: ReturnInspectionLineItem[];
  inspectionNotes?: string;
}

export interface BoardLoanFilterParams {
  lifecycleStatus?: "ACTIVE" | "CLOSED" | "ALL";
  dueStatus?: "ON_TIME" | "DUE_SOON" | "OVERDUE" | "ALL";
  returnStatus?: "NONE" | "PENDING_CONFIRMATION" | "PARTIAL" | "COMPLETE" | "ALL";
  search?: string;
}

export interface IBoardLoanService {
  getLoans(filters?: BoardLoanFilterParams): Promise<LoanRecord[]>;
  getLoanById(loanId: string): Promise<LoanRecord | null>;
  confirmReturn(
    payload: ConfirmReturnPayload,
    actorUserId: string,
    _actorRole?: string
  ): Promise<LoanRecord>;
  updateDueDate(loanId: string, dueDate: string, actorUserId: string): Promise<LoanRecord>;
}
