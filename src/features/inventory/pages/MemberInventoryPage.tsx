import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SearchInput } from "@/components/shared/SearchInput";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import { useInventoryItems } from "../hooks/useInventory";
import { useInventoryCategories } from "../hooks/useInventory";
import { useBorrowCart } from "@/features/cart";
import { EquipmentCard } from "../components/EquipmentCard";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const MemberInventoryPage: React.FC = () => {
  const { totalItemCount } = useBorrowCart();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [availableOnly, setAvailableOnly] = useState(false);

  const filters = {
    search: search.trim() || undefined,
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    availableOnly: availableOnly ? true : undefined,
  };

  const { data: items, isLoading, error, refetch } = useInventoryItems(filters);
  const { data: categories = [] } = useInventoryCategories();
  const displayItems = items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Header: Simple and mobile-first */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Equipment Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Find the equipment you need.
          </p>
        </div>

        {/* View Cart button */}
        <Button
          asChild
          variant="default"
          size="sm"
          className="gap-2 min-h-11 px-3.5 shadow-sm shrink-0"
        >
          <Link to="/app/cart" aria-label={`View Cart with ${totalItemCount} items`}>
            <ShoppingBag className="w-4 h-4" />
            <span className="font-semibold">Cart</span>
            {totalItemCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-white text-primary rounded-full text-xs font-bold">
                {totalItemCount}
              </span>
            )}
          </Link>
        </Button>
      </div>

      {/* Prominent Search Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search equipment (STM32, sensors, motors, batteries)..."
            />
          </div>

          {/* Quick "In stock only" Toggle pill */}
          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            className={cn(
              "min-h-11 px-3.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary",
              availableOnly
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold"
                : "bg-card border-input text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={availableOnly}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                availableOnly ? "bg-emerald-500" : "bg-muted-foreground/40"
              )}
            />
            <span className="hidden xs:inline">In stock</span>
          </button>
        </div>

        {/* Clean, Modern Quick Filter Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {["ALL", ...categories].map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "min-h-11 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border active:scale-95 focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                    : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <span>{category === "ALL" ? "All" : category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <LoadingState message="Loading visual catalogue..." />
      ) : error ? (
        <ErrorState
          title="Couldn't load catalogue"
          description="A network or datastore issue occurred while fetching items."
          onRetry={() => refetch()}
        />
      ) : displayItems.length === 0 ? (
        <EmptyState
          title="No equipment found"
          description="Try another search term or clear your category filters."
          actionLabel="View all equipment"
          onAction={() => {
            setSearch("");
            setSelectedCategory("ALL");
            setAvailableOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pb-20 sm:pb-6">
          {displayItems.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Floating Sticky Mobile Cart Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
          <Link
            to="/app/cart"
            className="flex min-h-11 items-center justify-between px-4 py-3.5 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:bg-primary/95 active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                {totalItemCount}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold block leading-tight">
                  {totalItemCount === 1 ? "1 item selected" : `${totalItemCount} items selected`}
                </span>
                <span className="text-[10px] text-white/80 block">Tap to review & borrow</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-primary px-3 py-1.5 rounded-xl shadow-xs group-hover:translate-x-0.5 transition-transform">
              <span>Review Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};
