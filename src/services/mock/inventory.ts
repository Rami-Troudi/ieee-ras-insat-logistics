import { IInventoryService, InventoryQueryFilter } from "../contracts/inventory";
import { InventoryItemSummary } from "@/types";
import { mockDb } from "@/mocks/db";

export type MockScenario = "NORMAL" | "SUCCESS" | "EMPTY" | "ERROR" | "SLOW";

export class MockInventoryService implements IInventoryService {
  private defaultDelayMs: number;
  private scenario: MockScenario = "NORMAL";

  constructor(defaultDelayMs = 200) {
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

    const snapshot = mockDb.getSnapshot();
    let items = [...snapshot.inventory];

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
    if (filters?.category) {
      items = items.filter((it) => it.category === filters.category);
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

    const snapshot = mockDb.getSnapshot();
    const found = snapshot.inventory.find((it) => it.id === id);
    return found || null;
  }

  async getCategories(): Promise<string[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const categories = Array.from(new Set(snapshot.inventory.map((i) => i.category)));
    return categories.sort();
  }
}

export const mockInventoryService = new MockInventoryService();
