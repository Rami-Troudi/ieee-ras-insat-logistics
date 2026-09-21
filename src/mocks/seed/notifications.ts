import { AppNotification } from "@/types";

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    userId: "p-member-ieee",
    title: "Request Partially Approved (48h Pickup Window)",
    message:
      "Request REQ-2026-0142 has been partially approved. 1x STM32 and 4x Stepper Drivers are reserved for 48 hours.",
    type: "REQUEST_PARTIALLY_APPROVED",
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    link: "/app/requests/REQ-2026-0142",
    metadata: {
      requestId: "REQ-2026-0142",
    },
  },
  {
    id: "notif-2",
    userId: "p-member-ieee",
    title: "Equipment Due Soon",
    message:
      "Raspberry Pi 4 on loan LN-2026-0072 is due in 2 days. An extension request is currently pending board review.",
    type: "LOAN_DUE_SOON",
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: "/app/loans/LN-2026-0072",
    metadata: {
      loanId: "LN-2026-0072",
    },
  },
  {
    id: "notif-3",
    userId: "p-member-ieee",
    title: "Return Confirmed & Loan Closed",
    message:
      "Return of 2x Arduino Uno R3 for loan LN-2026-0044 has been inspected and confirmed by the Logistics Custodian.",
    type: "RETURN_CONFIRMED",
    read: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    link: "/app/loans/LN-2026-0044",
    metadata: {
      loanId: "LN-2026-0044",
    },
  },
];
