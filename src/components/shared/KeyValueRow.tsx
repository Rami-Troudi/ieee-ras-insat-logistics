import React from "react";
import { cn } from "@/lib/utils";

export interface KeyValueRowProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  isMono?: boolean;
  className?: string;
}

export const KeyValueRow: React.FC<KeyValueRowProps> = ({
  label,
  value,
  hint,
  isMono = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 border-b border-border/60 text-sm last:border-b-0",
        className
      )}
    >
      <div className="flex flex-col">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground/80">{hint}</span>}
      </div>
      <div
        className={cn("text-xs font-semibold text-foreground text-right", isMono && "font-mono")}
      >
        {value}
      </div>
    </div>
  );
};
