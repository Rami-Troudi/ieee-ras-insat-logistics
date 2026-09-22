import { INotificationService } from "../contracts/notifications";
import { AppNotification } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";

export class MockNotificationService implements INotificationService {
  private defaultDelayMs = 150;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listUserNotifications(userId: string): Promise<AppNotification[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];
    const snapshot = mockDb.getSnapshot();
    return snapshot.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.simulateLatency();
    mockDb.mutate((draft) => {
      const n = draft.notifications.find((notif) => notif.id === notificationId);
      if (n) {
        n.read = true;
      }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.simulateLatency();
    mockDb.mutate((draft) => {
      draft.notifications.forEach((notif) => {
        if (notif.userId === userId) {
          notif.read = true;
        }
      });
    });
  }
}

export const mockNotificationService = new MockNotificationService();
