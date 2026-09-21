import React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export type DomainStatus =
  | "PENDING"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "WAITING"
  | "HANDED_OVER"
  | "ACTIVE"
  | "CLOSED"
  | "RETURNED"
  | "PARTIALLY_RETURNED"
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
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "INFO";

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
