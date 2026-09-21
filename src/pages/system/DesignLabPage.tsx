import React, { useState } from "react";
import { PageContainer, PageHeader, SectionHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchInput } from "@/components/shared/SearchInput";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/mock/inventory";
import { QUERY_KEYS } from "@/app/query-client";
import rasLogoFull from "@/assets/ras_logo_full.png";
import rasLogoWhite from "@/assets/ras_logo_white.svg";
import { ShieldAlert } from "lucide-react";

export const DesignLabPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [qty, setQty] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);

  // TanStack Query test against MockInventoryService
  const { data: mockItems, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.inventory.list(),
    queryFn: () => inventoryService.listItems(),
  });

  return (
    <PageContainer maxWidth="wide" className="space-y-12">
      <PageHeader
        title="Stage 1 Design Lab & Visual System"
        description="Authoritative reference for IEEE RAS brand tokens, official tints, typography, responsive components, and semantic states."
        action={
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono uppercase bg-amber-500/10 text-amber-700 border-amber-500/30">
            Development Only
          </Badge>
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
              Official wordmark and oval mark. Proportions strictly maintained, digital minimum ≥ 100px.
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
              Authorized white vector treatment over IEEE Navy. Never placed over light backgrounds.
            </p>
          </div>
        </div>

        {/* Core Colors & Tints */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Canonical Palette & Official Tints</h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* RAS Red */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ras-red)] text-white flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #861F41
              </div>
              <span className="text-xs font-semibold text-foreground block">RAS Red (100%)</span>
              <div className="grid grid-cols-4 gap-1">
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
              <div className="grid grid-cols-4 gap-1">
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
              <div className="grid grid-cols-4 gap-1">
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
              <div className="grid grid-cols-4 gap-1">
                <div className="h-6 rounded bg-[var(--ieee-navy-80)]" title="80% #2D4D76" />
                <div className="h-6 rounded bg-[var(--ieee-navy-60)]" title="60% #627596" />
                <div className="h-6 rounded bg-[var(--ieee-navy-40)]" title="40% #94A1B8" />
                <div className="h-6 rounded bg-[var(--ieee-navy-20)]" title="20% #C8CEDA" />
              </div>
            </div>

            {/* IEEE Orange */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ieee-orange)] text-black flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #FFA300
              </div>
              <span className="text-xs font-semibold text-foreground block">IEEE Orange</span>
              <span className="text-[11px] text-muted-foreground">Accent Supporting</span>
            </div>

            {/* IEEE Gold */}
            <div className="space-y-1.5">
              <div className="h-14 rounded-md bg-[var(--ieee-gold)] text-black flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                #FFC72C
              </div>
              <span className="text-xs font-semibold text-foreground block">IEEE Gold</span>
              <span className="text-[11px] text-muted-foreground">Accent Supporting</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Semantic UI Controls Section */}
      <section className="space-y-6">
        <SectionHeader
          title="2. Interactive UI Primitives & Sizing"
          description="Buttons, inputs, dialogs, drawers, and quantity selectors with strict >=44px touch targets."
        />

        {/* Buttons Grid */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Button Variants (Primary = RAS Purple, Brand Accent = RAS Red)</h4>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary Action (RAS Purple)</Button>
            <Button variant="secondary">Secondary (RAS Red)</Button>
            <Button variant="destructive">Destructive (Semantic Danger)</Button>
            <Button variant="outline">Outline Neutral</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="brandRed">Brand Red Explicit</Button>
          </div>
        </div>

        {/* Form Controls & Quantity Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Search Input & Form Field</h4>
            <SearchInput
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue("")}
              placeholder="Search STM32, Arduino, sensors..."
            />
            <Input placeholder="Direct serial or text input..." />
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quantity Selector & Overlays</h4>
            <div className="flex items-center gap-4">
              <QuantitySelector value={qty} onChange={setQty} min={1} max={10} />
              <span className="text-xs text-muted-foreground">Current: {qty} units requested</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                Open Responsive Dialog
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Test Consequence Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-destructive" />
                      <span>Issue Permanent Blacklist (Strike 5)?</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently blacklist the user from the IEEE RAS INSAT Logistics Platform.
                      Historical accountability and logs will be preserved, but all future borrowing privileges will be revoked permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel Action</AlertDialogCancel>
                    <AlertDialogAction>Permanently Blacklist</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Domain Status Badges Section */}
      <section className="space-y-6">
        <SectionHeader
          title="3. Multi-Dimensional Domain Statuses"
          description="Consistent vocabulary pairing colors, icons, and explicit text without color-only encoding."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Request Decision States
            </h4>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="PENDING" label="Pending Board Review" />
              <StatusBadge status="APPROVED" label="Approved (48h Window)" />
              <StatusBadge status="PARTIALLY_APPROVED" label="Partially Approved (2 of 3)" />
              <StatusBadge status="REJECTED" label="Rejected" />
              <StatusBadge status="EXPIRED" label="Approval Expired" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Loan Lifecycle & Urgency States
            </h4>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="ACTIVE" label="Active Loan (Handed Over)" />
              <StatusBadge status="DUE_SOON" label="Due Tomorrow" />
              <StatusBadge status="OVERDUE" label="Overdue by 3 Days" />
              <StatusBadge status="RETURNED" label="Return Confirmed" />
              <StatusBadge status="PARTIALLY_RETURNED" label="Partially Returned" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Inventory State & Disciplinary Sanctions
            </h4>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="AVAILABLE" label="Available Stock" />
              <StatusBadge status="BORROWED" label="Borrowed" />
              <StatusBadge status="MAINTENANCE" label="Under Maintenance" />
              <StatusBadge status="DAMAGED" label="Damaged Unit" />
              <StatusBadge status="RESTRICTED" label="Strike 2 Active (Restricted)" />
              <StatusBadge status="BANNED" label="Semester Ban (Strike 4)" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Typed Mock Service & TanStack Query Section */}
      <section className="space-y-6">
        <SectionHeader
          title="4. Data Architecture & Mock Service Layer"
          description="Verified TanStack Query integration over typed IInventoryService with simulated latency."
        />

        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Live TanStack Query Output</h4>
              <p className="text-xs text-muted-foreground">
                Fetched via MockInventoryService with simulated 250ms latency.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refetch Query
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {isError && (
            <ErrorState
              title="Query Failed"
              description="Could not communicate with the inventory service."
              onRetry={() => refetch()}
            />
          )}

          {!isLoading && !isError && mockItems && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-semibold text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        Class {item.equipmentClass}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.trackingMode}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-[hsl(var(--success))]">
                      {item.availableQuantity}
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {item.totalQuantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      {/* 5. Feedback States (Empty & Error) */}
      <section className="space-y-6">
        <SectionHeader
          title="5. Reusable Empty & Error States"
          description="Consistent guidance when data is zero, pending, or interrupted."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No Active Loans"
            description="You do not currently hold any borrowed equipment. Browse the inventory catalog when you need items for projects."
            actionLabel="Browse Catalog"
            onAction={() => {}}
          />

          <ErrorState
            title="Connection Interrupted"
            description="Could not sync with the logistics server. Unsent input has been preserved locally."
            onRetry={() => {}}
          />
        </div>
      </section>

      {/* Responsive Dialog Instance */}
      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Responsive Dialog Pattern"
        description="Adapts to an accessible modal dialog on desktop (>=1024px) and a swipeable bottom sheet drawer on mobile viewports."
      >
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            This interaction pattern ensures ergonomic thumb reach on mobile devices while maintaining comfortable desktop multi-column balance.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Dismiss
            </Button>
            <Button variant="default" onClick={() => setDialogOpen(false)}>
              Confirm Choice
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </PageContainer>
  );
};
