import { EquipmentClass } from "./inventory";

export type RequestStatus =
  | "PENDING"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "HANDED_OVER";

export type RequestLineStatus = "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED";

export interface RequestLineItem {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  equipmentClass: EquipmentClass;
  requestedQuantity: number;
  approvedQuantity?: number;
  status: RequestLineStatus;
  rejectionReason?: string;
}

export type PickupWindowStatus = "NORMAL" | "DUE_SOON" | "URGENT" | "EXPIRED";

export interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userClearance: string;
  projectId?: string;
  projectName?: string;
  purpose: string;
  expectedReturnDate: string;
  status: RequestStatus;
  items: RequestLineItem[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
  rejectionReason?: string;
  pickupDeadline?: string; // 48h window from approval
  pickupStatus?: PickupWindowStatus;
  timeline: {
    status: string;
    timestamp: string;
    description: string;
    actor?: string;
  }[];
}

export interface CreateBorrowRequestPayload {
  projectId?: string;
  purpose: string;
  expectedReturnDate: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
}
