import { IncidentRecord } from "@/types";

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: "inc-2026-0001",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    title: "Unreturned LiPo Battery Pack (>14 Days Overdue)",
    description:
      "Member failed to return 3S LiPo battery borrowed for test trials past the 2-week critical threshold. Formal incident logged for Board deliberation.",
    severity: "HIGH",
    status: "OPEN",
    category: "OVERDUE",
    relatedLoanId: "LN-2026-0042",
    relatedItemId: "item-lipo-battery",
    reportedBy: "p-board-logistics",
    reportedByName: "Emna Taghlet (Logistics Board)",
    reportedAt: "2026-02-01T11:00:00.000Z",
  },
  {
    id: "inc-2026-0002",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    title: "Overheating STM32 Board from Reverse Polarity",
    description:
      "Development board returned with scorched voltage regulator from reversed 12V supply rails.",
    severity: "MEDIUM",
    status: "RESOLVED",
    category: "DAMAGE",
    relatedItemId: "item-stm32-f4",
    reportedBy: "p-board-logistics",
    reportedByName: "Emna Taghlet (Logistics Board)",
    reportedAt: "2026-02-04T09:30:00.000Z",
    resolutionNotes:
      "Member agreed to cover component replacement cost. Strike 2 issued for reckless wiring.",
    strikeIssuedId: "strk-2",
    compensationId: "cmp-2026-0001",
  },
];
