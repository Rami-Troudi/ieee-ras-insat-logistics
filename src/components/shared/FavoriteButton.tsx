import React from "react";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  itemName?: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  itemName = "item",
  className,
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${itemName} from favorites` : `Add ${itemName} to favorites`}
      className={cn(
        "flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-w-[44px] min-h-[44px] p-2 hover:bg-muted/60",
        isFavorite ? "text-secondary" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-transform active:scale-125",
          isFavorite ? "fill-secondary stroke-secondary" : "fill-none"
        )}
      />
    </button>
  );
};
