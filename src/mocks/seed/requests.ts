import { BorrowRequest, RequestLineItem } from "@/types";

const dateFromNow = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

function line(
  id: string,
  itemId: string,
  itemName: string,
  category: string,
  requestedQuantity: number,
  approvedQuantity = 0,
  handedOverQuantity = 0
): RequestLineItem {
  return {
    id,
    itemId,
    itemName,
    category,
    equipmentClass: "E",
    requestedQuantity,
    approvedQuantity,
    handedOverQuantity,
    returnedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    status: handedOverQuantity ? "FULFILLED" : approvedQuantity ? "APPROVED" : "PENDING",
  };
}

const member = {
  userId: "p-member-ieee",
  userName: "Rami Troudi",
  userEmail: "rami.ieee@insat.u-carthage.tn",
  userClearance: "III",
};

export const INITIAL_REQUESTS: BorrowRequest[] = [
  {
    ...member,
    id: "REQ-2026-0142",
    expectedReturnDate: dateFromNow(14).slice(0, 10),
    decisionStatus: "APPROVED",
    handoverStatus: "WAITING",
    lifecycleStatus: "ACTIVE",
    status: "APPROVED",
    items: [
      line("rline-ready-stm", "item-stm32-f4", "STM32F401RE Nucleo-64", "Development Boards", 1, 1),
      line(
        "rline-ready-driver",
        "item-pololu-driver",
        "A4988 Stepper Motor Driver Carrier",
        "Actuators & Drivers",
        4,
        4
      ),
    ],
    createdAt: dateFromNow(-1),
    updatedAt: dateFromNow(-0.5),
    reviewedAt: dateFromNow(-0.5),
    reviewedBy: "Emna Taghlet",
    pickupDeadline: dateFromNow(1.5),
    timeline: [
      { status: "PENDING", timestamp: dateFromNow(-1), description: "Request sent." },
      { status: "APPROVED", timestamp: dateFromNow(-0.5), description: "Ready to pick up." },
    ],
  },
  {
    ...member,
    id: "REQ-2026-0155",
    expectedReturnDate: dateFromNow(7).slice(0, 10),
    decisionStatus: "PENDING",
    handoverStatus: "WAITING",
    lifecycleStatus: "ACTIVE",
    status: "PENDING",
    items: [
      line("rline-waiting-uno", "item-arduino-uno", "Arduino Uno R3", "Development Boards", 1),
    ],
    createdAt: dateFromNow(-0.1),
    updatedAt: dateFromNow(-0.1),
    timeline: [{ status: "PENDING", timestamp: dateFromNow(-0.1), description: "Request sent." }],
  },
  {
    ...member,
    id: "REQ-2026-0098",
    expectedReturnDate: dateFromNow(4).slice(0, 10),
    decisionStatus: "APPROVED",
    handoverStatus: "HANDED_OVER",
    lifecycleStatus: "CLOSED",
    status: "HANDED_OVER",
    items: [
      line(
        "rline-loan-stm",
        "item-stm32-f4",
        "STM32F401RE Nucleo-64",
        "Development Boards",
        1,
        1,
        1
      ),
      line(
        "rline-loan-driver",
        "item-pololu-driver",
        "A4988 Stepper Motor Driver Carrier",
        "Actuators & Drivers",
        2,
        2,
        2
      ),
    ],
    createdAt: dateFromNow(-11),
    updatedAt: dateFromNow(-10),
    reviewedAt: dateFromNow(-10.5),
    reviewedBy: "Emna Taghlet",
    timeline: [
      { status: "PENDING", timestamp: dateFromNow(-11), description: "Request sent." },
      { status: "APPROVED", timestamp: dateFromNow(-10.5), description: "Ready to pick up." },
      { status: "HANDED_OVER", timestamp: dateFromNow(-10), description: "Equipment handed over." },
    ],
  },
  {
    ...member,
    id: "REQ-2026-0050",
    expectedReturnDate: dateFromNow(-20).slice(0, 10),
    decisionStatus: "APPROVED",
    handoverStatus: "HANDED_OVER",
    lifecycleStatus: "CLOSED",
    status: "HANDED_OVER",
    items: [
      line("rline-past-uno", "item-arduino-uno", "Arduino Uno R3", "Development Boards", 2, 2, 2),
    ],
    createdAt: dateFromNow(-45),
    updatedAt: dateFromNow(-44),
    reviewedAt: dateFromNow(-44.5),
    reviewedBy: "Emna Taghlet",
    timeline: [
      { status: "PENDING", timestamp: dateFromNow(-45), description: "Request sent." },
      { status: "APPROVED", timestamp: dateFromNow(-44.5), description: "Ready to pick up." },
      { status: "HANDED_OVER", timestamp: dateFromNow(-44), description: "Equipment handed over." },
    ],
  },
];
