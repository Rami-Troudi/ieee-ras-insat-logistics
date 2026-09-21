import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, profileService } from "@/services";
import { QUERY_KEYS } from "@/app/query-client";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications.mine(userId) });
    },
  });
}

export function useMarkAllNotificationsAsRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId),
    onSuccess: () => {
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
