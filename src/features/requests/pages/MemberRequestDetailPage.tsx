import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/FeedbackStates";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { useRequestDetail, useCancelRequest } from "../hooks/useRequests";
import { useSession } from "@/hooks/useSession";
import { formatDate, formatDateTime, calculatePickupWindow } from "@/lib/dates";
import { ArrowLeft, Clock, XCircle, CheckCircle2, User, Calendar, AlertCircle } from "lucide-react";
import { RequestStatus } from "@/types";

export const MemberRequestDetailPage: React.FC = () => {
  const { requestId = "" } = useParams<{ requestId: string }>();
  const { currentPersona } = useSession();

  const { data: request, isLoading, error, refetch } = useRequestDetail(requestId);
  const cancelMutation = useCancelRequest(currentPersona.id);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading request details & line approvals..." />
      </PageContainer>
    );
  }

  if (error || !request) {
    return (
      <PageContainer>
        <ErrorState
          title="Request Not Found"
          description="The requested borrow petition does not exist in the logistics records."
        />
        <div className="mt-4">
          <Button asChild variant="outline" className="min-h-[44px]">
            <Link to="/app/requests" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Requests</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isPending = request.status === "PENDING";
  const pickupWindow = request.pickupDeadline
    ? calculatePickupWindow(request.reviewedAt || request.updatedAt)
    : null;

  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        requestId: request.id,
        reason: cancelReason.trim() || undefined,
      });
      setIsCancelDialogOpen(false);
      refetch();
    } catch (err) {
      console.error("Cancellation error:", err);
    }
  };

  return (
    <PageContainer>
      {/* Navigation Header */}
      <div className="flex items-center justify-between pb-2">
        <Link
          to="/app/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Requests List</span>
        </Link>

        {isPending && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
            className="text-xs gap-1.5 min-h-[44px]"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel Request</span>
          </Button>
        )}
      </div>

      {/* Main Request Summary Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-bold text-foreground">{request.id}</span>
              {request.projectName && (
                <span className="text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                  {request.projectName}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">Borrow Request Summary</h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={request.status as RequestStatus} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block">Submitted By</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>
                {request.userName} (Level {request.userClearance})
              </span>
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Submission Date</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{formatDateTime(request.createdAt)}</span>
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Expected Return Date</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>{formatDate(request.expectedReturnDate)}</span>
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Review Custodian</span>
            <span className="font-semibold text-foreground mt-0.5 block">
              {request.reviewedBy || "Pending Review"}
            </span>
          </div>
        </div>

        {/* Purpose */}
        <div className="pt-2 text-xs">
          <span className="font-semibold text-muted-foreground block mb-1">
            Purpose & Technical Justification:
          </span>
          <p className="p-3 rounded-lg bg-muted/40 border border-border/60 text-foreground leading-relaxed">
            {request.purpose}
          </p>
        </div>
      </div>

      {/* 48h Collection Window Banner */}
      {pickupWindow &&
        (request.status === "APPROVED" || request.status === "PARTIALLY_APPROVED") && (
          <PolicyNotice
            variant={
              pickupWindow.isExpired
                ? "restricted"
                : pickupWindow.status === "URGENT"
                  ? "warning"
                  : "info"
            }
            title={
              pickupWindow.isExpired
                ? "Collection Window Expired"
                : `48-Hour Collection Window: ${pickupWindow.hoursRemaining} Hours Remaining`
            }
            description={
              pickupWindow.isExpired
                ? "The 48-hour reservation window has elapsed. Uncollected items have been released back to general inventory."
                : `Your equipment is staged at the RAS Logistics desk until ${formatDateTime(pickupWindow.deadline)}. Present your student card to finalize handover.`
            }
          />
        )}

      {/* Line Item Granular Approval Breakdown */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground">Line Item Decision Breakdown</h2>

        <div className="divide-y divide-border">
          {request.items.map((line) => {
            return (
              <div
                key={line.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                      Class {line.equipmentClass}
                    </span>
                    <span className="text-muted-foreground">{line.category}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground block">{line.itemName}</span>
                  {line.rejectionReason && (
                    <span className="text-destructive font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Rejection note: {line.rejectionReason}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-muted-foreground block">
                      Requested: {line.requestedQuantity}
                    </span>
                    {line.approvedQuantity !== undefined && (
                      <span className="font-bold text-foreground block">
                        Approved: {line.approvedQuantity}
                      </span>
                    )}
                  </div>

                  <StatusBadge
                    status={
                      line.status === "APPROVED"
                        ? "SUCCESS"
                        : line.status === "REJECTED"
                          ? "ERROR"
                          : line.status === "FULFILLED"
                            ? "INFO"
                            : "WARNING"
                    }
                    label={line.status}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custodian Review Notes */}
      {request.decisionNotes && (
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Official Custodian Review Notes</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{request.decisionNotes}</p>
        </div>
      )}

      {/* Audit Timeline */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span>Request Activity Timeline</span>
        </h2>

        <div className="space-y-4 relative pl-4 border-l-2 border-border/80 ml-2">
          {request.timeline.map((event, idx) => (
            <div key={idx} className="relative space-y-1">
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground">{event.status}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDateTime(event.timestamp)}
                </span>
                {event.actor && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                    {event.actor}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{event.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Member Cancellation Dialog */}
      <ConfirmationDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Borrow Request?"
        description="Are you sure you want to cancel this pending borrow request? Once cancelled, the request cannot be reopened."
        confirmLabel={cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
        variant="destructive"
      >
        <div className="pt-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
            Reason for cancellation (optional):
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={2}
            placeholder="No longer needed, project scope adjusted..."
            className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </ConfirmationDialog>
    </PageContainer>
  );
};
