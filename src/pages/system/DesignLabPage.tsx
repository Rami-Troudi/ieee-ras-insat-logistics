import React, { useState } from "react";
import { PageContainer, PageHeader, SectionHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, DomainStatus } from "@/components/shared/StatusBadge";
import { SearchInput } from "@/components/shared/SearchInput";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { FavoriteButton } from "@/components/shared/FavoriteButton";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ResponsiveDataTable } from "@/components/shared/ResponsiveDataTable";
import { MobileEntityCard } from "@/components/shared/MobileEntityCard";
import { Metric } from "@/components/shared/Metric";
import { KeyValueRow } from "@/components/shared/KeyValueRow";
import { LoadingState } from "@/components/shared/LoadingState";
import { FilterBar, ActiveFilter } from "@/components/shared/FilterBar";
import { FilterDrawer } from "@/components/shared/FilterDrawer";
import { UserMenu } from "@/components/shared/UserMenu";
import { useQuery } from "@tanstack/react-query";
import { inventoryService, mockInventoryService, MockScenario } from "@/services/inventory";
import { QUERY_KEYS } from "@/app/query-client";
import rasLogoFull from "@/assets/ras_logo_full.png";
import rasLogoWhite from "@/assets/ras_logo_white.svg";
import { Clock, ClipboardList, AlertTriangle, Package } from "lucide-react";
import { InventoryItemSummary } from "@/types";

export const DesignLabPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [qty, setQty] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<MockScenario>("NORMAL");
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({
    "item-stm32-f4": true,
    "item-pololu-driver": true,
  });

  // Filter Bar state
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    { id: "class-e", label: "Class", value: "Class E (Electronic)", count: 3 },
    { id: "stock-avail", label: "Status", value: "Available Only" },
  ]);

  // TanStack Query using public service boundary
  const {
    data: mockItems,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [...QUERY_KEYS.inventory.list(), activeScenario],
    queryFn: () => inventoryService.listItems(),
  });

  const handleScenarioChange = (scenario: MockScenario) => {
    setActiveScenario(scenario);
    mockInventoryService.setScenario(scenario);
    refetch();
  };

  const toggleFavorite = (id: string) => {
    setFavoriteMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const removeFilter = (id: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
  };

  const tableColumns = [
    {
      key: "name",
      header: "Equipment Item",
      render: (item: InventoryItemSummary) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-foreground block">{item.name}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (item: InventoryItemSummary) => (
        <span className="text-xs text-muted-foreground">{item.category}</span>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (item: InventoryItemSummary) => (
        <Badge variant="outline" className="font-mono text-xs">
          Class {item.equipmentClass}
        </Badge>
      ),
    },
    {
      key: "stock",
      header: "Available / Total",
      className: "text-right",
      headerClassName: "text-right",
      render: (item: InventoryItemSummary) => (
        <span className="font-mono font-semibold text-xs">
          <span className="text-[hsl(var(--success))]">{item.availableQuantity}</span>
          <span className="text-muted-foreground"> / {item.totalQuantity}</span>
        </span>
      ),
    },
    {
      key: "action",
      header: "Favorite",
      className: "text-right",
      headerClassName: "text-right",
      render: (item: InventoryItemSummary) => (
        <FavoriteButton
          isFavorite={!!favoriteMap[item.id]}
          onToggle={() => toggleFavorite(item.id)}
          itemName={item.name}
        />
      ),
    },
  ];

  const allStatuses: DomainStatus[] = [
    "PENDING",
    "APPROVED",
    "PARTIALLY_APPROVED",
    "REJECTED",
    "EXPIRED",
    "WAITING",
    "HANDED_OVER",
    "ACTIVE",
    "CLOSED",
    "RETURNED",
    "PARTIALLY_RETURNED",
    "AVAILABLE",
    "BORROWED",
    "DAMAGED",
    "MAINTENANCE",
    "LOST",
    "RETIRED",
    "DUE_SOON",
    "OVERDUE",
    "RESTRICTED",
    "BANNED",
    "SUCCESS",
    "WARNING",
    "ERROR",
    "INFO",
  ];

  return (
    <PageContainer maxWidth="wide" className="space-y-12">
      <PageHeader
        title="Stage 1 Design Lab & Visual System"
        description="Authoritative reference for IEEE RAS brand tokens, official tints, typography, responsive components, and semantic states."
        action={
          <div className="flex items-center gap-3">
            <UserMenu />
            <Badge
              variant="outline"
              className="text-xs px-3 py-1 font-mono uppercase bg-amber-500/10 text-amber-700 border-amber-500/30"
            >
              Development Only
            </Badge>
          </div>
        }
      />

      {/* 1. Official RAS Brand Identity Section */}
      <section className="space-y-6">
        <SectionHeader
          title="1. IEEE RAS Brand Identity (Q4 2025 Canonical Guidelines)"
          description="Mandatory color codes, official tint distributions, logo proportions, and clear-space compliance."
        />

        {/* Logos Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-border bg-card space-y-3">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Official Full-Color Logo on Light Surface (Min Width ≥ 100px)
            </span>
            <div className="p-6 bg-white rounded-lg border border-border/80 flex items-center justify-center">
              <img
                src={rasLogoFull}
                alt="IEEE RAS Full Color Logo"
                className="h-16 w-auto max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Official combined IEEE Master Brand and RAS wordmark lockup. Digital clear space: ≥ ½
              × oval height.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-[var(--ieee-navy)] text-white space-y-3">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Official White Logo on Dark Surface (IEEE Navy #002855)
            </span>
            <div className="p-6 bg-[var(--ieee-navy)] rounded-lg border border-white/20 flex items-center justify-center">
              <img
                src={rasLogoWhite}
                alt="IEEE RAS White Logo"
                className="h-16 w-auto max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-white/70">
              Authorized white vector knockout treatment over IEEE Navy.
            </p>
          </div>
        </div>

        {/* Core Colors & Tints */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            Canonical Palette & Official Tints
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* RAS Red */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ras-red)] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #861F41
              </div>
              <span className="text-xs font-semibold text-foreground block">RAS Red (100%)</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                <div className="h-6 rounded bg-[var(--ras-red-80)]" title="80% #A54F63" />
                <div className="h-6 rounded bg-[var(--ras-red-60)]" title="60% #BD7A87" />
                <div className="h-6 rounded bg-[var(--ras-red-40)]" title="40% #D4A5AD" />
                <div className="h-6 rounded bg-[var(--ras-red-20)]" title="20% #EAD1D5" />
              </div>
            </div>

            {/* RAS Purple */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ras-purple)] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #772583
              </div>
              <span className="text-xs font-semibold text-foreground block">RAS Purple (100%)</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                <div className="h-6 rounded bg-[var(--ras-purple-80)]" title="80% #96529A" />
                <div className="h-6 rounded bg-[var(--ras-purple-60)]" title="60% #B17CB3" />
                <div className="h-6 rounded bg-[var(--ras-purple-40)]" title="40% #CBA7CC" />
                <div className="h-6 rounded bg-[var(--ras-purple-20)]" title="20% #E5D2E5" />
              </div>
            </div>

            {/* IEEE Blue */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ieee-blue)] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #00629B
              </div>
              <span className="text-xs font-semibold text-foreground block">IEEE Blue (100%)</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                <div className="h-6 rounded bg-[var(--ieee-blue-80)]" title="80% #007DAF" />
                <div className="h-6 rounded bg-[var(--ieee-blue-60)]" title="60% #5B9CC3" />
                <div className="h-6 rounded bg-[var(--ieee-blue-40)]" title="40% #95BCD6" />
                <div className="h-6 rounded bg-[var(--ieee-blue-20)]" title="20% #CADCEA" />
              </div>
            </div>

            {/* IEEE Navy */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ieee-navy)] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #002855
              </div>
              <span className="text-xs font-semibold text-foreground block">IEEE Navy (100%)</span>
              <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center">
                <div className="h-6 rounded bg-[var(--ieee-navy-80)]" title="80% #2D4D76" />
                <div className="h-6 rounded bg-[var(--ieee-navy-60)]" title="60% #627596" />
                <div className="h-6 rounded bg-[var(--ieee-navy-40)]" title="40% #94A1B8" />
                <div className="h-6 rounded bg-[var(--ieee-navy-20)]" title="20% #C8CEDA" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shared Foundation Components */}
      <section className="space-y-6">
        <SectionHeader
          title="2. Shared Foundation Primitives"
          description="Operational primitives built for Stage 2 (Member) and Stage 3 (Board) workflows."
        />

        {/* Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Metric
            label="Active Loans"
            value="14"
            description="Across 6 active Eurobot teams"
            icon={Package}
            variant="default"
          />
          <Metric
            label="Pending Review"
            value="7"
            description="3 Class E, 2 Class F"
            icon={ClipboardList}
            variant="secondary"
          />
          <Metric
            label="Due Soon"
            value="3"
            description="Collection window < 48h"
            icon={Clock}
            variant="warning"
          />
          <Metric
            label="Active Strikes"
            value="2"
            description="1 user restricted (Strike 2)"
            icon={AlertTriangle}
            variant="danger"
          />
        </div>

        {/* Alert Banners & Policy Notices */}
        <div className="space-y-3">
          <AlertBanner
            variant="warning"
            title="Loan Due in 24 Hours: STM32F401RE Nucleo"
            description="Your loan for Eurobot 2027 is due tomorrow at 18:00. Return equipment to the Board cabinet or request an extension."
            action={
              <Button size="sm" variant="outline">
                Request Extension
              </Button>
            }
          />
          <AlertBanner
            variant="danger"
            title="Strike 2 Notice Active"
            description="Due to 7-day late return on REQ-2026-0089, borrower privileges are restricted to Class A/B only."
          />
          <PolicyNotice
            ruleRef="REG-SEC-3.1"
            summary="Class E (Electronic Resources) Clearance Rule"
            details="Class E equipment requires verified Level III clearance or above. Eurobot leads hold Level V authorization for team batch allocations."
          />
        </div>

        {/* KeyValueRow Inspection Panel */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            Equipment Item Inspector (KeyValueRow Pattern)
          </h4>
          <div className="max-w-lg">
            <KeyValueRow label="Item Identifier" value="item-stm32-f4" isMono />
            <KeyValueRow label="Equipment Class" value={<Badge variant="outline">Class E</Badge>} />
            <KeyValueRow label="Tracking Mode" value="INDIVIDUAL_ASSET" isMono />
            <KeyValueRow label="Available Stock" value="5 of 8 units" />
            <KeyValueRow label="Borrower Status" value={<StatusBadge status="AVAILABLE" />} />
          </div>
        </div>
      </section>

      {/* 3. Responsive Data Presentation (Table + Mobile Cards) */}
      <section className="space-y-6">
        <SectionHeader
          title="3. Responsive Data Presentation Pattern"
          description="Desktop renders dense tabular display; mobile viewports (<1024px) seamlessly adapt to thumb-friendly entity cards."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Catalog Equipment Items</h4>
              <p className="text-xs text-muted-foreground">
                Resize browser to inspect desktop table vs mobile cards adaptation.
              </p>
            </div>
          </div>

          <ResponsiveDataTable<InventoryItemSummary>
            data={mockItems || []}
            keyExtractor={(it) => it.id}
            columns={tableColumns}
            renderMobileCard={(item) => (
              <MobileEntityCard
                title={item.name}
                subtitle={item.category}
                status={
                  <StatusBadge status={item.availableQuantity > 0 ? "AVAILABLE" : "BORROWED"} />
                }
                metadata={[
                  { label: "Class", value: `Class ${item.equipmentClass}` },
                  { label: "Stock", value: `${item.availableQuantity} / ${item.totalQuantity}` },
                  { label: "Tracking", value: item.trackingMode },
                ]}
                action={
                  <FavoriteButton
                    isFavorite={!!favoriteMap[item.id]}
                    onToggle={() => toggleFavorite(item.id)}
                    itemName={item.name}
                  />
                }
              />
            )}
          />
        </div>
      </section>

      {/* 4. Filter Foundation (Toolbar, Chips, Drawer) */}
      <section className="space-y-6">
        <SectionHeader
          title="4. Filter Foundation & Ergonomics"
          description="Inline toolbar on desktop, slide-up sheet on mobile, with removable filter chips."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <FilterBar
            filters={activeFilters}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            desktopControls={
              <>
                <SearchInput
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClear={() => setSearchValue("")}
                  placeholder="Filter by keyword..."
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  Class E Only
                </Button>
                <Button variant="outline" size="sm">
                  Available Stock
                </Button>
              </>
            }
            mobileDrawer={
              <FilterDrawer
                open={filterDrawerOpen}
                onOpenChange={setFilterDrawerOpen}
                activeCount={activeFilters.length}
                onReset={clearAllFilters}
                onApply={() => {}}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Equipment Class
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Class A", "Class C", "Class E", "Class F"].map((cls) => (
                        <Button key={cls} variant="outline" size="sm" className="justify-start">
                          {cls}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Availability
                    </label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        In Stock Only
                      </Button>
                      <Button variant="outline" size="sm">
                        All Items
                      </Button>
                    </div>
                  </div>
                </div>
              </FilterDrawer>
            }
          />
        </div>
      </section>

      {/* 5. Mock Service Scenario Control */}
      <section className="space-y-6">
        <SectionHeader
          title="5. Mock Service State Control (Simulated Scenarios)"
          description="Test async UI states: SUCCESS, EMPTY, ERROR, and SLOW latency with live TanStack Query."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground mr-2">
              Select Scenario:
            </span>
            {(["NORMAL", "SUCCESS", "EMPTY", "ERROR", "SLOW"] as MockScenario[]).map((sc) => (
              <Button
                key={sc}
                variant={activeScenario === sc ? "default" : "outline"}
                size="sm"
                onClick={() => handleScenarioChange(sc)}
                className="font-mono text-xs"
              >
                {sc}
              </Button>
            ))}
            {isFetching && (
              <Badge variant="outline" className="animate-pulse ml-2">
                Simulating network...
              </Badge>
            )}
          </div>

          <div className="pt-2">
            {isLoading && <LoadingState variant="table" count={3} />}

            {isError && (
              <ErrorState
                title="Mock Query Failure Triggered"
                description="Simulated network fault scenario. Demonstrating resilient error boundary."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && mockItems && mockItems.length === 0 && (
              <EmptyState
                title="No Matching Equipment Found"
                description="Empty scenario active. No items match current catalog query."
                actionLabel="Switch to NORMAL Scenario"
                onAction={() => handleScenarioChange("NORMAL")}
              />
            )}

            {!isLoading && !isError && mockItems && mockItems.length > 0 && (
              <div className="text-xs text-muted-foreground font-mono">
                Fetched {mockItems.length} items successfully under scenario [{activeScenario}].
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Generic Loading State Skeletons */}
      <section className="space-y-6">
        <SectionHeader
          title="6. Standard Loading State Patterns"
          description="Consistent skeleton placeholders for cards, tables, sections, and lists."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Card Grid Loading
            </span>
            <LoadingState variant="cards" count={2} />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              List Item Loading
            </span>
            <LoadingState variant="list" count={3} />
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Domain Status Badges */}
      <section className="space-y-6">
        <SectionHeader
          title="7. Complete Multi-Dimensional Status Badges (All 25 Domain States)"
          description="Verified declarative STATUS_CONFIG mapping without brittle switch fallbacks."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((st) => (
              <StatusBadge key={st} status={st} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Interactive Form Controls & Dialogs */}
      <section className="space-y-6">
        <SectionHeader
          title="8. Interactive Controls & Dialogs"
          description="Bound-checked numeric selector, responsive dialog (drawer on mobile), and confirmation dialog."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <QuantitySelector value={qty} onChange={setQty} min={1} max={10} />
              <span className="text-xs text-muted-foreground">Requested Units: {qty}</span>
            </div>

            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              Open Responsive Dialog
            </Button>

            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Test Confirmation Dialog
            </Button>
          </div>
        </div>
      </section>

      {/* Overlays */}
      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Responsive Dialog Pattern"
        description="Adapts to an accessible modal dialog on desktop (>=1024px) and a bottom sheet on mobile."
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Ergonomic thumb reach on mobile devices with comfortable desktop multi-column balance.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Dismiss
            </Button>
            <Button variant="default" onClick={() => setDialogOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Issue Permanent Sanction (Strike 5)?"
        description="This will permanently revoke borrowing privileges per the 5-strike regulatory ledger. Historical audit logs will be preserved."
        variant="destructive"
        confirmLabel="Permanently Restrict"
        onConfirm={() => setConfirmOpen(false)}
      />
    </PageContainer>
  );
};
