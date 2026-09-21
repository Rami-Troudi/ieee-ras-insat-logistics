import { EquipmentClass, AssetCondition } from "./inventory";

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
  returnRequestedQuantity?: number;
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
  dueDate: string;
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
