import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import {
  useUserNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/features/profile/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { formatRelativeTime } from "@/lib/dates";
import { Bell, CheckCheck, ExternalLink, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { NotificationType } from "@/types";

export const MemberNotificationsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: notifications = [], isLoading, refetch } = useUserNotifications(currentPersona.id);
  const markAsRead = useMarkNotificationAsRead(currentPersona.id);
  const markAllAsRead = useMarkAllNotificationsAsRead(currentPersona.id);

  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  const renderIcon = (type: NotificationType) => {
    switch (type) {
      case "REQUEST_APPROVED":
      case "REQUEST_PARTIALLY_APPROVED":
      case "EXTENSION_APPROVED":
      case "RETURN_CONFIRMED":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case "PICKUP_REMINDER":
      case "LOAN_DUE_SOON":
        return <Clock className="w-5 h-5 text-secondary shrink-0" />;
      case "PICKUP_EXPIRED":
      case "LOAN_OVERDUE":
      case "STRIKE_ISSUED":
      case "REQUEST_REJECTED":
        return <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-primary shrink-0" />;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="In-App Notifications"
        description="Official alerts regarding borrow approvals, 48h collection reminders, return confirmations, and due dates."
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              className="gap-2 text-xs min-h-[44px]"
            >
              <CheckCheck className="w-4 h-4 text-primary" />
              <span>Mark all as read ({unreadCount})</span>
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pb-2">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
          className="text-xs h-8 min-h-[36px]"
        >
          All Notifications ({notifications.length})
        </Button>
        <Button
          variant={filter === "UNREAD" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("UNREAD")}
          className="text-xs h-8 min-h-[36px]"
        >
          Unread Only ({unreadCount})
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title={filter === "UNREAD" ? "No Unread Notifications" : "No Notifications"}
          description={
            filter === "UNREAD"
              ? "You have read all notifications. Switch to 'All Notifications' to view history."
              : "You are completely caught up! Operational announcements and loan events will show up here."
          }
          actionLabel="Refresh"
          onAction={() => refetch()}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.read
                  ? "border-border bg-card/60 opacity-85"
                  : "border-primary/40 bg-primary/5 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">{renderIcon(notif.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-bold ${notif.read ? "text-foreground" : "text-primary"}`}
                    >
                      {notif.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                {notif.link && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!notif.read) markAsRead.mutate(notif.id);
                    }}
                    className="text-xs gap-1.5 min-h-[44px]"
                  >
                    <Link to={notif.link}>
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                )}

                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead.mutate(notif.id)}
                    className="text-xs min-h-[44px]"
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
