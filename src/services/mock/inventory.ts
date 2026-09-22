import { IInventoryService } from "../contracts/inventory";
import { InventoryItemSummary, InventoryQueryFilter } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager, MockScenario } from "./scenario";
import { evaluateItemEligibility } from "@/features/inventory/utils/eligibility";

export type { MockScenario };

export class MockInventoryService implements IInventoryService {
  private defaultDelayMs: number;

  constructor(defaultDelayMs = 200) {
    this.defaultDelayMs = defaultDelayMs;
  }

  setScenario(scenario: MockScenario): void {
    scenarioManager.setScenario(scenario);
  }

  getScenario(): MockScenario {
    return scenarioManager.getScenario();
  }

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listItems(
    filters?: InventoryQueryFilter,
    userId?: string
  ): Promise<InventoryItemSummary[]> {
    await this.simulateLatency();

    if (scenarioManager.isEmpty()) {
      return [];
    }

    const snapshot = mockDb.getSnapshot();
    let items = [...snapshot.inventory];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter((it) => {
        const nameMatch = it.name.toLowerCase().includes(q);
        const descMatch = it.description.toLowerCase().includes(q);
        const catMatch = it.category.toLowerCase().includes(q);
        const aliasMatch = it.aliases?.some((a) => a.toLowerCase().includes(q));
        const tagMatch = it.tags?.some((t) => t.toLowerCase().includes(q));
        return nameMatch || descMatch || catMatch || aliasMatch || tagMatch;
      });
    }

    if (filters?.equipmentClass) {
      items = items.filter((it) => it.equipmentClass === filters.equipmentClass);
    }
    if (filters?.category) {
      items = items.filter((it) => it.category === filters.category);
    }
    if (filters?.trackingMode) {
      items = items.filter((it) => it.trackingMode === filters.trackingMode);
    }
    if (filters?.availableOnly) {
      items = items.filter((it) => it.availableQuantity > 0);
    }
    if (filters?.favoritesOnly && userId) {
      const userFavs = snapshot.favorites[userId] || [];
      items = items.filter((it) => userFavs.includes(it.id));
    }
    if (filters?.borrowableByMe && userId) {
      const userProfile = snapshot.userProfiles[userId];
      if (userProfile) {
        items = items.filter((it) => {
          const res = evaluateItemEligibility(
            it.equipmentClass,
            userProfile.clearance,
            userProfile.status,
            userProfile.isProcessed,
            it.availableQuantity,
            userProfile.strikesCount
          );
          return res.canBorrowOnline && it.availableQuantity > 0;
        });
      }
    }

    return items;
  }

  async getItem(id: string): Promise<InventoryItemSummary | null> {
    await this.simulateLatency();

    if (scenarioManager.isEmpty()) {
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
