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
      "Equipment on loan LN-2026-0042 is overdue by >14 days without an approved extension request. Automatic recommendation generated for human Board review.",
    status: "PENDING_REVIEW",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: "rec-2026-0002",
    userId: "p-member-ieee",
    userName: "Rami Troudi (IEEE Member)",
    sourceType: "DAMAGE",
    sourceEntityId: "LN-2026-0089",
    suggestedStrikeLevel: 1,
    description:
      "Physical return reported with damaged stepper driver pin header. Awaiting human assessment before issuing disciplinary action or compensation.",
    status: "PENDING_REVIEW",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];
