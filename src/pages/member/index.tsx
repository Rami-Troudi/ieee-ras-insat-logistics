import React from "react";
import { PlaceholderScaffold } from "@/components/shared/PlaceholderScaffold";
import { PageContainer, PageHeader, SectionHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "react-router-dom";
import { Package, Clock, ClipboardList, ArrowRight } from "lucide-react";
import { useDevPersona } from "@/hooks/useDevPersona";

export const MemberHomePage: React.FC = () => {
  const { currentPersona } = useDevPersona();

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${currentPersona.name.split(" ")[0]}`}
        description="IEEE RAS INSAT Logistics portal: request equipment, track current loans, and coordinate returns."
        action={
          <Button asChild variant="default" size="default">
            <Link to="/app/inventory" className="gap-2">
              <Package className="w-4 h-4" />
              <span>Browse Equipment</span>
            </Link>
          </Button>
        }
      />

      {/* Operational Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Current Equipment
            </span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">3 Items</span>
            <p className="text-xs text-muted-foreground mt-0.5">Physically held across active projects</p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <StatusBadge status="DUE_SOON" label="1 due in 2 days" />
            <Link to="/app/loans" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]">
              <span>View loans</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Recent Request
            </span>
            <ClipboardList className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <span className="text-base font-semibold text-foreground">REQ-2026-0142</span>
            <p className="text-xs text-muted-foreground mt-0.5">Eurobot 2027 · 3 boards, 2 motors</p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <StatusBadge status="PARTIALLY_APPROVED" label="Partially Approved" />
            <Link to="/app/requests" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]">
              <span>View status</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Clearance & Affiliation
            </span>
            <span className="text-xs font-bold text-foreground font-mono">
              Level {currentPersona.clearance}
            </span>
          </div>
          <div>
            <span className="text-base font-semibold text-foreground">{currentPersona.affiliation}</span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentPersona.isProcessed ? "Verified by Logistics Board" : "Self-declared (Provisional)"}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <StatusBadge status={currentPersona.status === "ACTIVE" ? "ACTIVE" : "RESTRICTED"} />
            <Link to="/app/profile" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]">
              <span>View details</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <SectionHeader
        title="Quick Operational Actions"
        description="Core member workflows required by the logistics regulations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link
          to="/app/inventory"
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3 min-h-[48px]"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block">Find & Request Equipment</span>
            <span className="text-xs text-muted-foreground">Class A, C, E, and F catalog</span>
          </div>
        </Link>

        <Link
          to="/app/loans"
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3 min-h-[48px]"
        >
          <div className="w-9 h-9 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block">Return or Extend Items</span>
            <span className="text-xs text-muted-foreground">Initiate return or request new due date</span>
          </div>
        </Link>

        <Link
          to="/app/requests"
          className="p-4 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors flex items-center gap-3 min-h-[48px]"
        >
          <div className="w-9 h-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground block">My Request Status</span>
            <span className="text-xs text-muted-foreground">Track approvals & 48h collection window</span>
          </div>
        </Link>
      </div>
    </PageContainer>
  );
};

export const MemberInventoryPage: React.FC = () => (
  <PlaceholderScaffold
    title="Equipment Inventory"
    description="Search, filter, favorite, and add items to your borrow request cart."
    domainStage="Stage 2: Inventory & Catalog"
  />
);

export const MemberRequestsPage: React.FC = () => (
  <PlaceholderScaffold
    title="My Borrow Requests"
    description="Track submitted requests, partial approvals, and the 48-hour pickup window."
    domainStage="Stage 3: Borrowing & Requests"
  />
);

export const MemberLoansPage: React.FC = () => (
  <PlaceholderScaffold
    title="My Active Loans"
    description="View physically borrowed equipment, due dates, request extensions, or initiate returns."
    domainStage="Stage 3: Loans & Returns"
  />
);

export const MemberFavoritesPage: React.FC = () => (
  <PlaceholderScaffold
    title="Favorite Equipment"
    description="Quickly access frequently requested boards, motors, and electronic resources."
    domainStage="Stage 2: Favorites Integration"
  />
);

export const MemberNotificationsPage: React.FC = () => (
  <PlaceholderScaffold
    title="In-App Notifications"
    description="Authoritative notifications for loan approvals, return confirmations, due dates, and alerts."
    domainStage="Stage 3: In-App Notifications"
  />
);

export const MemberProfilePage: React.FC = () => (
  <PlaceholderScaffold
    title="Member Profile & Clearance"
    description="View verified affiliation, clearance level, strikes ledger, and assigned projects."
    domainStage="Stage 2: Profile & Verification"
  />
);
