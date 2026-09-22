import { AllocationRecord } from "@/types";

export interface IBoardAllocationService {
  getAllocations(filters?: {
    requestId?: string;
    itemId?: string;
    status?: "ACTIVE" | "HANDED_OVER" | "RELEASED" | "EXPIRED";
  }): Promise<AllocationRecord[]>;
  releaseAllocation(
    allocationId: string,
    actorUserId: string,
    reason?: string
  ): Promise<AllocationRecord>;
  checkAndExpireAllocations(): Promise<number>; // returns count of expired allocations
}
