import { AppNotification } from "@/types";

export interface INotificationService {
  listUserNotifications(userId: string): Promise<AppNotification[]>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}
