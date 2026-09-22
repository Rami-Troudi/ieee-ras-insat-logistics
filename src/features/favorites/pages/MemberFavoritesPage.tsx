import React from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import {
  useInventoryItems,
  useUserFavorites,
  useToggleFavorite,
} from "@/features/inventory/hooks/useInventory";
import { useSession } from "@/hooks/useSession";
import { useBorrowCart, CartLineItem } from "@/features/cart";
import { evaluateItemEligibility } from "@/features/inventory/utils/eligibility";
import { Plus, Eye, ShoppingBag } from "lucide-react";

export const MemberFavoritesPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: allItems, isLoading } = useInventoryItems();
  const { data: favoriteIds = [] } = useUserFavorites(currentPersona.id);
  const toggleFavorite = useToggleFavorite(currentPersona.id);
  const { addItem, state: cartState } = useBorrowCart();

  const favoriteItems = (allItems || []).filter((item) => favoriteIds.includes(item.id));

  return (
    <PageContainer>
      <PageHeader
        title="Favorite Equipment"
        description="Quick access to frequently borrowed microcontrollers, sensors, and actuators."
        action={
          <Button asChild variant="outline" size="default" className="min-h-[44px]">
            <Link to="/app/cart" className="gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>
                Cart ({cartState.items.reduce((s: number, i: CartLineItem) => s + i.quantity, 0)})
              </span>
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState message="Loading your favorited equipment..." />
      ) : favoriteItems.length === 0 ? (
        <EmptyState
          title="No Favorites Saved"
          description="You have not starred any equipment yet. Click the heart icon on any equipment card in the catalog to pin it here."
          actionLabel="Browse Catalog"
          onAction={() => window.location.assign("/app/inventory")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteItems.map((item) => {
            const inCart = cartState.items.some((i: CartLineItem) => i.item.id === item.id);
            const eligibility = evaluateItemEligibility(
              item.equipmentClass,
              currentPersona.clearance,
              currentPersona.status,
              currentPersona.isProcessed,
              item.availableQuantity,
              currentPersona.strikesCount
            );

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                          Class {item.equipmentClass}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{item.category}</span>
                      </div>
                      <Link
                        to={`/app/inventory/${item.id}`}
                        className="text-base font-bold text-foreground hover:text-primary transition-colors block"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <FavoriteButton
                      isFavorite={true}
                      onToggle={() => toggleFavorite.mutate(item.id)}
                      itemName={item.name}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      Available:{" "}
                      <strong className="text-foreground">{item.availableQuantity}</strong> /{" "}
                      {item.totalQuantity}
                    </span>
                    <StatusBadge
                      status={
                        item.availableQuantity === 0
                          ? "BORROWED"
                          : eligibility.badgeType === "SUCCESS"
                            ? "AVAILABLE"
                            : eligibility.badgeType
                      }
                      label={
                        item.availableQuantity === 0
                          ? "Out of Stock"
                          : eligibility.statusLabel ||
                            (item.availableQuantity > 0 ? "Available" : undefined)
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-xs min-h-[44px] px-2.5">
                    <Link to={`/app/inventory/${item.id}`} className="gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>
                  </Button>

                  {eligibility.canBorrowOnline && item.availableQuantity > 0 ? (
                    <Button
                      variant={inCart ? "secondary" : "default"}
                      size="sm"
                      onClick={() => addItem(item, 1)}
                      className="text-xs gap-1.5 min-h-[44px] px-3"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{inCart ? "In Cart" : "Add to Cart"}</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="text-xs opacity-60 min-h-[44px]"
                    >
                      {item.equipmentClass === "B" || item.equipmentClass === "D"
                        ? "Direct Board"
                        : "Unavailable"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
