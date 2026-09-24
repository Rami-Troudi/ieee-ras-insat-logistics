import { IProfileService, IProjectService } from "../contracts/profile";
import { UserProfile, ProjectSummary } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";
import { refreshStrikeDerivedProfile } from "./authorization";

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
    if (profile) refreshStrikeDerivedProfile(snapshot, userId);
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

export const mockProfileService = new MockProfileService();
export const mockProjectService = new MockProjectService();
