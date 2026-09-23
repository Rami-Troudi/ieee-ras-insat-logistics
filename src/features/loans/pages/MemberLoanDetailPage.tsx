import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/FeedbackStates";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { useLoanDetail, useRequestExtension } from "../hooks/useLoans";
import { useSession } from "@/hooks/useSession";
import { formatDate, formatDateTime, isDatePast } from "@/lib/dates";
import { ArrowLeft, Calendar, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { getLoanDisplayStatus } from "@/types";

const extensionSchema = z.object({
  proposedReturnDate: z.string().min(1, "Please choose a proposed return date"),
  reason: z.string().min(10, "Please provide an explanation (at least 10 characters)"),
});

type ExtensionFormData = z.infer<typeof extensionSchema>;

export const MemberLoanDetailPage: React.FC = () => {
  const { loanId = "" } = useParams<{ loanId: string }>();
  const { currentPersona } = useSession();

  const { data: loan, isLoading, error, refetch } = useLoanDetail(loanId, currentPersona.id);
  const extensionMutation = useRequestExtension(currentPersona.id);

  // Extension Modal State
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);

  const {
    register: registerExt,
    handleSubmit: handleSubmitExt,
    reset: resetExt,
    formState: { errors: errorsExt },
  } = useForm<ExtensionFormData>({
    resolver: zodResolver(extensionSchema),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading loan record & serial numbers..." />
      </PageContainer>
    );
  }

  if (error || !loan) {
    return (
      <PageContainer>
        <ErrorState
          title="Loan Record Not Found or Unauthorized"
          description="The requested loan record does not exist in your active borrowing history or you lack authorization to inspect it."
        />
        <div className="mt-4">
          <Button asChild variant="outline" className="min-h-[44px]">
            <Link to="/app/activity" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Activity</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isOverdue =
    loan.lifecycleStatus === "ACTIVE" && (loan.dueStatus === "OVERDUE" || isDatePast(loan.dueDate));
  const isClosed = loan.lifecycleStatus === "CLOSED";
  const isReturnPending = loan.returnStatus === "PENDING_CONFIRMATION";
  const displayStatus = getLoanDisplayStatus(loan);

  // Open Return Dialog & Init quantities according to strict formula:
  // maxReturnable = borrowedQuantity - returnedQuantity - (pending returnRequestedQuantity)
  const handleOpenExtension = () => {
    const d = new Date(loan.dueDate);
    d.setDate(d.getDate() + 7);
    resetExt({
      proposedReturnDate: d.toISOString().split("T")[0],
      reason: "",
    });
    setIsExtensionModalOpen(true);
  };

  const onExtensionSubmit = async (data: ExtensionFormData) => {
    try {
      await extensionMutation.mutateAsync({
        loanId: loan.id,
        proposedReturnDate: data.proposedReturnDate,
        reason: data.reason.trim(),
      });
      setIsExtensionModalOpen(false);
      refetch();
    } catch (err: unknown) {
      console.error("Extension error:", err);
    }
  };

  return (
    <PageContainer>
      {/* Header Navigation */}
      <div className="flex items-center justify-between pb-2">
        <Link
          to="/app/activity"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Activity</span>
        </Link>

        {!isClosed && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenExtension}
              disabled={loan.extensionStatus === "PENDING"}
              className="text-xs gap-1.5 min-h-[44px]"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {loan.extensionStatus === "PENDING" ? "Extension Pending" : "Request Extension"}
              </span>
            </Button>
          </div>
        )}

        {isReturnPending && (
          <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return Confirmation Pending</span>
          </div>
        )}
      </div>

      {/* Main Loan Summary Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-bold text-foreground">{loan.id}</span>
              {loan.projectName && (
                <span className="text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                  {loan.projectName}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">Equipment Loan Custody Record</h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={displayStatus} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
          <div>
            <span className="text-muted-foreground block">Borrowed On</span>
            <span className="font-semibold text-foreground mt-0.5 block">
              {formatDate(loan.borrowDate)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Official Due Date</span>
            <span
              className={`font-bold mt-0.5 block ${isOverdue ? "text-destructive" : "text-foreground"}`}
            >
              {formatDate(loan.dueDate)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block">Handed Over By</span>
            <span className="font-semibold text-foreground mt-0.5 block">{loan.handedOverBy}</span>
          </div>

          <div>
            <span className="text-muted-foreground block">Extension Status</span>
            <span className="font-semibold text-foreground mt-0.5 block">
              {loan.extensionStatus}
            </span>
          </div>
        </div>

        {loan.notes && (
          <div className="pt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Handover Notes:</span> {loan.notes}
          </div>
        )}
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <PolicyNotice
          variant="restricted"
          title="Equipment Overdue"
          description={`This equipment was scheduled to be returned on ${formatDate(loan.dueDate)}. Items overdue by 2 weeks result in strike recommendations.`}
        />
      )}

      {/* Extension Pending Advisory */}
      {loan.extensionStatus === "PENDING" && (
        <PolicyNotice
          variant="info"
          title="Due Date Extension Requested"
          description={`You requested an extension until ${formatDate(loan.extensionRequests[0]?.proposedReturnDate)}. The Logistics Board has not approved it yet; your official due date remains ${formatDate(loan.dueDate)}.`}
        />
      )}

      {/* Physical In-Person Return Desk Information */}
      {!isClosed && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs space-y-2 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-foreground text-sm">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span>How to Return Equipment</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Return handling is done <strong>in-person</strong>. Simply bring your equipment back to
            the IEEE RAS desk at the robotics lab. The logistics manager will inspect the gear and
            immediately check it back into the inventory system.
          </p>
        </div>
      )}

      {/* Line Items & Serial Numbers */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground">Equipment Units in Custody</h2>

        <div className="divide-y divide-border">
          {loan.items.map((line) => {
            const alreadyPending = line.returnRequestedQuantity || 0;
            const inCustody = line.borrowedQuantity - line.returnedQuantity;
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
                  {line.serialNumbers && line.serialNumbers.length > 0 && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span>Serial Numbers:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {line.serialNumbers.join(", ")}
                      </span>
                    </div>
                  )}
                  <span className="text-muted-foreground block">
                    Condition on handover: <strong>{line.conditionOnHandover}</strong>
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold text-foreground">
                    Borrowed: {line.borrowedQuantity} | Confirmed Returned: {line.returnedQuantity}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Still in custody: <strong>{inCustody} unit(s)</strong>
                  </div>
                  {alreadyPending > 0 && (
                    <div className="text-amber-600 font-medium text-[11px]">
                      {alreadyPending} unit(s) awaiting physical confirmation
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extension Requests Ledger */}
      {loan.extensionRequests.length > 0 && (
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span>Extension Requests History</span>
          </h2>
          <div className="divide-y divide-border">
            {loan.extensionRequests.map((ext) => (
              <div key={ext.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block">
                    Requested on {formatDate(ext.requestedDate)} for proposed return date:{" "}
                    <strong>{formatDate(ext.proposedReturnDate)}</strong>
                  </span>
                  <span className="text-foreground italic">"{ext.reason}"</span>
                </div>
                <StatusBadge
                  status={
                    ext.status === "APPROVED"
                      ? "SUCCESS"
                      : ext.status === "REJECTED"
                        ? "ERROR"
                        : "WARNING"
                  }
                  label={ext.status}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Return History */}
      {loan.returnRequests.length > 0 && (
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Return Request Submissions</span>
          </h2>
          <div className="divide-y divide-border">
            {loan.returnRequests.map((ret) => (
              <div key={ret.id} className="py-2.5 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Submitted on {formatDateTime(ret.requestedAt)}
                  </span>
                  <StatusBadge
                    status={ret.status === "CONFIRMED" ? "SUCCESS" : "WARNING"}
                    label={
                      ret.status === "CONFIRMED"
                        ? "Confirmed by Board"
                        : "Awaiting Physical Inspection"
                    }
                  />
                </div>
                {ret.confirmedBy && (
                  <span className="text-emerald-600 block text-[11px] font-medium">
                    Verified and restocked by {ret.confirmedBy} on{" "}
                    {formatDateTime(ret.confirmedAt!)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extension Modal with RHF + Zod */}
      <ResponsiveDialog
        open={isExtensionModalOpen}
        onOpenChange={setIsExtensionModalOpen}
        title="Request Due Date Extension"
        description="Submit a justification to extend the return deadline of this equipment."
      >
        <form onSubmit={handleSubmitExt(onExtensionSubmit)} className="space-y-4 pt-2">
          {extensionMutation.isError && (
            <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {extensionMutation.error instanceof Error
                  ? extensionMutation.error.message
                  : "Failed to submit extension"}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Proposed Return Date *
            </label>
            <input
              type="date"
              {...registerExt("proposedReturnDate")}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            />
            {errorsExt.proposedReturnDate && (
              <span className="text-xs text-destructive block">
                {errorsExt.proposedReturnDate.message}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Reason & Project Justification *
            </label>
            <textarea
              {...registerExt("reason")}
              rows={3}
              placeholder="Why is an extension needed? (e.g. testing postponed, troubleshooting motor driver)"
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errorsExt.reason && (
              <span className="text-xs text-destructive block">{errorsExt.reason.message}</span>
            )}
          </div>

          <div className="p-3 rounded bg-muted/60 text-[11px] text-muted-foreground">
            <strong>Rule:</strong> Official loan due date does not change until a Logistics
            Custodian approves this request.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExtensionModalOpen(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={extensionMutation.isPending} className="min-h-[44px]">
              {extensionMutation.isPending ? "Submitting..." : "Submit Extension Request"}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>
    </PageContainer>
  );
};
