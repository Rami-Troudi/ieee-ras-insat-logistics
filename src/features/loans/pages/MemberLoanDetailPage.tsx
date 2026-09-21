import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/FeedbackStates";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { useLoanDetail, useRequestExtension, useRequestReturn } from "../hooks/useLoans";
import { useSession } from "@/hooks/useSession";
import { formatDate, formatDateTime, isDatePast } from "@/lib/dates";
import { ArrowLeft, Calendar, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { LoanStatus } from "@/types";

export const MemberLoanDetailPage: React.FC = () => {
  const { loanId = "" } = useParams<{ loanId: string }>();
  const { currentPersona } = useSession();

  const { data: loan, isLoading, error, refetch } = useLoanDetail(loanId);
  const extensionMutation = useRequestExtension(currentPersona.id);
  const returnMutation = useRequestReturn(currentPersona.id);

  // Extension Modal State
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [extensionError, setExtensionError] = useState<string | null>(null);

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnItems, setReturnItems] = useState<
    Record<string, { quantity: number; condition: string }>
  >({});
  const [memberNotes, setMemberNotes] = useState("");
  const [returnError, setReturnError] = useState<string | null>(null);

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
          title="Loan Record Not Found"
          description="The requested loan identifier could not be retrieved from custody records."
        />
        <div className="mt-4">
          <Button asChild variant="outline" className="min-h-[44px]">
            <Link to="/app/loans" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Active Loans</span>
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isOverdue =
    isDatePast(loan.dueDate) && loan.status !== "CLOSED" && loan.status !== "RETURNED";
  const isClosed = loan.status === "CLOSED" || loan.status === "RETURNED";

  // Open Return Dialog & Init quantities
  const handleOpenReturn = () => {
    const init: Record<string, { quantity: number; condition: string }> = {};
    loan.items.forEach((item) => {
      const remaining = item.borrowedQuantity - item.returnedQuantity;
      init[item.id] = {
        quantity: remaining,
        condition: "Good condition, no visible damage",
      };
    });
    setReturnItems(init);
    setMemberNotes("");
    setReturnError(null);
    setIsReturnModalOpen(true);
  };

  const handleOpenExtension = () => {
    const d = new Date(loan.dueDate);
    d.setDate(d.getDate() + 7);
    setProposedDate(d.toISOString().split("T")[0]);
    setExtensionReason("");
    setExtensionError(null);
    setIsExtensionModalOpen(true);
  };

  const submitExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    setExtensionError(null);
    if (!proposedDate) {
      setExtensionError("Please specify a proposed return date.");
      return;
    }
    if (!extensionReason.trim() || extensionReason.trim().length < 10) {
      setExtensionError("Please provide an explanation (at least 10 characters).");
      return;
    }

    try {
      await extensionMutation.mutateAsync({
        loanId: loan.id,
        proposedReturnDate: proposedDate,
        reason: extensionReason.trim(),
      });
      setIsExtensionModalOpen(false);
      refetch();
    } catch (err: unknown) {
      setExtensionError(err instanceof Error ? err.message : "Failed to submit extension");
    }
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setReturnError(null);

    const itemsToReturn = Object.entries(returnItems)
      .filter(([, val]) => val.quantity > 0)
      .map(([lineItemId, val]) => ({
        lineItemId,
        quantity: val.quantity,
        conditionReport: val.condition,
      }));

    if (itemsToReturn.length === 0) {
      setReturnError("Please select at least 1 unit to return.");
      return;
    }

    try {
      await returnMutation.mutateAsync({
        loanId: loan.id,
        items: itemsToReturn,
        memberNotes: memberNotes.trim() || undefined,
      });
      setIsReturnModalOpen(false);
      refetch();
    } catch (err: unknown) {
      setReturnError(err instanceof Error ? err.message : "Failed to submit return declaration");
    }
  };

  return (
    <PageContainer>
      {/* Header Navigation */}
      <div className="flex items-center justify-between pb-2">
        <Link
          to="/app/loans"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Loans</span>
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

            <Button
              variant="default"
              size="sm"
              onClick={handleOpenReturn}
              className="text-xs gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Initiate Return</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Loan Info Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-bold text-foreground">{loan.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                Ref: {loan.requestId}
              </span>
              {loan.projectName && (
                <span className="text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                  {loan.projectName}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">Equipment Loan Custody Record</h1>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={isOverdue ? "OVERDUE" : (loan.status as LoanStatus)} />
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
            <span className="text-muted-foreground block">Authoritative Due Date</span>
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
          description={`This equipment was scheduled to be returned on ${formatDate(loan.dueDate)}. Failure to return equipment results in borrowing strikes and account restriction.`}
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

      {/* Return Pending Policy Warning */}
      {loan.status === "RETURN_REQUESTED" && (
        <PolicyNotice
          variant="warning"
          title="Return Declaration Awaiting Physical Custodian Confirmation"
          description="You have submitted a return request. Stock quantities are NOT restored until the physical equipment has been inspected and confirmed by the Logistics Custodian at the RAS Workshop."
        />
      )}

      {/* Line Items & Serial Numbers */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground">Equipment Units in Custody</h2>

        <div className="divide-y divide-border">
          {loan.items.map((line) => {
            const remaining = line.borrowedQuantity - line.returnedQuantity;
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
                    Borrowed: {line.borrowedQuantity} | Returned: {line.returnedQuantity}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    Outstanding in custody: <strong>{remaining} unit(s)</strong>
                  </div>
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

      {/* Extension Modal */}
      <ResponsiveDialog
        open={isExtensionModalOpen}
        onOpenChange={setIsExtensionModalOpen}
        title="Request Due Date Extension"
        description="Submit a justification to extend the return deadline of this equipment."
      >
        <form onSubmit={submitExtension} className="space-y-4 pt-2">
          {extensionError && (
            <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{extensionError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Proposed Return Date *
            </label>
            <input
              type="date"
              value={proposedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setProposedDate(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Reason & Project Justification *
            </label>
            <textarea
              value={extensionReason}
              onChange={(e) => setExtensionReason(e.target.value)}
              rows={3}
              required
              placeholder="Why is an extension needed? (e.g. testing postponed, troubleshooting motor driver)"
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
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

      {/* Partial Return Modal */}
      <ResponsiveDialog
        open={isReturnModalOpen}
        onOpenChange={setIsReturnModalOpen}
        title="Initiate Equipment Return"
        description="Select line items and quantities you are bringing back to the RAS Workshop."
      >
        <form onSubmit={submitReturn} className="space-y-4 pt-2">
          {returnError && (
            <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{returnError}</span>
            </div>
          )}

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {loan.items.map((item) => {
              const maxUnits = item.borrowedQuantity - item.returnedQuantity;
              if (maxUnits <= 0) return null;
              const currentVal = returnItems[item.id] || { quantity: maxUnits, condition: "Good" };

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-border bg-muted/30 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{item.itemName}</span>
                    <span className="text-muted-foreground">Max: {maxUnits}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-muted-foreground">Quantity to return:</label>
                    <input
                      type="number"
                      min={0}
                      max={maxUnits}
                      value={currentVal.quantity}
                      onChange={(e) =>
                        setReturnItems({
                          ...returnItems,
                          [item.id]: {
                            ...currentVal,
                            quantity: Math.min(
                              maxUnits,
                              Math.max(0, parseInt(e.target.value) || 0)
                            ),
                          },
                        })
                      }
                      className="w-20 rounded border border-input bg-background px-2 py-1 text-xs text-center min-h-[36px]"
                    />
                  </div>

                  <input
                    type="text"
                    value={currentVal.condition}
                    placeholder="Condition note (e.g. clean, no defects)"
                    onChange={(e) =>
                      setReturnItems({
                        ...returnItems,
                        [item.id]: { ...currentVal, condition: e.target.value },
                      })
                    }
                    className="w-full rounded border border-input bg-background px-2 py-1 text-xs min-h-[36px]"
                  />
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Additional Member Notes (Optional)
            </label>
            <textarea
              value={memberNotes}
              onChange={(e) => setMemberNotes(e.target.value)}
              rows={2}
              placeholder="Any component behavior or parts replaced..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="p-3 rounded bg-muted/60 text-[11px] text-muted-foreground">
            <strong>Mandatory Notice:</strong> Submitting this declaration does NOT immediately
            restore workshop stock. An in-person inspection and physical scan by a Logistics
            Custodian is required.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReturnModalOpen(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={returnMutation.isPending} className="min-h-[44px]">
              {returnMutation.isPending ? "Submitting..." : "Declare Return"}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>
    </PageContainer>
  );
};
