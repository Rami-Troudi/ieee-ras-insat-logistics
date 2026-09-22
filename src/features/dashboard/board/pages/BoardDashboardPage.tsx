import React from "react";
import { Link } from "react-router-dom";
import {
  useBoardRequests,
  useReviewBorrowRequest,
} from "@/features/requests/board/hooks/useBoardRequests";
import { useBoardLoans } from "@/features/loans/board/hooks/useBoardLoans";
import { useBoardInventory } from "@/features/inventory/board/hooks/useBoardInventory";
import { useSession } from "@/hooks/useSession";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { formatDate, isDatePast } from "@/lib/dates";
import { Inbox, Clock, Calendar, AlertTriangle, ArrowRight, Check } from "lucide-react";

export const BoardDashboardPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: requests = [], isLoading: loadingRequests } = useBoardRequests();
  const { data: loans = [], isLoading: loadingLoans } = useBoardLoans();
  const { data: _inventory = [], isLoading: loadingInventory } = useBoardInventory();
  const reviewMutation = useReviewBorrowRequest();

  if (loadingRequests || loadingLoans || loadingInventory) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <LoadingState message="Loading logistics dashboard..." />
      </div>
    );
  }

  // Pending requests needing review
  const pendingRequests = requests.filter(
    (r) => r.decisionStatus === "PENDING" && r.lifecycleStatus === "ACTIVE"
  );

  // Ready for pickup (approved, waiting for handover)
  const readyForPickup = requests.filter(
    (r) =>
      (r.decisionStatus === "APPROVED" || r.decisionStatus === "PARTIALLY_APPROVED") &&
      r.handoverStatus === "WAITING" &&
      r.lifecycleStatus === "ACTIVE"
  );

  // Items currently out (active loans)
  const activeLoans = loans.filter((l) => l.lifecycleStatus === "ACTIVE");
  const totalItemsOut = activeLoans.reduce(
    (sum, l) => sum + (l.items || []).reduce((isum, i) => isum + i.borrowedQuantity, 0),
    0
  );

  // Due today
  const todayStr = new Date().toISOString().split("T")[0];
  const dueToday = activeLoans.filter((l) => l.dueDate === todayStr);

  // Overdue
  const overdueLoans = activeLoans.filter(
    (l) => l.dueStatus === "OVERDUE" || isDatePast(l.dueDate)
  );

  // Quick 1-click approval for standard C/E requests with enough stock
  const handleQuickApprove = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    await reviewMutation.mutateAsync({
      payload: {
        requestId,
        lines: req.items.map((i) => ({
          lineId: i.id,
          approvedQuantity: i.requestedQuantity,
        })),
        decisionNotes: "Approved via quick review",
      },
      actorUserId: currentPersona.id,
      actorRole: currentPersona.role,
      actorClearance: currentPersona.clearance,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Logistics Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Real-time overview of equipment requests, loans, and inventory.
        </p>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/board/requests"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
            <Inbox className="w-4 h-4 text-primary" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {pendingRequests.length}
          </span>
        </Link>

        <Link
          to="/board/borrowed"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Items Out</span>
            <Clock className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {totalItemsOut}
          </span>
        </Link>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Due Today</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {dueToday.length}
          </span>
        </div>

        <Link
          to="/board/borrowed"
          className="p-4 rounded-xl border border-border bg-card hover:border-destructive/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold text-destructive">
            {overdueLoans.length}
          </span>
        </Link>
      </div>

      {/* Main Grid: Pending Requests & Due Today / Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Pending Requests ({pendingRequests.length})
            </h2>
            <Link
              to="/board/requests"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
              No pending requests right now.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingRequests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-sm text-foreground block">
                        {req.userName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Expected {formatDate(req.expectedReturnDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        onClick={() => handleQuickApprove(req.id)}
                        disabled={reviewMutation.isPending}
                        className="h-8 px-2.5 text-xs font-semibold gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="h-8 px-2 text-xs">
                        <Link to={`/board/requests/${req.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">
                    {req.items.map((i) => `${i.itemName} ×${i.requestedQuantity}`).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operational Focus: Ready for Pickup & Overdue */}
        <div className="space-y-5">
          {/* Ready for Pickup */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Ready for Pickup ({readyForPickup.length})
            </h2>

            {readyForPickup.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                No equipment awaiting pickup.
              </div>
            ) : (
              <div className="space-y-2">
                {readyForPickup.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">{req.userName}</span>
                      <span className="text-muted-foreground text-[11px]">
                        {req.items
                          .map((i) => `${i.itemName} ×${i.approvedQuantity || i.requestedQuantity}`)
                          .join(", ")}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs font-semibold shrink-0"
                    >
                      <Link to={`/board/requests/${req.id}`}>Hand Over</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overdue / Due Today */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Overdue Equipment ({overdueLoans.length})
            </h2>

            {overdueLoans.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                Zero overdue loans. All equipment on schedule!
              </div>
            ) : (
              <div className="space-y-2">
                {overdueLoans.slice(0, 3).map((loan) => (
                  <div
                    key={loan.id}
                    className="p-3 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground block">{loan.userName}</span>
                      <span className="text-destructive font-semibold text-[11px]">
                        Due {formatDate(loan.dueDate)} •{" "}
                        {loan.items.map((i) => i.itemName).join(", ")}
                      </span>
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs shrink-0">
                      <Link to={`/board/loans/${loan.id}`}>Return</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
