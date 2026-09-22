import React, { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import {
  useUserNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/features/profile/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { Bell, CheckCircle2, Check, CheckCheck } from "lucide-react";

export const BoardNotificationsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: notifications = [], isLoading } = useUserNotifications(currentPersona.id);
  const markReadMutation = useMarkNotificationAsRead(currentPersona.id);
  const markAllReadMutation = useMarkAllNotificationsAsRead(currentPersona.id);

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD" && n.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading operational notifications..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Operational Notifications"
        description="Real-time logistics notifications: return intake notices, overdue escalations, and automated strike alerts."
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={filter === "ALL" ? "default" : "outline"}
              onClick={() => setFilter("ALL")}
              className="text-xs h-8"
            >
              All ({notifications.length})
            </Button>
            <Button
              size="sm"
              variant={filter === "UNREAD" ? "default" : "outline"}
              onClick={() => setFilter("UNREAD")}
              className="text-xs h-8"
            >
              Unread ({unreadCount})
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs h-8 gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No notifications</h3>
            <p className="text-xs text-muted-foreground mt-1">
              You are completely caught up with all operational alerts.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                notif.read
                  ? "border-border bg-card opacity-80"
                  : "border-primary/40 bg-primary/5 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{notif.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground block mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markReadMutation.mutate(notif.id)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Mark Read</span>
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
};
