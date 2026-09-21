import { format, formatDistanceToNow, isAfter, isBefore, addHours, parseISO } from "date-fns";
import { PickupWindowStatus } from "@/types";

export function formatDate(dateString: string, formatStr = "dd MMM yyyy"): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "dd MMM yyyy, HH:mm");
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function calculatePickupWindow(approvalTimestamp: string): {
  deadline: string;
  isExpired: boolean;
  status: PickupWindowStatus;
  hoursRemaining: number;
} {
  const approvalDate = parseISO(approvalTimestamp);
  const deadlineDate = addHours(approvalDate, 48);
  const now = new Date();

  const isExpired = isAfter(now, deadlineDate);
  const msRemaining = deadlineDate.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));

  let status: PickupWindowStatus = "NORMAL";
  if (isExpired) {
    status = "EXPIRED";
  } else if (hoursRemaining <= 12) {
    status = "URGENT";
  } else if (hoursRemaining <= 24) {
    status = "DUE_SOON";
  }

  return {
    deadline: deadlineDate.toISOString(),
    isExpired,
    status,
    hoursRemaining,
  };
}

export function isDatePast(dateString: string): boolean {
  try {
    return isBefore(parseISO(dateString), new Date());
  } catch {
    return false;
  }
}

export function isDateWithinDays(dateString: string, days: number): boolean {
  try {
    const target = parseISO(dateString);
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return isAfter(target, now) && isBefore(target, threshold);
  } catch {
    return false;
  }
}
