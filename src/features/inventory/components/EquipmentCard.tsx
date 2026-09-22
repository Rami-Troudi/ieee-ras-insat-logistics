import React, { useState } from "react";
import { Link } from "react-router-dom";
import { InventoryItemSummary } from "@/types";
import {
  getHumanAvailability,
  canRequestOnline,
  getHumanCategory,
} from "@/features/inventory/utils/humanAvailability";
import { useBorrowCart } from "@/features/cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EquipmentCardProps {
  item: InventoryItemSummary;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ item }) => {
  const { state: cartState, addItem, updateQuantity, removeItem } = useBorrowCart();
  const [imageError, setImageError] = useState(false);

  const cartEntry = cartState.items.find((i) => i.item.id === item.id);
  const inCart = Boolean(cartEntry);
  const currentQuantity = cartEntry ? cartEntry.quantity : 0;

  const availability = getHumanAvailability(item);
  const requestable = canRequestOnline(item);
  const humanCategory = getHumanCategory(item.category, item.equipmentClass);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentQuantity < item.availableQuantity) {
      updateQuantity(item.id, currentQuantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentQuantity <= 1) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, currentQuantity - 1);
    }
  };

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
      {/* Clickable Card Header & Photo */}
      <Link to={`/app/inventory/${item.id}`} className="block relative focus:outline-none">
        {/* Photo Container with fixed 4:3 aspect ratio */}
        <div className="relative aspect-[4/3] w-full bg-muted/40 overflow-hidden">
          {item.imageUrl && !imageError ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/70 text-muted-foreground text-xs font-medium">
              <span>{item.name.slice(0, 15)}</span>
            </div>
          )}

          {/* Availability Dot Badge overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-xs text-[11px] font-medium">
            <span
              className={cn("w-2 h-2 rounded-full", {
                "bg-emerald-500": availability.color === "emerald",
                "bg-amber-500": availability.color === "amber",
                "bg-rose-500": availability.color === "rose",
              })}
            />
            <span className="text-foreground text-[10px]">{availability.label}</span>
          </div>

          {/* Subtle in-cart badge */}
          {inCart && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>{currentQuantity}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-3">
          <span className="text-[11px] font-medium text-muted-foreground block line-clamp-1 mb-0.5">
            {humanCategory}
          </span>
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {item.name}
          </h3>
        </div>
      </Link>

      {/* Card Action Footer */}
      <div className="p-3 pt-0">
        {requestable ? (
          inCart ? (
            <div className="flex items-center justify-between border border-primary/40 bg-primary/5 rounded-lg p-1">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-primary min-w-[32px] min-h-[32px]"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-foreground px-2">{currentQuantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={currentQuantity >= item.availableQuantity}
                className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 disabled:opacity-40 transition-all focus:outline-none focus:ring-1 focus:ring-primary min-w-[32px] min-h-[32px]"
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleAdd}
              className="w-full text-xs font-semibold gap-1.5 h-9 min-h-[36px] rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          )
        ) : (
          <Link
            to={`/app/inventory/${item.id}`}
            className="w-full h-9 min-h-[36px] flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/50 hover:bg-muted border border-border/70 rounded-lg transition-colors"
          >
            <span>{availability.label}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </Link>
        )}
      </div>
    </div>
  );
};
