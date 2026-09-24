import { EquipmentClass, AssetCondition } from "./inventory";

// Multi-dimensional loan statuses
export type LoanLifecycleStatus = "ACTIVE" | "CLOSED";
export type LoanDueStatus = "ON_TIME" | "DUE_SOON" | "OVERDUE";
export type LoanReturnStatus = "NONE" | "PARTIAL" | "COMPLETE";

export type LoanStatus =
  "ACTIVE" | "DUE_SOON" | "OVERDUE" | "PARTIALLY_RETURNED" | "RETURNED" | "CLOSED";

export interface LoanLineItem {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  equipmentClass: EquipmentClass;
  borrowedQuantity: number;
  returnedQuantity: number;
  lostQuantity: number;
  conditionOnHandover: AssetCondition;
  assetIds?: string[];
  resolvedAssetIds?: string[];
  serialNumbers?: string[];
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
  dueDate: string; // Expected return date; operators can update it after handover
  lifecycleStatus: LoanLifecycleStatus;
  dueStatus: LoanDueStatus;
  returnStatus: LoanReturnStatus;
  status: LoanStatus;
  items: LoanLineItem[];
  handedOverBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function getLoanDisplayStatus(loan: {
  status?: LoanStatus;
  dueStatus?: LoanDueStatus;
  returnStatus?: LoanReturnStatus;
  lifecycleStatus?: LoanLifecycleStatus;
}): LoanStatus {
  if (loan.lifecycleStatus === "CLOSED") return "CLOSED";
  if (loan.returnStatus === "COMPLETE") return "RETURNED";
  if (loan.returnStatus === "PARTIAL") return "PARTIALLY_RETURNED";
  if (loan.dueStatus === "OVERDUE") return "OVERDUE";
  if (loan.dueStatus === "DUE_SOON") return "DUE_SOON";
  if (loan.status) return loan.status;
  return "ACTIVE";
}
