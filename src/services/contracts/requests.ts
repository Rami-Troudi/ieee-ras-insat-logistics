import { BorrowRequest, CreateBorrowRequestPayload } from "@/types";

export interface IRequestService {
  listUserRequests(userId: string): Promise<BorrowRequest[]>;
  getRequest(id: string): Promise<BorrowRequest | null>;
  createRequest(userId: string, payload: CreateBorrowRequestPayload): Promise<BorrowRequest>;
  cancelRequest(requestId: string, userId: string, reason?: string): Promise<BorrowRequest>;
}
