import React from "react";
import { Button } from "@/components/ui/button";
import { FilterChip, FilterChipProps } from "./FilterChip";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActiveFilter extends Omit<FilterChipProps, "onRemove"> {
  id: string;
}

export interface FilterBarProps {
  filters?: ActiveFilter[];
  onRemoveFilter?: (id: string) => void;
  onClearAll?: () => void;
  desktopControls?: React.ReactNode;
  mobileDrawer?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters = [],
  onRemoveFilter,
  onClearAll,
  desktopControls,
  mobileDrawer,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Top Filter Controls Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Desktop inline controls */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap flex-1">{desktopControls}</div>

        {/* Mobile drawer trigger */}
        <div className="sm:hidden w-full">{mobileDrawer}</div>
      </div>

      {/* Active Filter Chips Strip */}
      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-border/50">
          <span className="text-xs text-muted-foreground font-medium mr-1">Active filters:</span>
          {filters.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              value={f.value}
              count={f.count}
              onRemove={() => onRemoveFilter?.(f.id)}
            />
          ))}
          {onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-muted-foreground hover:text-foreground px-2 gap-1 min-h-[44px] sm:min-h-[28px] sm:h-7"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
