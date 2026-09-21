import { IInventoryService, InventoryQueryFilter } from "../contracts/inventory";
import { InventoryItemSummary } from "@/types";

export type MockScenario = "NORMAL" | "SUCCESS" | "EMPTY" | "ERROR" | "SLOW";

export const MOCK_ITEMS: InventoryItemSummary[] = [
  {
    id: "item-stm32-f4",
    name: "STM32F401RE Nucleo-64",
    description: "ARM Cortex-M4 microcontroller development board, 84 MHz CPU with FPU.",
    category: "Development Boards",
    equipmentClass: "E",
    trackingMode: "INDIVIDUAL_ASSET",
    totalQuantity: 8,
    availableQuantity: 5,
    allocatedQuantity: 2,
    borrowedQuantity: 1,
    damagedQuantity: 0,
    isFavorite: true,
  },
  {
    id: "item-arduino-uno",
    name: "Arduino Uno R3",
    description: "ATmega328P microcontroller board with 14 digital I/O pins and 6 analog inputs.",
    category: "Development Boards",
    equipmentClass: "E",
    trackingMode: "QUANTITY",
    totalQuantity: 18,
    availableQuantity: 12,
    allocatedQuantity: 1,
    borrowedQuantity: 5,
    damagedQuantity: 0,
    isFavorite: false,
  },
  {
    id: "item-pololu-driver",
    name: "A4988 Stepper Motor Driver",
    description: "Microstepping driver with built-in translator for easy stepper control.",
    category: "Actuators & Drivers",
    equipmentClass: "E",
    trackingMode: "QUANTITY",
    totalQuantity: 24,
    availableQuantity: 18,
    allocatedQuantity: 4,
    borrowedQuantity: 2,
    damagedQuantity: 0,
    isFavorite: true,
  },
  {
    id: "item-soldering-station",
    name: "Weller Soldering Station 70W",
    description: "Precision temperature-controlled digital soldering iron.",
    category: "Workshop Equipment",
    equipmentClass: "F",
    trackingMode: "INDIVIDUAL_ASSET",
    totalQuantity: 3,
    availableQuantity: 2,
    allocatedQuantity: 0,
    borrowedQuantity: 1,
    damagedQuantity: 0,
    isFavorite: false,
  },
  {
    id: "item-glue-sticks",
    name: "Hot Melt Glue Sticks (Pack of 10)",
    description: "11mm multipurpose clear adhesive sticks for prototyping.",
    category: "Consumables",
    equipmentClass: "A",
    trackingMode: "QUANTITY",
    totalQuantity: 50,
    availableQuantity: 42,
    allocatedQuantity: 0,
    borrowedQuantity: 8,
    damagedQuantity: 0,
    isFavorite: false,
  },
];

export class MockInventoryService implements IInventoryService {
  private defaultDelayMs: number;
  private scenario: MockScenario = "NORMAL";

  constructor(defaultDelayMs = 250) {
    this.defaultDelayMs = defaultDelayMs;
  }

  setScenario(scenario: MockScenario): void {
    this.scenario = scenario;
  }

  getScenario(): MockScenario {
    return this.scenario;
  }

  private async simulateLatency(): Promise<void> {
    let delay = this.defaultDelayMs;
    if (this.scenario === "SLOW") {
      delay = 1500;
    }
    await new Promise((res) => setTimeout(res, delay));
    if (this.scenario === "ERROR") {
      throw new Error("Simulated mock service network error");
    }
  }

  async listItems(filters?: InventoryQueryFilter): Promise<InventoryItemSummary[]> {
    await this.simulateLatency();

    if (this.scenario === "EMPTY") {
      return [];
    }

    let items = [...MOCK_ITEMS];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q)
      );
    }
    if (filters?.equipmentClass) {
      items = items.filter((it) => it.equipmentClass === filters.equipmentClass);
    }
    if (filters?.availableOnly) {
      items = items.filter((it) => it.availableQuantity > 0);
    }
    return items;
  }

  async getItem(id: string): Promise<InventoryItemSummary | null> {
    await this.simulateLatency();

    if (this.scenario === "EMPTY") {
      return null;
    }

    const found = MOCK_ITEMS.find((it) => it.id === id);
    return found || null;
  }
}

export const mockInventoryService = new MockInventoryService();
