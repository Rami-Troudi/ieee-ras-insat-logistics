import React from "react";
import { Link } from "react-router-dom";
import { useUserRequests, useCancelRequest } from "@/features/requests/hooks/useRequests";
import { useUserLoans } from "@/features/loans/hooks/useLoans";
import { useInventoryItems } from "@/features/inventory/hooks/useInventory";
import { useSession } from "@/hooks/useSession";
import { useBorrowCart } from "@/features/cart";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { Package, RotateCcw, Plus, X, Clock } from "lucide-react";

export const MemberActivityPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { addItem } = useBorrowCart();
  const cancelRequestMutation = useCancelRequest(currentPersona.id);

  const { data: requests = [], isLoading: loadingReqs } = useUserRequests(currentPersona.id);
  const { data: loans = [], isLoading: loadingLoans } = useUserLoans(currentPersona.id);
  const { data: allItems = [] } = useInventoryItems({}, currentPersona.id);

  if (loadingReqs || loadingLoans) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LoadingState message="Loading your equipment activity..." />
      </div>
    );
  }

  // Group into human sections:
  // 1. Ready to pick up: Requests approved/partially approved, waiting for physical handover
  const readyToPickUp = requests.filter(
    (r) =>
      (r.decisionStatus === "APPROVED" || r.decisionStatus === "PARTIALLY_APPROVED") &&
      r.handoverStatus === "WAITING" &&
      r.lifecycleStatus === "ACTIVE"
  );

  // 2. With you: Currently active physical loans
  const withYou = loans.filter((l) => l.lifecycleStatus === "ACTIVE");

  // 3. Waiting: Requests submitted, awaiting Board review
  const waiting = requests.filter(
    (r) => r.decisionStatus === "PENDING" && r.lifecycleStatus === "ACTIVE"
  );

  // 4. Past: Returned loans or closed/cancelled requests
  const pastLoans = loans.filter((l) => l.lifecycleStatus === "CLOSED");

  // Helper to re-add items to cart from past history
  const handleRequestAgain = (itemIds: { itemId: string; quantity: number }[]) => {
    itemIds.forEach(({ itemId, quantity }) => {
      const match = allItems.find((i) => i.id === itemId);
      if (match && match.availableQuantity > 0) {
        addItem(match, Math.min(quantity, match.availableQuantity));
      }
    });
  };

  const hasAnyActivity =
    readyToPickUp.length > 0 || withYou.length > 0 || waiting.length > 0 || pastLoans.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Activity</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your equipment requests, active borrowings, and history.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-9 gap-1.5">
          <Link to="/app/inventory">
            <Plus className="w-3.5 h-3.5" />
            <span>Borrow</span>
          </Link>
        </Button>
      </div>

      {!hasAnyActivity && (
        <div className="text-center py-16 px-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/40">
          <Package className="w-10 h-10 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No recent activity</h3>
            <p className="text-xs text-muted-foreground">
              When you request or borrow robotics equipment, your updates will show up here.
            </p>
          </div>
          <Button asChild variant="default" size="sm" className="mt-2">
            <Link to="/app/inventory">Explore Catalogue</Link>
          </Button>
        </div>
      )}

      {/* SECTION 1: READY TO PICK UP */}
      {readyToPickUp.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Ready to Pick Up ({readyToPickUp.length})
            </h2>
          </div>

          <div className="space-y-3">
            {readyToPickUp.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs space-y-3.5"
              >
                {/* Visual Status Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Approved & Ready for Pickup
                    </span>
                    <span className="text-muted-foreground font-normal">
                      {req.pickupDeadline
                        ? `Before ${formatDate(req.pickupDeadline)}`
                        : "At RAS desk"}
                    </span>
                  </div>

                  {/* 3-Step Visual Progress Bar */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        1. Sent
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        2. Approved
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">
                        3. Pickup Now
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-border/60 bg-background/80 rounded-xl p-3 border border-border/60 text-xs space-y-1.5">
                  {req.items.map((item) => (
                    <div
                      key={item.id}
                      className="pt-1.5 first:pt-0 flex items-center justify-between"
                    >
                      <span className="font-semibold text-foreground">{item.itemName}</span>
                      <span className="font-bold text-foreground">
                        ×{item.approvedQuantity || item.requestedQuantity}
                      </span>
                    </div>
                  ))}
                </div>

                {req.scheduledPickup && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 text-xs">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold">Scheduled Pickup Appointment:</span>{" "}
                      <span className="font-semibold">
                        {new Date(req.scheduledPickup).toLocaleString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[11px] block text-emerald-800 dark:text-emerald-300 font-normal">
                        Please come to the IEEE RAS workspace to collect your gear.
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end pt-1">
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link to={`/app/requests/${req.id}`}>View Details & Collection</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: WITH YOU */}
      {withYou.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              With You ({withYou.length})
            </h2>
          </div>

          <div className="space-y-2.5">
            {withYou.map((loan) => {
              const isOverdue = loan.dueStatus === "OVERDUE";
              return (
                <div
                  key={loan.id}
                  className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground">
                        {isOverdue ? (
                          <span className="text-destructive font-semibold">
                            Overdue • Expected back {formatDate(loan.dueDate)}
                          </span>
                        ) : (
                          <span>Expected back {formatDate(loan.dueDate)}</span>
                        )}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Return directly to the logistics team at the workshop.
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-border/60 bg-muted/30 rounded-lg p-2.5 border border-border/60 text-xs space-y-1">
                    {loan.items.map((item) => (
                      <div
                        key={item.id}
                        className="pt-1 first:pt-0 flex items-center justify-between"
                      >
                        <span className="font-semibold text-foreground">{item.itemName}</span>
                        <span className="font-bold text-foreground">×{item.borrowedQuantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground font-mono">{loan.id}</span>
                    <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                      <Link to={`/app/loans/${loan.id}`}>Loan Details / Extension</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: WAITING */}
      {waiting.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Waiting for Review ({waiting.length})
            </h2>
          </div>

          <div className="space-y-3">
            {waiting.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs space-y-3.5"
              >
                {/* Visual Status Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      Under Review by Logistics Team
                    </span>
                    <span className="text-muted-foreground font-normal">
                      Sent {formatDate(req.createdAt)}
                    </span>
                  </div>

                  {/* 3-Step Visual Progress Bar */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                        1. Sent
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-amber-500/40 animate-pulse" />
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                        2. In Review
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-muted" />
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        3. Pickup
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-border/60 bg-background/80 rounded-xl p-3 border border-border/60 text-xs space-y-1.5">
                  {req.items.map((item) => (
                    <div
                      key={item.id}
                      className="pt-1.5 first:pt-0 flex items-center justify-between"
                    >
                      <span className="text-foreground font-medium">{item.itemName}</span>
                      <span className="font-bold text-foreground">×{item.requestedQuantity}</span>
                    </div>
                  ))}
                </div>

                {req.borrowerPickupAvailability && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border/40">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>
                      Your suggested availability:{" "}
                      <strong className="text-foreground">{req.borrowerPickupAvailability}</strong>
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link to={`/app/requests/${req.id}`}>View Details</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={cancelRequestMutation.isPending}
                    onClick={() => {
                      if (window.confirm("Cancel this equipment request?")) {
                        cancelRequestMutation.mutate({
                          requestId: req.id,
                          reason: "Cancelled by student",
                        });
                      }
                    }}
                    className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Request</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: PAST */}
      {pastLoans.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Past Equipment
          </h2>

          <div className="space-y-2">
            {pastLoans.slice(0, 5).map((loan) => (
              <div
                key={loan.id}
                className="p-3 rounded-xl border border-border/70 bg-card/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate">
                    {loan.items.map((i) => `${i.itemName} ×${i.borrowedQuantity}`).join(", ")}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Returned on {formatDate(loan.updatedAt)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleRequestAgain(
                      loan.items.map((i) => ({ itemId: i.itemId, quantity: i.borrowedQuantity }))
                    )
                  }
                  className="text-xs h-8 px-2.5 gap-1 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Request again</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
