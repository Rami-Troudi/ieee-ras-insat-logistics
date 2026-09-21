export type NotificationType =
  | "REQUEST_APPROVED"
  | "REQUEST_PARTIALLY_APPROVED"
  | "REQUEST_REJECTED"
  | "PICKUP_REMINDER"
  | "PICKUP_EXPIRED"
  | "LOAN_DUE_SOON"
  | "LOAN_OVERDUE"
  | "EXTENSION_APPROVED"
  | "EXTENSION_REJECTED"
  | "RETURN_CONFIRMED"
  | "STRIKE_ISSUED"
  | "GENERAL";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: {
    requestId?: string;
    loanId?: string;
    itemId?: string;
  };
}
