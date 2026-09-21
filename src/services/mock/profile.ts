import { IProfileService, IProjectService, IFavoritesService } from "../contracts/profile";
import { UserProfile, ProjectSummary } from "@/types";
import { mockDb } from "@/mocks/db";

export class MockProfileService implements IProfileService {
  private defaultDelayMs = 150;

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
    const snapshot = mockDb.getSnapshot();
    return snapshot.userProfiles[userId] || null;
  }

  async updateContactInfo(userId: string, data: { phone?: string }): Promise<UserProfile> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
    let updated: UserProfile | null = null;
    mockDb.mutate((draft) => {
      const p = draft.userProfiles[userId];
      if (p) {
        if (data.phone !== undefined) p.phone = data.phone;
        updated = { ...p };
      }
    });
    if (!updated) throw new Error("Profile not found");
    return updated;
  }
}

export class MockProjectService implements IProjectService {
  private defaultDelayMs = 150;

  async listActiveProjects(): Promise<ProjectSummary[]> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
    const snapshot = mockDb.getSnapshot();
    return snapshot.projects.filter((p) => p.status === "ACTIVE");
  }
}

export class MockFavoritesService implements IFavoritesService {
  private defaultDelayMs = 100;

  async getFavoriteIds(userId: string): Promise<string[]> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
    const snapshot = mockDb.getSnapshot();
    return snapshot.favorites[userId] || [];
  }

  async toggleFavorite(userId: string, itemId: string): Promise<boolean> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
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
