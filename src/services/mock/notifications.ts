import { INotificationService } from "../contracts/notifications";
import { AppNotification } from "@/types";
import { mockDb } from "@/mocks/db";
import { scenarioManager } from "./scenario";
import { isDatePast } from "@/lib/dates";

export class MockNotificationService implements INotificationService {
  private defaultDelayMs = 150;

  private async simulateLatency(): Promise<void> {
    await scenarioManager.simulateLatency(this.defaultDelayMs);
  }

  async listUserNotifications(userId: string): Promise<AppNotification[]> {
    await this.simulateLatency();
    if (scenarioManager.isEmpty()) return [];

    mockDb.mutate((draft) => {
      const user = draft.userProfiles?.[userId];
      const isBoard = user?.role === "BOARD" || user?.role === "SUPERADMIN";

      draft.loans.forEach((loan) => {
        if (
          loan.lifecycleStatus === "ACTIVE" &&
          (loan.dueStatus === "OVERDUE" || isDatePast(loan.dueDate))
        ) {
          // If board member, ensure overdue alert exists for them
          if (isBoard) {
            const exists = draft.notifications.some(
              (n) =>
                n.userId === userId && n.metadata?.loanId === loan.id && n.type === "LOAN_OVERDUE"
            );
            if (!exists) {
              draft.notifications.unshift({
                id: `notif-ovd-${loan.id}-${userId}`,
                userId: userId,
                title: `Equipment Overdue: ${loan.userName}`,
                message: `Loan ${loan.id} (${loan.items.map((i) => `${i.borrowedQuantity - i.returnedQuantity}x ${i.itemName}`).join(", ")}) was due on ${new Date(loan.dueDate).toLocaleDateString()} and has not been returned.`,
                type: "LOAN_OVERDUE",
                read: false,
                link: `/board/loans/${loan.id}`,
                createdAt: loan.dueDate,
                metadata: { loanId: loan.id },
              });
            }
          } else if (loan.userId === userId) {
            // For the borrower themselves
            const exists = draft.notifications.some(
              (n) =>
                n.userId === userId && n.metadata?.loanId === loan.id && n.type === "LOAN_OVERDUE"
            );
            if (!exists) {
              draft.notifications.unshift({
                id: `notif-ovd-${loan.id}-${userId}`,
                userId: userId,
                title: `Equipment Overdue Reminder`,
                message: `Your borrowed equipment for loan ${loan.id} was expected back on ${new Date(loan.dueDate).toLocaleDateString()}. Please return items to the RAS desk.`,
                type: "LOAN_OVERDUE",
                read: false,
                link: `/app/loans/${loan.id}`,
                createdAt: loan.dueDate,
                metadata: { loanId: loan.id },
              });
            }
          }
        }
      });
    });

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
