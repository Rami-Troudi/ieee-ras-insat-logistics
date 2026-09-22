import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, profileService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";
import { AppNotification } from "@/types";

export function useUserNotifications(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.notifications.mine(userId),
    queryFn: () => notificationService.listUserNotifications(userId),
    enabled: !!userId,
  });
}

export function useMarkNotificationAsRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notifId: string) => notificationService.markAsRead(notifId, userId),
    onMutate: async (notifId: string) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.mine(userId) });
      const previousNotifications =
        queryClient.getQueryData<AppNotification[]>(QUERY_KEYS.notifications.mine(userId)) || [];
      const nextNotifications = previousNotifications.map((n) =>
        n.id === notifId ? { ...n, read: true } : n
      );
      queryClient.setQueryData(QUERY_KEYS.notifications.mine(userId), nextNotifications);
      return { previousNotifications };
    },
    onError: (_err, _notifId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          QUERY_KEYS.notifications.mine(userId),
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.mine(userId) });
    },
  });
}

export function useMarkAllNotificationsAsRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.notifications.mine(userId) });
      const previousNotifications =
        queryClient.getQueryData<AppNotification[]>(QUERY_KEYS.notifications.mine(userId)) || [];
      const nextNotifications = previousNotifications.map((n) => ({ ...n, read: true }));
      queryClient.setQueryData(QUERY_KEYS.notifications.mine(userId), nextNotifications);
      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          QUERY_KEYS.notifications.mine(userId),
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.mine(userId) });
    },
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profile.detail(userId),
    queryFn: () => profileService.getUserProfile(userId),
    enabled: !!userId,
  });
}

export function useUpdateContactInfo(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone?: string }) => profileService.updateContactInfo(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.detail(userId) });
    },
  });
}

export function useResetDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.resetDemoData(),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
