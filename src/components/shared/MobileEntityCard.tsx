import React from "react";
import { cn } from "@/lib/utils";

export interface EntityMetadataItem {
  label: string;
  value: React.ReactNode;
}

export interface MobileEntityCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  status?: React.ReactNode;
  metadata?: EntityMetadataItem[];
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const MobileEntityCard: React.FC<MobileEntityCardProps> = ({
  title,
  subtitle,
  status,
  metadata = [],
  action,
  onClick,
  className,
  children,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 transition-colors text-left",
        onClick &&
          "cursor-pointer hover:border-primary/40 active:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
    >
      {/* Header: Title, Subtitle, Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="font-semibold text-sm text-foreground leading-snug truncate">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* Metadata Key-Value Grid */}
      {metadata.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
          {metadata.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                {item.label}
              </span>
              <div className="font-medium text-foreground">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {children}

      {/* Action Footer */}
      {action && (
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/40">
          {action}
        </div>
      )}
    </div>
  );
};
