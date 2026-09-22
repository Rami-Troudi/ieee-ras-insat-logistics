import { EquipmentClass, AssetCondition } from "./inventory";

// Multi-dimensional loan statuses
export type LoanLifecycleStatus = "ACTIVE" | "CLOSED";
export type LoanDueStatus = "ON_TIME" | "DUE_SOON" | "OVERDUE";
export type LoanReturnStatus = "NONE" | "PENDING_CONFIRMATION" | "PARTIAL" | "COMPLETE";

export type LoanStatus =
  | "ACTIVE"
  | "DUE_SOON"
  | "OVERDUE"
  | "RETURN_REQUESTED"
  | "PARTIALLY_RETURNED"
  | "RETURNED"
  | "CLOSED";

export type ExtensionStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface LoanLineItem {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  equipmentClass: EquipmentClass;
  borrowedQuantity: number;
  returnedQuantity: number;
  conditionOnHandover: AssetCondition;
  serialNumbers?: string[];
  returnRequestedQuantity?: number; // quantity pending physical return confirmation
}

export interface ExtensionRequestRecord {
  id: string;
  requestedDate: string;
  proposedReturnDate: string;
  reason: string;
  status: ExtensionStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
}

export interface ReturnRequestRecord {
  id: string;
  requestedAt: string;
  status: "PENDING" | "CONFIRMED";
  items: {
    lineItemId: string;
    quantity: number;
    conditionReport: string;
  }[];
  memberNotes?: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface LoanRecord {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  projectId?: string;
  projectName?: string;
  borrowDate: string;
  dueDate: string; // official due date - not changed by pending extensions
  lifecycleStatus: LoanLifecycleStatus;
  dueStatus: LoanDueStatus;
  returnStatus: LoanReturnStatus;
  status: LoanStatus;
  items: LoanLineItem[];
  extensionStatus: ExtensionStatus;
  extensionRequests: ExtensionRequestRecord[];
  returnRequests: ReturnRequestRecord[];
  handedOverBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestExtensionPayload {
  loanId: string;
  proposedReturnDate: string;
  reason: string;
}

export interface RequestReturnPayload {
  loanId: string;
  items: {
    lineItemId: string;
    quantity: number;
    conditionReport: string;
  }[];
  memberNotes?: string;
}

export function getLoanDisplayStatus(loan: {
  status?: LoanStatus;
  dueStatus?: LoanDueStatus;
  returnStatus?: LoanReturnStatus;
  lifecycleStatus?: LoanLifecycleStatus;
}): LoanStatus {
  if (loan.lifecycleStatus === "CLOSED") return "CLOSED";
  if (loan.returnStatus === "COMPLETE") return "RETURNED";
  if (loan.returnStatus === "PENDING_CONFIRMATION") return "RETURN_REQUESTED";
  if (loan.returnStatus === "PARTIAL") return "PARTIALLY_RETURNED";
  if (loan.dueStatus === "OVERDUE") return "OVERDUE";
  if (loan.dueStatus === "DUE_SOON") return "DUE_SOON";
  if (loan.status) return loan.status;
  return "ACTIVE";
}
