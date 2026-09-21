import React from "react";
import { PageContainer, PageHeader, SectionHeader } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { Link } from "react-router-dom";
import { Package, Clock, ClipboardList, ArrowRight } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { useUserLoans } from "@/features/loans/hooks/useLoans";
import { useUserRequests } from "@/features/requests/hooks/useRequests";
import { formatDate, isDatePast, isDateWithinDays } from "@/lib/dates";

export const MemberHomePage: React.FC = () => {
  const { currentPersona } = useSession();

  const { data: loans = [] } = useUserLoans(currentPersona.id);
  const { data: requests = [] } = useUserRequests(currentPersona.id);

  const activeLoans = loans.filter((l) => l.status !== "CLOSED" && l.status !== "RETURNED");
  const totalHeldUnits = activeLoans.reduce(
    (sum, l) => sum + l.items.reduce((s, i) => s + (i.borrowedQuantity - i.returnedQuantity), 0),
    0
  );

  const overdueLoan = activeLoans.find((l) => isDatePast(l.dueDate));
  const dueSoonLoan = activeLoans.find((l) => isDateWithinDays(l.dueDate, 3));

  const recentRequest = requests[0];

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome, ${currentPersona.name.split(" ")[0]}`}
        description="IEEE RAS INSAT Logistics portal: request equipment, track current loans, and coordinate returns."
        action={
          <Button asChild variant="default" size="default" className="min-h-[44px]">
            <Link to="/app/inventory" className="gap-2">
              <Package className="w-4 h-4" />
              <span>Browse Equipment</span>
            </Link>
          </Button>
        }
      />

      {/* Disciplinary & Onboarding Banners */}
      {!currentPersona.isProcessed && (
        <PolicyNotice
          variant="warning"
          title="Account Pending Physical Verification"
          description="Your affiliation is currently unverified. Visit the RAS Workshop desk with your student card to enable equipment checkouts."
        />
      )}

      {currentPersona.status === "RESTRICTED" && (
        <PolicyNotice
          variant="restricted"
          title="Borrowing Privileges Suspended"
          description={`Your account has ${currentPersona.strikesCount} active strike(s). Settle overdue equipment to restore borrowing privileges.`}
        />
      )}

      {/* Dynamic Operational Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Held Equipment Card */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Current Equipment
            </span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-2xl font-bold text-foreground">
              {totalHeldUnits} {totalHeldUnits === 1 ? "Unit" : "Units"}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              Held across {activeLoans.length} active {activeLoans.length === 1 ? "loan" : "loans"}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            {overdueLoan ? (
              <StatusBadge status="OVERDUE" label="1 loan overdue" />
            ) : dueSoonLoan ? (
              <StatusBadge status="DUE_SOON" label={`Due on ${formatDate(dueSoonLoan.dueDate)}`} />
            ) : (
              <StatusBadge status="ACTIVE" label="All loans in good standing" />
            )}
            <Link
              to="/app/loans"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]"
            >
              <span>View loans</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Recent Request Card */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Recent Request
            </span>
            <ClipboardList className="w-4 h-4 text-secondary" />
          </div>
          <div>
            {recentRequest ? (
              <>
                <span className="text-base font-semibold text-foreground">{recentRequest.id}</span>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {recentRequest.projectName ? `${recentRequest.projectName} · ` : ""}
                  {recentRequest.items.reduce((s, i) => s + i.requestedQuantity, 0)} units
                </p>
              </>
            ) : (
              <>
                <span className="text-base font-semibold text-foreground">No Requests</span>
                <p className="text-xs text-muted-foreground mt-0.5">No recent activity</p>
              </>
            )}
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            {recentRequest ? (
              <>
                <StatusBadge status={recentRequest.status} />
                <Link
                  to={`/app/requests/${recentRequest.id}`}
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]"
                >
                  <span>View status</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </>
            ) : (
              <Link
                to="/app/inventory"
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]"
              >
                <span>Browse gear</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Clearance & Affiliation */}
        <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Clearance & Affiliation
            </span>
            <span className="text-xs font-bold text-foreground font-mono">
              Level {currentPersona.clearance}
            </span>
          </div>
          <div>
            <span className="text-base font-semibold text-foreground">
              {currentPersona.affiliation}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentPersona.isProcessed
                ? "Verified by Logistics Board"
                : "Self-declared (Provisional)"}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-border/60">
            <StatusBadge status={currentPersona.status === "ACTIVE" ? "ACTIVE" : "RESTRICTED"} />
            <Link
              to="/app/profile"
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 py-2.5 min-h-[44px]"
            >
              <span>View credentials</span>
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
            <span className="text-sm font-semibold text-foreground block">
              Find & Request Equipment
            </span>
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
            <span className="text-sm font-semibold text-foreground block">
              Return or Extend Items
            </span>
            <span className="text-xs text-muted-foreground">
              Initiate return or request new due date
            </span>
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
            <span className="text-xs text-muted-foreground">
              Track approvals & 48h collection window
            </span>
          </div>
        </Link>
      </div>
    </PageContainer>
  );
};
