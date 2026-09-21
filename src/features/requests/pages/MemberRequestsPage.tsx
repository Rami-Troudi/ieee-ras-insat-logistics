import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState, ErrorState } from "@/components/shared/FeedbackStates";
import { Button } from "@/components/ui/button";
import { useUserRequests } from "../hooks/useRequests";
import { useSession } from "@/hooks/useSession";
import { formatDate } from "@/lib/dates";
import { ArrowRight, Clock, Plus, AlertCircle } from "lucide-react";
import { RequestStatus } from "@/types";

export const MemberRequestsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: requests, isLoading, error, refetch } = useUserRequests(currentPersona.id);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filterOptions: { value: string; label: string }[] = [
    { value: "ALL", label: "All Requests" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "PARTIALLY_APPROVED", label: "Partially Approved" },
    { value: "HANDED_OVER", label: "Handed Over" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const filteredRequests = (requests || []).filter((req) => {
    if (statusFilter === "ALL") return true;
    return req.status === statusFilter;
  });

  return (
    <PageContainer>
      <PageHeader
        title="My Borrow Requests"
        description="Track the real-time review status of equipment requests, line-item approvals, and collection deadlines."
        action={
          <Button asChild variant="default" size="default" className="min-h-[44px]">
            <Link to="/app/inventory" className="gap-2">
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </Link>
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(opt.value)}
            className="text-xs h-8 min-h-[36px]"
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState message="Loading your borrow requests..." />
      ) : error ? (
        <ErrorState
          title="Failed to Load Requests"
          description="A datastore error occurred while retrieving your borrow requests."
          onRetry={() => refetch()}
        />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title="No Requests Found"
          description={
            statusFilter !== "ALL"
              ? `You have no requests with status "${statusFilter}".`
              : "You have not submitted any equipment borrow requests yet."
          }
          actionLabel="Browse Equipment"
          onAction={() => window.location.assign("/app/inventory")}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const hasPickupWindow =
              (req.status === "APPROVED" || req.status === "PARTIALLY_APPROVED") &&
              req.pickupDeadline;

            return (
              <div
                key={req.id}
                className="p-5 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-foreground">{req.id}</span>
                      {req.projectName && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                          {req.projectName}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Submitted {formatDate(req.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">
                      {req.purpose}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status as RequestStatus} />
                  </div>
                </div>

                {/* Line Item Summary Preview */}
                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1.5">
                  <span className="font-semibold text-muted-foreground block text-[11px] uppercase tracking-wider">
                    Equipment Requested ({req.items.reduce((s, i) => s + i.requestedQuantity, 0)}{" "}
                    Units)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {req.items.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background border border-border text-foreground"
                      >
                        <span className="font-medium">
                          {item.requestedQuantity}x {item.itemName}
                        </span>
                        {item.status !== "PENDING" && (
                          <span
                            className={`text-[10px] font-bold px-1 rounded ${
                              item.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600"
                                : item.status === "REJECTED"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.status}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 48-Hour Pickup Alert Banner */}
                {hasPickupWindow && (
                  <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 flex items-start gap-2.5 text-xs text-secondary-foreground">
                    <Clock className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">
                        Collection Window Active: Pickup before{" "}
                        {formatDate(req.pickupDeadline!, "dd MMM yyyy, HH:mm")}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Equipment is reserved at the RAS Workshop desk. Uncollected items are
                        released automatically after 48 hours.
                      </span>
                    </div>
                  </div>
                )}

                {/* Rejection / Partial Notes */}
                {req.decisionNotes && (
                  <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>
                      <strong>Custodian Notes:</strong> {req.decisionNotes}
                    </span>
                  </div>
                )}

                {/* Card Action footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">
                    Expected Return: <strong>{formatDate(req.expectedReturnDate)}</strong>
                  </span>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs min-h-[44px]"
                  >
                    <Link to={`/app/requests/${req.id}`}>
                      <span>View Request Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
