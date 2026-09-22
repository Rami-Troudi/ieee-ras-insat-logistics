import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import { useBoardLoanDetail, useConfirmReturn, useReviewExtension } from "../hooks/useBoardLoans";
import { useBoardUserDetail } from "@/features/users/board/hooks/useBoardUsers";
import {
  ArrowLeft,
  User,
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { getLoanDisplayStatus, AssetCondition } from "@/types";

export const BoardLoanDetailPage: React.FC = () => {
  const { loanId } = useParams<{ loanId: string }>();
  const { currentPersona } = useSession();

  const { data: loan, isLoading } = useBoardLoanDetail(loanId || "");
  const { data: borrower } = useBoardUserDetail(loan?.userId || "");

  const returnMutation = useConfirmReturn();
  const extensionMutation = useReviewExtension();

  // Return form state per line item or overall
  const [returnCondition, setReturnCondition] = useState<AssetCondition>("GOOD");
  const [conditionNotes, setConditionNotes] = useState("");

  // Extension decision state
  const [extensionDecisionNotes, setExtensionDecisionNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isLoading || !loan) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading loan dossier..." />
      </PageContainer>
    );
  }

  const isActive = loan.lifecycleStatus === "ACTIVE";
  const pendingExtension = (loan.extensionRequests || []).find((e) => e.status === "PENDING");
  const hasExtensionPending = loan.extensionStatus === "PENDING" || Boolean(pendingExtension);
  const isOverdue = loan.dueStatus === "OVERDUE";
  const pendingReturn = (loan.returnRequests || []).find((r) => r.status === "PENDING");

  const totalBorrowed = (loan.items || []).reduce((acc, i) => acc + (i.borrowedQuantity || 0), 0);
  const totalReturned = (loan.items || []).reduce((acc, i) => acc + (i.returnedQuantity || 0), 0);
  const remainingQuantity = totalBorrowed - totalReturned;

  const handleReturnSubmit = async () => {
    try {
      setErrorMessage(null);
      await returnMutation.mutateAsync({
        payload: {
          loanId: loan.id,
          returnRequestId: pendingReturn?.id,
          items: (loan.items || []).map((item) => ({
            lineItemId: item.id,
            returnedQuantity: item.borrowedQuantity - (item.returnedQuantity || 0),
            condition: returnCondition,
            notes: conditionNotes,
          })),
          inspectionNotes: conditionNotes,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage(
        returnCondition === "DAMAGED" || returnCondition === "LOST"
          ? `Return confirmed with condition ${returnCondition}. Disciplinary incident created automatically.`
          : "Physical return successfully confirmed and stock restored to inventory."
      );
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to confirm return");
    }
  };

  const handleExtensionDecision = async (approved: boolean) => {
    if (!pendingExtension) return;

    try {
      setErrorMessage(null);
      await extensionMutation.mutateAsync({
        payload: {
          loanId: loan.id,
          extensionRequestId: pendingExtension.id,
          decision: approved ? "APPROVED" : "REJECTED",
          decisionNotes:
            extensionDecisionNotes || (approved ? "Extension granted" : "Extension rejected"),
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage(
        approved
          ? `Extension approved to ${new Date(pendingExtension.proposedReturnDate).toLocaleDateString()}. Due date updated.`
          : "Extension request rejected."
      );
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to decide extension");
    }
  };

  return (
    <PageContainer maxWidth="wide">
      <div className="pb-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Link to="/board/loans">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Loans Queue</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Loan ${loan.id}`}
        description={`Borrowed by ${loan.userName} (${loan.userEmail})`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={getLoanDisplayStatus(loan)} />
          </div>
        }
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="destructive" title="Operation Failed" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="success" title="Success" description={successMessage} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier & Loan Timeline */}
        <div className="space-y-4">
          {/* Borrower Dossier Card */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <User className="w-4 h-4 text-primary" />
              <span>Borrower Dossier</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Borrower</span>
                <span className="font-semibold text-foreground">{loan.userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Clearance Level</span>
                <span className="font-bold text-primary">
                  Level {borrower?.clearance || borrower?.clearanceLevel || "I"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Affiliation</span>
                <span className="font-medium text-foreground">
                  {borrower?.affiliation ||
                    borrower?.verifiedAffiliation ||
                    borrower?.claimedAffiliation ||
                    "IEEE"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Strikes</span>
                <span
                  className={`font-bold ${
                    (borrower?.strikesCount || borrower?.strikeCount || 0) > 0
                      ? "text-destructive"
                      : "text-emerald-600"
                  }`}
                >
                  {borrower?.strikesCount || borrower?.strikeCount || 0} Strike(s)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Member ID</span>
                <span className="font-mono text-muted-foreground">{loan.userId}</span>
              </div>
            </div>
          </div>

          {/* Loan Metadata Card */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <Clock className="w-4 h-4 text-secondary" />
              <span>Loan Chronology</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Total Units</span>
                <span className="font-bold text-foreground">{totalBorrowed} unit(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Returned Units</span>
                <span className="font-semibold text-emerald-600">{totalReturned} unit(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Remaining Custody</span>
                <span className="font-bold text-foreground">{remainingQuantity} unit(s)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Checked Out</span>
                <span className="text-foreground">
                  {new Date(loan.borrowDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Official Due Date</span>
                <span className={`font-bold ${isOverdue ? "text-destructive" : "text-foreground"}`}>
                  {new Date(loan.dueDate).toLocaleDateString()}
                  {isOverdue && " (OVERDUE)"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Handed Over By</span>
                <span className="font-mono text-muted-foreground">
                  {loan.handedOverBy || "Board"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Line Items, Extensions & Intake */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Line Items Table */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Package className="w-4 h-4 text-primary" />
              <span>Custodial Equipment Line Items ({(loan.items || []).length})</span>
            </h3>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground border-b border-border font-semibold text-[11px] uppercase">
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Borrowed</th>
                    <th className="py-2.5 px-3">Returned</th>
                    <th className="py-2.5 px-3">Condition Handover</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(loan.items || []).map((item) => (
                    <tr key={item.id} className="hover:bg-accent/30">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground">{item.itemName}</div>
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                          <div className="text-[10px] font-mono text-muted-foreground">
                            SN: {item.serialNumbers.join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-primary">Class {item.equipmentClass}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">
                        {item.borrowedQuantity}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600">
                        {item.returnedQuantity || 0}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.conditionOnHandover}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Extension Request Review Section */}
          {hasExtensionPending && isActive && pendingExtension && (
            <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Pending Time Extension Request</span>
                </h3>
                <span className="text-xs font-bold text-primary">Requires Board Decision</span>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proposed New Due Date:</span>
                  <span className="font-bold text-foreground">
                    {new Date(pendingExtension.proposedReturnDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason Given:</span>
                  <span className="text-foreground">{pendingExtension.reason}</span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <label className="text-muted-foreground block">Decision Notes / Rationale:</label>
                <Input
                  placeholder="Optional review notes for borrower..."
                  value={extensionDecisionNotes}
                  onChange={(e) => setExtensionDecisionNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExtensionDecision(false)}
                  disabled={extensionMutation.isPending}
                  className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  Reject Extension
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleExtensionDecision(true)}
                  disabled={extensionMutation.isPending}
                  className="text-xs font-semibold"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>Approve Extension</span>
                </Button>
              </div>
            </div>
          )}

          {/* Physical Return Inspection Section */}
          {isActive ? (
            <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-secondary" />
                    <span>Physical Return & Condition Inspection</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Inspect physical hardware at the board cabinet, assess working condition, and
                    restore stock.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-foreground block mb-1 text-xs">
                    Physical Condition Assessment:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {(["GOOD", "MINOR_ISSUE", "DAMAGED", "LOST"] as AssetCondition[]).map(
                      (cond) => (
                        <Button
                          key={cond}
                          type="button"
                          size="sm"
                          variant={returnCondition === cond ? "default" : "outline"}
                          onClick={() => setReturnCondition(cond)}
                          className={`h-8 text-xs font-medium ${
                            cond === "DAMAGED" || cond === "LOST"
                              ? returnCondition === cond
                                ? "bg-destructive text-destructive-foreground"
                                : "text-destructive border-destructive/30 hover:bg-destructive/10"
                              : ""
                          }`}
                        >
                          {cond}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {(returnCondition === "DAMAGED" || returnCondition === "LOST") && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Automatic Incident Escalation</span>
                    </div>
                    <p>
                      Registering this return as <strong>{returnCondition}</strong> will
                      automatically create an Incident Dossier and flag the borrower for
                      disciplinary review and replacement compensation assessment.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Inspection Notes / Observations:
                  </label>
                  <Input
                    placeholder="Details on cosmetic state, functional tests performed, or damage notes..."
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleReturnSubmit}
                    disabled={returnMutation.isPending}
                    className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Intake & Update Inventory</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-border bg-card text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">Loan Closed & Returned</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                This loan was closed. All equipment units have been received and reconciled in the
                inventory ledger.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
