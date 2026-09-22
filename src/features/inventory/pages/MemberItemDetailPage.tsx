import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/FeedbackStates";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { Button } from "@/components/ui/button";
import { useInventoryItem, useUserFavorites, useToggleFavorite } from "../hooks/useInventory";
import { useSession } from "@/hooks/useSession";
import { useBorrowCart, CartLineItem } from "@/features/cart";
import { evaluateItemEligibility } from "../utils/eligibility";
import { ArrowLeft, ShoppingBag, Check, MapPin, Layers } from "lucide-react";

export const MemberItemDetailPage: React.FC = () => {
  const { itemId = "" } = useParams<{ itemId: string }>();
  const { currentPersona } = useSession();
  const { addItem, state: cartState } = useBorrowCart();

  const { data: item, isLoading, error } = useInventoryItem(itemId);
  const { data: favoriteIds = [] } = useUserFavorites(currentPersona.id);
  const toggleFavorite = useToggleFavorite(currentPersona.id);

  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading equipment specifications..." />
      </PageContainer>
    );
  }

  if (error || !item) {
    return (
      <PageContainer>
        <ErrorState
          title="Equipment Not Found"
          description="The requested equipment identifier does not exist in the logistics inventory."
        />
        <div className="mt-4">
          <Button asChild variant="outline" className="min-h-[44px]">
            <Link to="/app/inventory" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isFav = favoriteIds.includes(item.id);
  const inCart = cartState.items.find((i: CartLineItem) => i.item.id === item.id);
  const eligibility = evaluateItemEligibility(
    item.equipmentClass,
    currentPersona.clearance,
    currentPersona.status,
    currentPersona.isProcessed,
    item.availableQuantity,
    currentPersona.strikesCount
  );

  return (
    <PageContainer>
      {/* Breadcrumb Back Link */}
      <div className="flex items-center justify-between pb-2">
        <Link
          to="/app/inventory"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Equipment Catalog</span>
        </Link>
        <FavoriteButton
          isFavorite={isFav}
          onToggle={() => toggleFavorite.mutate(item.id)}
          itemName={item.name}
        />
      </div>

      {/* Hero Photo & Header Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-4">
        {item.imageUrl && (
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-muted/30 overflow-hidden border-b border-border">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        <div className="p-6 pt-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border">
                  {item.category}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
                {item.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
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
                    ? "0 Available"
                    : eligibility.statusLabel ||
                      `${item.availableQuantity} of ${item.totalQuantity} Available`
                }
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

          {/* Location & Tracking Details */}
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground border-t border-border/60">
            {item.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Storage: {item.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-secondary" />
              <span>
                Tracking Mode:{" "}
                {item.trackingMode === "INDIVIDUAL_ASSET"
                  ? "Individual Serial Numbers"
                  : "Batch Quantity"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Policy Warnings & Eligibility Guidance */}
      {eligibility.noticeTitle && (
        <PolicyNotice
          variant={
            eligibility.badgeType === "RESTRICTED"
              ? "restricted"
              : eligibility.badgeType === "WARNING"
                ? "warning"
                : "info"
          }
          title={eligibility.noticeTitle}
          description={eligibility.noticeMessage || ""}
        />
      )}

      {/* Add To Cart / Request Section */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground">Borrow Availability & Request</h2>

        {eligibility.canBorrowOnline && item.availableQuantity > 0 ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Select Quantity to Reserve:</span>
              <QuantitySelector
                value={quantity}
                min={1}
                max={item.availableQuantity}
                onChange={setQuantity}
              />
            </div>

            <Button
              size="lg"
              onClick={() => addItem(item, quantity)}
              disabled={
                currentPersona.status === "BANNED" ||
                currentPersona.status === "BLACKLISTED" ||
                currentPersona.strikesCount >= 4
              }
              className="w-full sm:w-auto min-h-[48px] gap-2 px-6 font-bold"
            >
              {inCart ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Update in Cart ({inCart.quantity} currently)</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add {quantity} to Borrow Cart</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Item Currently Unavailable</p>
            <p>{eligibility.reason || "This item is currently not available for borrowing."}</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
