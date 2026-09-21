export type DomainStatus =
  | "PENDING"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "WAITING"
  | "HANDED_OVER"
  | "ACTIVE"
  | "CLOSED"
  | "RETURNED"
  | "PARTIALLY_RETURNED"
  | "RETURN_REQUESTED"
  | "AVAILABLE"
  | "BORROWED"
  | "DAMAGED"
  | "MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DUE_SOON"
  | "OVERDUE"
  | "RESTRICTED"
  | "BANNED"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "INFO";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
