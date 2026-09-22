import { CompensationRecord } from "@/types";

export const INITIAL_COMPENSATIONS: CompensationRecord[] = [
  {
    id: "cmp-2026-0001",
    incidentId: "inc-2026-0002",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    amount: 45.0, // 45 TND replacement regulator & board component fee
    assessment:
      "Component repair cost for replacement LDO regulator and testbench soldering hours.",
    status: "PAID",
    receiptNumber: "REC-2026-0034",
    settledBy: "p-board-logistics",
    settledAt: "2026-02-08T15:00:00.000Z",
    createdAt: "2026-02-04T11:00:00.000Z",
    updatedAt: "2026-02-08T15:00:00.000Z",
    notes: "Settled in cash at logistics desk; receipt issued.",
  },
  {
    id: "cmp-2026-0002",
    incidentId: "inc-2026-0001",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    amount: 85.0,
    assessment: "Full replacement cost for missing 3S LiPo battery pack.",
    status: "PENDING",
    createdAt: "2026-02-15T10:00:00.000Z",
    updatedAt: "2026-02-15T10:00:00.000Z",
  },
];
