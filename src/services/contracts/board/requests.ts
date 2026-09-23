import { BorrowRequest, RequestDecisionStatus } from "@/types";

export interface LineDecisionInput {
  lineId: string;
  approvedQuantity: number;
  rejectionReason?: string;
  assignedAssetIds?: string[];
}

export interface ReviewRequestPayload {
  requestId: string;
  lines: LineDecisionInput[];
  decisionNotes?: string;
}

export interface HandoverPayload {
  requestId: string;
  lineHandoverDetails?: {
    lineId: string;
    serialNumbers?: string[];
  }[];
  notes?: string;
}

export interface RequestFilterParams {
  decisionStatus?: RequestDecisionStatus | "ALL";
  handoverStatus?: "WAITING" | "HANDED_OVER" | "ALL";
  needsSupervision?: boolean;
  needsLevelVI?: boolean;
  needsVerification?: boolean;
  search?: string;
}

export interface IBoardRequestService {
  getRequests(filters?: RequestFilterParams): Promise<BorrowRequest[]>;
  getRequestById(requestId: string): Promise<BorrowRequest | null>;
  reviewRequest(
    payload: ReviewRequestPayload,
    actorUserId: string,
    _actorRole?: string,
    _actorClearance?: string
  ): Promise<BorrowRequest>;
  rejectEntireRequest(
    requestId: string,
    reason: string,
    actorUserId: string,
    _actorRole?: string
  ): Promise<BorrowRequest>;
  confirmHandover(
    payload: HandoverPayload,
    actorUserId: string,
    _actorRole?: string
  ): Promise<{ request: BorrowRequest; loanId: string }>;
}
