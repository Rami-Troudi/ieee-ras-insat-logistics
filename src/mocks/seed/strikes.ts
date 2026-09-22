import { StrikeRecord } from "@/types";

export const INITIAL_STRIKES: StrikeRecord[] = [
  {
    id: "strk-1",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    level: 1,
    status: "ACTIVE",
    reason: "Unreturned battery pack past 2 weeks without notice (Strike 1 First Warning).",
    issuedBy: "p-board-logistics",
    issuedByName: "Emna Taghlet (Logistics Board)",
    issuedAt: "2025-11-10T14:00:00.000Z",
    expiresAt: "2026-06-30T23:59:59.000Z",
  },
  {
    id: "strk-2",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    level: 2,
    status: "ACTIVE",
    reason:
      "Late return of development board > 2 weeks overdue. Second warning (Strike 2): all requests require explicit Board approval, Classes F/G unavailable.",
    incidentId: "inc-2026-0002",
    issuedBy: "p-board-logistics",
    issuedByName: "Emna Taghlet (Logistics Board)",
    issuedAt: "2026-02-04T10:30:00.000Z",
    expiresAt: "2026-06-30T23:59:59.000Z",
  },
];
