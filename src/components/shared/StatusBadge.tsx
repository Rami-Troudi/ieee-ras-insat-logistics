import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

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

interface StatusBadgeProps {
  status: DomainStatus;
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
}) => {
  switch (status) {
    case "PENDING":
    case "WAITING":
      return (
        <Badge variant="outline" className={cn("gap-1 bg-muted/60 text-muted-foreground", className)}>
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span>{label || (status === "PENDING" ? "Pending Review" : "Waiting Handover")}</span>
        </Badge>
      );

    case "APPROVED":
    case "RETURNED":
    case "AVAILABLE":
    case "SUCCESS":
      return (
        <Badge variant="success" className={cn("gap-1", className)}>
          <CheckCircle2 className="w-3 h-3 text-[hsl(var(--success))]" />
          <span>{label || (status === "APPROVED" ? "Approved" : status === "RETURNED" ? "Returned" : status === "AVAILABLE" ? "Available" : "Success")}</span>
        </Badge>
      );

    case "PARTIALLY_APPROVED":
    case "PARTIALLY_RETURNED":
    case "DUE_SOON":
    case "MAINTENANCE":
    case "WARNING":
      return (
        <Badge variant="warning" className={cn("gap-1", className)}>
          <AlertTriangle className="w-3 h-3 text-[hsl(var(--warning))]" />
          <span>{label || (status === "PARTIALLY_APPROVED" ? "Partially Approved" : status === "DUE_SOON" ? "Due Soon" : status === "MAINTENANCE" ? "Maintenance" : "Warning")}</span>
        </Badge>
      );

    case "REJECTED":
    case "DAMAGED":
    case "OVERDUE":
    case "RESTRICTED":
    case "BANNED":
    case "ERROR":
      return (
        <Badge variant="danger" className={cn("gap-1 font-semibold", className)}>
          <AlertCircle className="w-3 h-3 text-[hsl(var(--danger))]" />
          <span>{label || (status === "OVERDUE" ? "Overdue" : status === "DAMAGED" ? "Damaged" : status === "REJECTED" ? "Rejected" : "Restricted")}</span>
        </Badge>
      );

    case "ACTIVE":
    case "HANDED_OVER":
    case "BORROWED":
    case "INFO":
      return (
        <Badge variant="info" className={cn("gap-1", className)}>
          <Info className="w-3 h-3 text-[hsl(var(--info))]" />
          <span>{label || (status === "ACTIVE" ? "Active Loan" : status === "BORROWED" ? "Borrowed" : "Info")}</span>
        </Badge>
      );

    case "EXPIRED":
    case "CLOSED":
    case "RETIRED":
    case "LOST":
    default:
      return (
        <Badge variant="outline" className={cn("gap-1 bg-muted/40 text-muted-foreground", className)}>
          <XCircle className="w-3 h-3 text-muted-foreground" />
          <span>{label || (status === "EXPIRED" ? "Approval Expired" : status === "CLOSED" ? "Closed" : "Retired")}</span>
        </Badge>
      );
  }
};
