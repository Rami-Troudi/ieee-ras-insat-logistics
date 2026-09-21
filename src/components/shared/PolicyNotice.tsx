import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, BookOpen } from "lucide-react";

export interface PolicyNoticeProps {
  ruleRef: string;
  summary: string;
  details?: string;
  importance?: "normative" | "advisory";
  className?: string;
}

export const PolicyNotice: React.FC<PolicyNoticeProps> = ({
  ruleRef,
  summary,
  details,
  importance = "normative",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start gap-3 p-3.5 rounded-lg border bg-muted/30 border-border text-sm",
        importance === "normative" && "border-l-4 border-l-secondary",
        className
      )}
    >
      <div className="flex items-center gap-2 sm:mt-0.5 shrink-0">
        {importance === "normative" ? (
          <ShieldAlert className="w-4 h-4 text-secondary shrink-0" />
        ) : (
          <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0.5">
          {ruleRef}
        </Badge>
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <span className="font-semibold text-foreground text-xs block">{summary}</span>
        {details && <p className="text-xs text-muted-foreground leading-relaxed">{details}</p>}
      </div>
    </div>
  );
};
