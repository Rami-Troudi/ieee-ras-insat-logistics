import { DisciplinaryRecommendation } from "@/types";

export const INITIAL_RECOMMENDATIONS: DisciplinaryRecommendation[] = [
  {
    id: "rec-2026-0001",
    userId: "p-member-restricted",
    userName: "Borrower (Strike 2 Active)",
    sourceType: "OVERDUE_14_DAYS",
    sourceEntityId: "LN-2026-0042",
    suggestedStrikeLevel: 3,
    description:
      "Loan LN-2026-0042 is more than 14 days overdue. Review the loan history and evidence before deciding whether to issue a strike.",
    status: "PENDING_REVIEW",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];
