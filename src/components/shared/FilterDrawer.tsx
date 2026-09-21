import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount?: number;
  onApply?: () => void;
  onReset?: () => void;
  children: React.ReactNode;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  open,
  onOpenChange,
  activeCount = 0,
  onApply,
  onReset,
  children,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="default"
          className="gap-2 sm:hidden relative min-h-[44px]"
          aria-label="Open filter options"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-3 border-b border-border">
          <SheetTitle className="flex items-center justify-between">
            <span>Filter Catalog</span>
            {activeCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                {activeCount} active
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">{children}</div>
        <SheetFooter className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row gap-2">
          {onReset && (
            <Button variant="outline" onClick={onReset} className="w-full sm:w-auto min-h-[44px]">
              Reset Filters
            </Button>
          )}
          <Button
            variant="default"
            onClick={() => {
              onApply?.();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
