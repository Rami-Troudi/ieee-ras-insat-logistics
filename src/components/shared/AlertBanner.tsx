import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type AlertBannerVariant = "info" | "warning" | "danger" | "success";

export interface AlertBannerProps {
  variant?: AlertBannerVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_CONFIG = {
  info: {
    container:
      "bg-[hsl(var(--info-surface))] border-[hsl(var(--info))]/30 text-[hsl(var(--foreground))]",
    icon: Info,
    iconColor: "text-[hsl(var(--info))]",
  },
  warning: {
    container:
      "bg-[hsl(var(--warning-surface))] border-[hsl(var(--warning))]/30 text-[hsl(var(--foreground))]",
    icon: AlertTriangle,
    iconColor: "text-[hsl(var(--warning))]",
  },
  danger: {
    container:
      "bg-[hsl(var(--danger-surface))] border-[hsl(var(--danger))]/30 text-[hsl(var(--foreground))]",
    icon: AlertCircle,
    iconColor: "text-[hsl(var(--danger))]",
  },
  success: {
    container:
      "bg-[hsl(var(--success-surface))] border-[hsl(var(--success))]/30 text-[hsl(var(--foreground))]",
    icon: CheckCircle2,
    iconColor: "text-[hsl(var(--success))]",
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = "info",
  title,
  description,
  action,
  onDismiss,
  className,
}) => {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border text-sm transition-all",
        config.container,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-foreground leading-snug">{title}</h5>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
