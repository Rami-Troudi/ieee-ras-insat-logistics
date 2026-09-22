import React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Info,
  RotateCcw,
} from "lucide-react";

export type DomainStatus =
  | "PENDING"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "WAITING"
  | "HANDED_OVER"
  | "ACTIVE"
  | "CLOSED"
  | "RETURNED"
  | "PARTIALLY_RETURNED"
  | "RETURN_REQUESTED"
  | "AVAILABLE"
  | "BORROWED"
  | "DAMAGED"
  | "MAINTENANCE"
  | "LOST"
  | "RETIRED"
  | "DUE_SOON"
  | "OVERDUE"
  | "RESTRICTED"
  | "BANNED"
  | "BLACKLISTED"
  | "SUSPENDED"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "INFO"
  | "IN_PROGRESS"
  | "RECONCILED"
  | "MATCHED"
  | "DISCREPANCY"
  | "PENDING_COUNT"
  | "CONFIRMED"
  | "PENDING_REVIEW"
  | "APPLIED"
  | "DISMISSED"
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED"
  | "ON_TIME"
  | "OVERTURNED"
  | "PAID"
  | "WAIVED"
  | "APPEALED"
  | "ARCHIVED"
  | "COMPLETED"
  | "PLANNING"
  | "FULFILLED";

export interface StatusConfigItem {
  label: string;
  variant: NonNullable<BadgeProps["variant"]>;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  badgeClass?: string;
}

export const STATUS_CONFIG: Record<DomainStatus, StatusConfigItem> = {
  PENDING: {
    label: "Pending Review",
    variant: "outline",
    icon: Clock,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/60 text-muted-foreground",
  },
  APPROVED: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle2,
    iconClass: "text-[hsl(var(--success))]",
  },
  PARTIALLY_APPROVED: {
    label: "Partially Approved",
    variant: "warning",
    icon: AlertTriangle,
    iconClass: "text-[hsl(var(--warning))]",
  },
  REJECTED: {
    label: "Rejected",
    variant: "danger",
    icon: XCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "outline",
    icon: XCircle,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/40 text-muted-foreground",
  },
  EXPIRED: {
    label: "Approval Expired",
    variant: "outline",
    icon: Clock,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/40 text-muted-foreground",
  },
  WAITING: {
    label: "Waiting Handover",
    variant: "outline",
    icon: Clock,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/60 text-muted-foreground",
  },
  HANDED_OVER: {
    label: "Handed Over",
    variant: "info",
    icon: CheckCircle2,
    iconClass: "text-[hsl(var(--info))]",
  },
  ACTIVE: {
    label: "Active Loan",
    variant: "info",
    icon: Info,
    iconClass: "text-[hsl(var(--info))]",
  },
  CLOSED: {
    label: "Closed",
    variant: "outline",
    icon: XCircle,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/40 text-muted-foreground",
  },
  RETURNED: {
    label: "Returned",
    variant: "success",
    icon: CheckCircle2,
    iconClass: "text-[hsl(var(--success))]",
  },
  PARTIALLY_RETURNED: {
    label: "Partially Returned",
    variant: "warning",
    icon: AlertTriangle,
    iconClass: "text-[hsl(var(--warning))]",
  },
  RETURN_REQUESTED: {
    label: "Return Pending",
    variant: "warning",
    icon: RotateCcw,
    iconClass: "text-[hsl(var(--warning))]",
  },
  AVAILABLE: {
    label: "Available",
    variant: "success",
    icon: CheckCircle2,
    iconClass: "text-[hsl(var(--success))]",
  },
  BORROWED: {
    label: "Borrowed",
    variant: "info",
    icon: Info,
    iconClass: "text-[hsl(var(--info))]",
  },
  DAMAGED: {
    label: "Damaged",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  MAINTENANCE: {
    label: "Maintenance",
    variant: "warning",
    icon: AlertTriangle,
    iconClass: "text-[hsl(var(--warning))]",
  },
  LOST: {
    label: "Lost",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  RETIRED: {
    label: "Retired",
    variant: "outline",
    icon: XCircle,
    iconClass: "text-muted-foreground",
    badgeClass: "bg-muted/40 text-muted-foreground",
  },
  DUE_SOON: {
    label: "Due Soon",
    variant: "warning",
    icon: Clock,
    iconClass: "text-[hsl(var(--warning))]",
  },
  OVERDUE: {
    label: "Overdue",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  RESTRICTED: {
    label: "Restricted",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  BANNED: {
    label: "Banned",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  SUCCESS: {
    label: "Success",
    variant: "success",
    icon: CheckCircle2,
    iconClass: "text-[hsl(var(--success))]",
  },
  WARNING: {
    label: "Warning",
    variant: "warning",
    icon: AlertTriangle,
    iconClass: "text-[hsl(var(--warning))]",
  },
  ERROR: {
    label: "Error",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  INFO: {
    label: "Info",
    variant: "info",
    icon: Info,
    iconClass: "text-[hsl(var(--info))]",
  },
  BLACKLISTED: {
    label: "Blacklisted",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  SUSPENDED: {
    label: "Suspended",
    variant: "danger",
    icon: AlertCircle,
    iconClass: "text-[hsl(var(--danger))]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    variant: "secondary",
    icon: Clock,
  },
  RECONCILED: {
    label: "Reconciled",
    variant: "success",
    icon: CheckCircle2,
  },
  MATCHED: {
    label: "Matched",
    variant: "success",
    icon: CheckCircle2,
  },
  DISCREPANCY: {
    label: "Discrepancy",
    variant: "danger",
    icon: AlertTriangle,
  },
  PENDING_COUNT: {
    label: "Pending Count",
    variant: "outline",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "success",
    icon: CheckCircle2,
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    variant: "warning",
    icon: AlertTriangle,
  },
  APPLIED: {
    label: "Applied",
    variant: "danger",
    icon: AlertCircle,
  },
  DISMISSED: {
    label: "Dismissed",
    variant: "outline",
    icon: CheckCircle2,
  },
  OPEN: {
    label: "Open",
    variant: "warning",
    icon: AlertTriangle,
  },
  INVESTIGATING: {
    label: "Investigating",
    variant: "secondary",
    icon: Clock,
  },
  RESOLVED: {
    label: "Resolved",
    variant: "success",
    icon: CheckCircle2,
  },
  ON_TIME: {
    label: "On Time",
    variant: "success",
    icon: CheckCircle2,
  },
  OVERTURNED: {
    label: "Overturned",
    variant: "outline",
    icon: RotateCcw,
  },
  PAID: {
    label: "Paid",
    variant: "success",
    icon: CheckCircle2,
  },
  WAIVED: {
    label: "Waived",
    variant: "outline",
    icon: CheckCircle2,
  },
  APPEALED: {
    label: "Appealed",
    variant: "warning",
    icon: AlertTriangle,
  },
  ARCHIVED: {
    label: "Archived",
    variant: "outline",
    icon: Info,
  },
  COMPLETED: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle2,
  },
  PLANNING: {
    label: "Planning",
    variant: "secondary",
    icon: Clock,
  },
  FULFILLED: {
    label: "Fulfilled",
    variant: "success",
    icon: CheckCircle2,
  },
};

export interface StatusBadgeProps {
  status: DomainStatus;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    variant: "outline" as const,
    icon: Info,
  };

  const Icon = config.icon;
  const displayText = label || config.label;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1 font-medium", config.badgeClass, className)}
    >
      <Icon className={cn("w-3 h-3 shrink-0", config.iconClass)} />
      <span>{displayText}</span>
    </Badge>
  );
};
