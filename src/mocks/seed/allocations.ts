import { AllocationRecord } from "@/types";

export const INITIAL_ALLOCATIONS: AllocationRecord[] = [
  {
    id: "alloc-2026-0001",
    requestId: "REQ-2026-0045",
    requestLineId: "item-stm32-f4",
    itemId: "item-stm32-f4",
    itemName: "STM32F401RE Nucleo-64 Development Board",
    quantity: 1,
    assetIds: ["sn-stm32-002"],
    status: "ACTIVE",
    allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours remaining (48h total)
    allocatedBy: "p-board-logistics",
    allocatedByName: "Emna Taghlet (Logistics Board)",
  },
  {
    id: "alloc-2026-0002",
    requestId: "REQ-2026-0142",
    requestLineId: "item-stm32-f4",
    itemId: "item-stm32-f4",
    itemName: "STM32F401RE Nucleo-64 Development Board",
    quantity: 1,
    assetIds: ["sn-stm32-003"],
    status: "ACTIVE",
    allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    allocatedBy: "p-board-logistics",
    allocatedByName: "Emna Taghlet (Logistics Board)",
  },
];
