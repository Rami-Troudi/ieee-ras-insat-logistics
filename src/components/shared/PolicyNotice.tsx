import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, BookOpen, AlertTriangle, Info } from "lucide-react";

export interface PolicyNoticeProps {
  ruleRef?: string;
  summary?: string;
  details?: string;
  importance?: "normative" | "advisory";
  variant?: "info" | "warning" | "restricted" | "normative";
  title?: string;
  description?: string;
  className?: string;
}

export const PolicyNotice: React.FC<PolicyNoticeProps> = ({
  ruleRef,
  summary,
  details,
  importance = "normative",
  variant,
  title,
  description,
  className,
}) => {
  const displayTitle = title || summary || "";
  const displayDescription = description || details;
  const displayRef = ruleRef || (variant ? `POLICY-${variant.toUpperCase()}` : "POLICY");

  const isRestricted = variant === "restricted";
  const isWarning = variant === "warning";
  const isInfo = variant === "info";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-3 p-3.5 rounded-lg border bg-muted/30 border-border text-sm",
        (importance === "normative" || isWarning) && "border-l-4 border-l-secondary",
        isRestricted && "border-l-4 border-l-destructive bg-destructive/5 border-destructive/30",
        isInfo && "border-l-4 border-l-primary bg-primary/5",
        className
      )}
    >
      <div className="flex items-center gap-2 sm:mt-0.5 shrink-0">
        {isRestricted ? (
          <ShieldAlert className="w-4 h-4 text-destructive shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4 text-secondary shrink-0" />
        ) : isInfo ? (
          <Info className="w-4 h-4 text-primary shrink-0" />
        ) : importance === "normative" ? (
          <ShieldAlert className="w-4 h-4 text-secondary shrink-0" />
        ) : (
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0.5">
          {displayRef}
        </Badge>
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <span className="font-semibold text-foreground text-xs block">{displayTitle}</span>
        {displayDescription && (
          <p className="text-xs text-muted-foreground leading-relaxed">{displayDescription}</p>
        )}
      </div>
    </div>
  );
};
