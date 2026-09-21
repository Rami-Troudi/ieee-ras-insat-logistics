import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface FilterChipProps {
  label: string;
  value: string;
  count?: number;
  onRemove?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  value,
  count,
  onRemove,
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 select-none min-h-[36px] sm:min-h-[32px]",
        className
      )}
    >
      <span className="text-muted-foreground font-normal">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
      {typeof count === "number" && (
        <span className="ml-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-mono">
          {count}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 p-1 rounded-full hover:bg-primary/20 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px] sm:min-w-[24px] sm:min-h-[24px] flex items-center justify-center"
          aria-label={`Remove filter for ${label}: ${value}`}
        >
          <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
        </button>
      )}
    </span>
  );
};
