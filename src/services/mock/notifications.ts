import { INotificationService } from "../contracts/notifications";
import { AppNotification } from "@/types";
import { mockDb } from "@/mocks/db";

export class MockNotificationService implements INotificationService {
  private defaultDelayMs = 150;

  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, this.defaultDelayMs));
  }

  async listUserNotifications(userId: string): Promise<AppNotification[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    return snapshot.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.simulateLatency();
    mockDb.mutate((draft) => {
      const notif = draft.notifications.find((n) => n.id === notificationId && n.userId === userId);
      if (notif) {
        notif.read = true;
      }
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.simulateLatency();
    mockDb.mutate((draft) => {
      draft.notifications.forEach((n) => {
        if (n.userId === userId) {
          n.read = true;
        }
      });
    });
  }
}

export const mockNotificationService = new MockNotificationService();
