import { IInventoryService } from "../contracts/inventory";
import { BorrowerCatalogItem, InventoryQueryFilter } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager, MockScenario } from "./scenario";
import {
  getBorrowerCatalogAccess,
  toBorrowerCatalogItem,
} from "@/features/inventory/utils/catalogAccess";

export type { MockScenario };

export class MockInventoryService implements IInventoryService {
  constructor(private defaultDelayMs = 200) {}

  setScenario(scenario: MockScenario): void {
    scenarioManager.setScenario(scenario);
  }

  getScenario(): MockScenario {
    return scenarioManager.getScenario();
  }

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listItems(filters?: InventoryQueryFilter, userId?: string): Promise<BorrowerCatalogItem[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    const effectiveUserId = userId || Object.keys(snapshot.userProfiles)[0] || "p-member-ieee";
    const user = snapshot.userProfiles[effectiveUserId];
    if (!user) return [];
    return snapshot.inventory.flatMap((item) => {
      const access = getBorrowerCatalogAccess(user, item);
      if (!access.visible) return [];
      if (filters?.availableOnly && access.availability === "UNAVAILABLE") return [];
      if (filters?.category && item.category !== filters.category) return [];
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        if (
          ![item.name, item.description, item.category, ...(item.aliases || [])].some((value) =>
            value.toLowerCase().includes(query)
          )
        )
          return [];
      }
      return [toBorrowerCatalogItem(item, access)];
    });
  }

  async getItem(id: string, userId?: string): Promise<BorrowerCatalogItem | null> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return null;
    const snapshot = mockDb.getSnapshot();
    const effectiveUserId = userId || Object.keys(snapshot.userProfiles)[0] || "p-member-ieee";
    const user = snapshot.userProfiles[effectiveUserId];
    const item = snapshot.inventory.find((candidate) => candidate.id === id);
    if (!user || !item) return null;
    const access = getBorrowerCatalogAccess(user, item);
    return access.visible ? toBorrowerCatalogItem(item, access) : null;
  }

  async getCategories(userId?: string): Promise<string[]> {
    const items = await this.listItems(undefined, userId);
    return [...new Set(items.map((item) => item.category))].sort();
  }
}

export const mockInventoryService = new MockInventoryService();
