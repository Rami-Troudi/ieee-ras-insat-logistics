import React from "react";
import { PlaceholderScaffold } from "@/components/shared/PlaceholderScaffold";
import { PageContainer, PageHeader, SectionHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Inbox,
  ClipboardList,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const BoardActionCenterPage: React.FC = () => {
  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Logistics Action Center"
        description="Unified operational queue: triage pending requests, verify handovers, process physical returns, and manage policy issues."
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary" size="default">
              <Link to="/board/requests">Review Pending (7)</Link>
            </Button>
          </div>
        }
      />

      {/* Action Queue Prioritized Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-destructive tracking-wider">
              Safety / Strikes
            </span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-2xl font-bold text-destructive">1</span>
          <p className="text-[11px] text-muted-foreground">14+ days overdue recommendation</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Overdue Loans
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold text-foreground">4</span>
          <p className="text-[11px] text-muted-foreground">Require borrower check-in</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Pending Returns
            </span>
            <Inbox className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-2xl font-bold text-foreground">3</span>
          <p className="text-[11px] text-muted-foreground">Awaiting physical inspection</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              New Requests
            </span>
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">7</span>
          <p className="text-[11px] text-muted-foreground">Awaiting Board review</p>
        </div>
      </div>

      <SectionHeader
        title="Immediate Operational Attention"
        description="Tasks sorted strictly by logistics urgency per Section 34 of the UI/UX specification."
      />

      <div className="space-y-3">
        {/* Sample Action Queue Card */}
        <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status="PENDING" label="Borrow Request" />
              <span className="text-xs font-mono text-muted-foreground">REQ-2026-0143</span>
              <span className="text-xs font-medium text-muted-foreground">• 12 minutes ago</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Eurobot 2027 — STM32 Nucleo (x2), Pololu Drivers (x4)
            </h4>
            <p className="text-xs text-muted-foreground">
              Borrower: Rami Troudi (Verified IEEE Member · Level III)
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button asChild variant="outline" size="sm">
              <Link to="/board/requests">Quick Review</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link to="/board/requests" className="gap-1">
                <span>Process</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card hover:border-secondary/40 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status="PARTIALLY_RETURNED" label="Physical Return" />
              <span className="text-xs font-mono text-muted-foreground">RET-2026-0089</span>
              <span className="text-xs font-medium text-muted-foreground">• 1 hour ago</span>
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              Equipment Return: Arduino Uno (x2 of 2), IR Sensors (x3 of 4)
            </h4>
            <p className="text-xs text-muted-foreground">
              Member brought physical items to Board cabinet for condition confirmation.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button asChild variant="secondary" size="sm">
              <Link to="/board/loans">Inspect & Confirm</Link>
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export const BoardInventoryPage: React.FC = () => (
  <PlaceholderScaffold
    title="Board Inventory Operations"
    description="Catalog management, stock operations (ADD/DAMAGE/REPAIR), and physical movement ledgers."
    domainStage="Stage 2: Inventory Management"
  />
);

export const BoardRequestsPage: React.FC = () => (
  <PlaceholderScaffold
    title="Request Review & Approval"
    description="Full line-item approvals, partial quantities, policy validation, and 48h handover allocations."
    domainStage="Stage 3: Approval & Allocation"
  />
);

export const BoardLoansPage: React.FC = () => (
  <PlaceholderScaffold
    title="Active Loans & Handovers"
    description="Manage physical checkouts, condition inspections, return verifications, and extension approvals."
    domainStage="Stage 3: Loans & Handover"
  />
);

export const BoardProjectsPage: React.FC = () => (
  <PlaceholderScaffold
    title="Projects & Equipment Assignments"
    description="Manage Eurobot and other club projects, assign members, and view aggregated team equipment."
    domainStage="Stage 3: Projects & Teams"
  />
);

export const BoardUsersPage: React.FC = () => (
  <PlaceholderScaffold
    title="User Accounts & Clearances"
    description="Process newly registered accounts, verify IEEE/Aerobotix affiliations, and update clearances."
    domainStage="Stage 2: User Account Processing"
  />
);

export const BoardAuditsPage: React.FC = () => (
  <PlaceholderScaffold
    title="Inventory Audits"
    description="Start audits with expected snapshots, register physical counts, and reconcile ledger discrepancies."
    domainStage="Stage 4: Inventory Auditing"
  />
);

export const BoardIncidentsPage: React.FC = () => (
  <PlaceholderScaffold
    title="Incidents, Strikes & Sanctions"
    description="Human-in-the-loop strike issuance (Strikes 1–5), compensation tracking, and appeals."
    domainStage="Stage 4: Discipline & Sanctions"
  />
);

export const BoardInsightsPage: React.FC = () => (
  <PlaceholderScaffold
    title="Logistics Insights & Telemetry"
    description="Operational statistics, borrowing trends over time, inventory health, and project equipment usage."
    domainStage="Stage 4: Analytics & Insights"
  />
);

export const BoardExportsPage: React.FC = () => (
  <PlaceholderScaffold
    title="CSV Data Exports"
    description="Permission-governed CSV data extraction for inventory, loans, audits, and club records."
    domainStage="Stage 4: Data Exports"
  />
);
