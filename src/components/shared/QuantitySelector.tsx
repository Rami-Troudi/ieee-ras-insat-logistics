import React from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="inline-flex items-center border border-input rounded-md bg-background shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 min-w-[44px] min-h-[44px] sm:h-9 sm:w-9 sm:min-w-[36px] sm:min-h-[36px] rounded-r-none border-r border-input"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </Button>
      <span className="w-12 text-center text-sm font-semibold text-foreground select-none h-11 sm:h-9 flex items-center justify-center">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 min-w-[44px] min-h-[44px] sm:h-9 sm:w-9 sm:min-w-[36px] sm:min-h-[36px] rounded-l-none border-l border-input"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
