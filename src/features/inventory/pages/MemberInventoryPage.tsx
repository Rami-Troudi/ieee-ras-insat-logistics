import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterBar } from "@/components/shared/FilterBar";
import { FilterDrawer } from "@/components/shared/FilterDrawer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import {
  useInventoryItems,
  useUserFavorites,
  useToggleFavorite,
  useInventoryCategories,
} from "../hooks/useInventory";
import { useSession } from "@/hooks/useSession";
import { useBorrowCart, CartLineItem } from "@/features/cart";
import { evaluateItemEligibility } from "../utils/eligibility";
import { Plus, Check, ShoppingBag, Eye, ShieldAlert, Heart, Filter } from "lucide-react";
import { TrackingMode } from "@/types";

export const MemberInventoryPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { addItem, state: cartState } = useBorrowCart();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedTracking, setSelectedTracking] = useState<string>("ALL");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [borrowableOnly, setBorrowableOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const filters = {
    search: search.trim() || undefined,
    category: selectedCategory !== "ALL" ? selectedCategory : undefined,
    equipmentClass: selectedClass !== "ALL" ? selectedClass : undefined,
    trackingMode: selectedTracking !== "ALL" ? (selectedTracking as TrackingMode) : undefined,
    availableOnly: availableOnly ? true : undefined,
    borrowableByMe: borrowableOnly ? true : undefined,
    favoritesOnly: favoritesOnly ? true : undefined,
  };

  const { data: items, isLoading, error, refetch } = useInventoryItems(filters, currentPersona.id);
  const { data: categories = [] } = useInventoryCategories();
  const { data: favoriteIds = [] } = useUserFavorites(currentPersona.id);
  const toggleFavorite = useToggleFavorite(currentPersona.id);

  const classOptions = [
    { value: "ALL", label: "All Classes" },
    { value: "A", label: "Class A (Consumables)" },
    { value: "B", label: "Class B (Expendable Resources)" },
    { value: "C", label: "Class C (Light Resources)" },
    { value: "D", label: "Class D (Light Equipment)" },
    { value: "E", label: "Class E (Electronic Resources)" },
    { value: "F", label: "Class F (Heavy Equipment)" },
    { value: "G", label: "Class G (High Value Electronics)" },
  ];

  const categoryOptions = [
    { value: "ALL", label: "All Categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const trackingOptions = [
    { value: "ALL", label: "All Tracking" },
    { value: "INDIVIDUAL_ASSET", label: "Individual Assets" },
    { value: "QUANTITY", label: "Batch Quantity" },
  ];

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("ALL");
    setSelectedClass("ALL");
    setSelectedTracking("ALL");
    setAvailableOnly(false);
    setBorrowableOnly(false);
    setFavoritesOnly(false);
  };

  const activeFilters = [
    ...(search.trim() ? [{ id: "search", label: "Query", value: search }] : []),
    ...(selectedCategory !== "ALL"
      ? [{ id: "cat", label: "Category", value: selectedCategory }]
      : []),
    ...(selectedClass !== "ALL" ? [{ id: "class", label: "Class", value: selectedClass }] : []),
    ...(selectedTracking !== "ALL"
      ? [
          {
            id: "track",
            label: "Tracking",
            value: selectedTracking === "INDIVIDUAL_ASSET" ? "Serial Asset" : "Batch",
          },
        ]
      : []),
    ...(availableOnly ? [{ id: "avail", label: "Availability", value: "In Stock" }] : []),
    ...(borrowableOnly ? [{ id: "borrow", label: "Eligibility", value: "Borrowable by Me" }] : []),
    ...(favoritesOnly ? [{ id: "favs", label: "Favorites", value: "Starred Only" }] : []),
  ];

  const handleRemoveFilter = (id: string) => {
    if (id === "search") setSearch("");
    if (id === "cat") setSelectedCategory("ALL");
    if (id === "class") setSelectedClass("ALL");
    if (id === "track") setSelectedTracking("ALL");
    if (id === "avail") setAvailableOnly(false);
    if (id === "borrow") setBorrowableOnly(false);
    if (id === "favs") setFavoritesOnly(false);
  };

  const desktopControls = (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] sm:min-h-[36px]"
      >
        {categoryOptions.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] sm:min-h-[36px]"
      >
        {classOptions.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      <select
        value={selectedTracking}
        onChange={(e) => setSelectedTracking(e.target.value)}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] sm:min-h-[36px]"
      >
        {trackingOptions.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer ml-1">
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={(e) => setAvailableOnly(e.target.checked)}
          className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5"
        />
        <span>In Stock</span>
      </label>

      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer ml-1">
        <input
          type="checkbox"
          checked={borrowableOnly}
          onChange={(e) => setBorrowableOnly(e.target.checked)}
          className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5"
        />
        <span>Borrowable by Me</span>
      </label>

      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer ml-1">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => setFavoritesOnly(e.target.checked)}
          className="rounded border-input text-primary focus:ring-primary w-3.5 h-3.5"
        />
        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
        <span>Favorites</span>
      </label>
    </div>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Equipment Inventory"
        description="Browse available robotics gear, view clearance eligibility, and prepare borrow requests."
        action={
          <Button asChild variant="outline" size="default" className="min-h-[44px]">
            <Link to="/app/cart" className="gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>
                View Cart (
                {cartState.items.reduce((s: number, i: CartLineItem) => s + i.quantity, 0)})
              </span>
            </Link>
          </Button>
        }
      />

      {/* Account Eligibility Banner if Restricted or Unprocessed */}
      {!currentPersona.isProcessed && (
        <PolicyNotice
          variant="info"
          title="Affiliation Pending Physical Verification"
          description="Your profile is currently unverified. You may browse and submit online borrow requests; the Logistics Board will verify and confirm your affiliation during review."
        />
      )}

      {currentPersona.strikesCount >= 2 && (
        <PolicyNotice
          variant="warning"
          title="Explicit Board Review Required (Strike 2 Active)"
          description={`Your account has ${currentPersona.strikesCount} active strike(s). You may request eligible equipment, but all requests require explicit Board review. Classes F and G are unavailable.`}
        />
      )}

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              placeholder="Search by name, aliases (stm, rpi, uno), tags, or category..."
            />
          </div>

          <div className="sm:hidden">
            <Button
              variant="outline"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="w-full gap-2 min-h-[44px]"
            >
              <Filter className="w-4 h-4" />
              <span>Filters ({activeFilters.length})</span>
            </Button>
            <FilterDrawer
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
              activeCount={activeFilters.length}
              onApply={() => setIsFilterDrawerOpen(false)}
              onReset={handleClearFilters}
            >
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-2 text-sm min-h-[44px]"
                  >
                    {categoryOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                    Equipment Class
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {classOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        variant={selectedClass === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedClass(opt.value)}
                        className="justify-start text-xs h-9 min-h-[44px]"
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>Show In-Stock Items Only</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={borrowableOnly}
                      onChange={(e) => setBorrowableOnly(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>Borrowable by Me Only</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer min-h-[44px]">
                    <input
                      type="checkbox"
                      checked={favoritesOnly}
                      onChange={(e) => setFavoritesOnly(e.target.checked)}
                      className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>Favorites Only</span>
                  </label>
                </div>
              </div>
            </FilterDrawer>
          </div>
        </div>

        {/* FilterBar with chips and desktop dropdowns */}
        <FilterBar
          filters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearFilters}
          desktopControls={desktopControls}
        />
      </div>

      {/* Content Area */}
      {isLoading ? (
        <LoadingState message="Loading equipment catalog..." />
      ) : error ? (
        <ErrorState
          title="Failed to Load Inventory"
          description="A network or mock datastore error occurred while retrieving equipment."
          onRetry={() => refetch()}
        />
      ) : items && items.length === 0 ? (
        <EmptyState
          title="No Equipment Found"
          description="Try clearing filters or adjusting your search keyword."
          actionLabel="Clear Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items?.map((item) => {
            const isFav = favoriteIds.includes(item.id);
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
                        className="text-base font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                    </div>
                    <FavoriteButton
                      isFavorite={isFav}
                      onToggle={() => toggleFavorite.mutate(item.id)}
                      itemName={item.name}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>

                  {/* Stock & Eligibility Pill */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs">
                      <span className="font-semibold text-foreground">
                        {item.availableQuantity}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        / {item.totalQuantity} available
                      </span>
                    </div>

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

                  {/* Policy Warnings for Special Classes */}
                  {(item.equipmentClass === "B" || item.equipmentClass === "D") && (
                    <div className="p-2 rounded bg-muted/70 text-[11px] text-muted-foreground border border-border/80 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                      <span>Direct Board Request / Interaction; online reservation disabled.</span>
                    </div>
                  )}
                  {item.equipmentClass === "F" && (
                    <div className="p-2 rounded bg-muted/70 text-[11px] text-muted-foreground border border-border/80 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>Requires Level V+ (Board/Eurobot) supervision during usage.</span>
                    </div>
                  )}
                  {item.equipmentClass === "G" && (
                    <div className="p-2 rounded bg-muted/70 text-[11px] text-muted-foreground border border-border/80 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
                      <span>High Value Electronics: Requires Level VI authorization.</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-xs min-h-[44px] px-2.5">
                    <Link
                      to={`/app/inventory/${item.id}`}
                      className="gap-1.5"
                      aria-label={`View details of ${item.name}`}
                    >
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
                      {inCart ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Cart</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
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
