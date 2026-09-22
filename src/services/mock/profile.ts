import { IProfileService, IProjectService, IFavoritesService } from "../contracts/profile";
import { UserProfile, ProjectSummary } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";

export class MockProfileService implements IProfileService {
  private defaultDelayMs = 200;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return null;
    const snapshot = mockDb.getSnapshot();
    const profile = snapshot.userProfiles[userId];
    return profile ? { ...profile } : null;
  }

  async updateContactInfo(userId: string, data: { phone?: string }): Promise<UserProfile> {
    await this.simulateLatency();
    let updated: UserProfile | null = null;
    mockDb.mutate((draft) => {
      const p = draft.userProfiles[userId];
      if (p) {
        if (data.phone !== undefined) p.phone = data.phone;
        updated = { ...p };
      }
    });
    if (!updated) throw new Error("User profile not found");
    return updated;
  }

  async resetDemoData(): Promise<void> {
    await this.simulateLatency();
    mockDb.resetToDefault();
  }
}

export class MockProjectService implements IProjectService {
  private defaultDelayMs = 150;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listActiveProjects(): Promise<ProjectSummary[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    return snapshot.projects.filter((p) => p.status === "ACTIVE");
  }

  async listMine(userId: string): Promise<ProjectSummary[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    // Only return projects where the user is an assigned member
    return snapshot.projects.filter(
      (p) => p.status === "ACTIVE" && (p.memberIds || []).includes(userId)
    );
  }
}

export class MockFavoritesService implements IFavoritesService {
  private defaultDelayMs = 100;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async getFavoriteIds(userId: string): Promise<string[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    return snapshot.favorites[userId] || [];
  }

  async toggleFavorite(userId: string, itemId: string): Promise<boolean> {
    await this.simulateLatency();
    let isFav = false;
    mockDb.mutate((draft) => {
      if (!draft.favorites[userId]) {
        draft.favorites[userId] = [];
      }
      const list = draft.favorites[userId];
      const idx = list.indexOf(itemId);
      if (idx >= 0) {
        list.splice(idx, 1);
        isFav = false;
      } else {
        list.push(itemId);
        isFav = true;
      }
    });
    return isFav;
  }
}

export const mockProfileService = new MockProfileService();
export const mockProjectService = new MockProjectService();
export const mockFavoritesService = new MockFavoritesService();
