import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import {
  useBoardRequestDetail,
  useReviewBorrowRequest,
  useRejectEntireRequest,
  useConfirmHandover,
} from "../hooks/useBoardRequests";
import { useBoardUserDetail } from "@/features/users/board/hooks/useBoardUsers";
import { useBoardInventory } from "@/features/inventory/board/hooks/useBoardInventory";
import {
  ArrowLeft,
  User,
  ShieldAlert,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderGit2,
  Send,
  Ban,
} from "lucide-react";
import { getRequestDisplayStatus, RequestLineStatus } from "@/types";

export const BoardRequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { currentPersona } = useSession();

  const { data: request, isLoading } = useBoardRequestDetail(requestId || "");
  const { data: borrower } = useBoardUserDetail(request?.userId || "");
  const { data: inventory = [] } = useBoardInventory();

  const reviewMutation = useReviewBorrowRequest();
  const rejectMutation = useRejectEntireRequest();
  const handoverMutation = useConfirmHandover();

  // State for line item review decisions (keyed by line item ID)
  const [lineDecisions, setLineDecisions] = useState<
    Record<
      string,
      {
        status: RequestLineStatus;
        approvedQuantity: number;
        reason?: string;
      }
    >
  >({});
  const [overallNotes, setOverallNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for physical handover dialog
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [assignedSerials, setAssignedSerials] = useState<Record<string, string>>({});
  const [handoverNotes, setHandoverNotes] = useState("");

  // Initialize line decisions once request is loaded
  useEffect(() => {
    if (request) {
      setLineDecisions((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        const initial: Record<
          string,
          { status: RequestLineStatus; approvedQuantity: number; reason?: string }
        > = {};
        (request.items || []).forEach((item) => {
          initial[item.id] = {
            status: item.status || "APPROVED",
            approvedQuantity:
              item.approvedQuantity !== undefined ? item.approvedQuantity : item.requestedQuantity,
            reason: item.rejectionReason || "",
          };
        });
        return initial;
      });
    }
  }, [request]);

  if (isLoading || !request) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading request dossier..." />
      </PageContainer>
    );
  }

  const isPending = request.decisionStatus === "PENDING";
  const isApproved =
    (request.decisionStatus === "APPROVED" || request.decisionStatus === "PARTIALLY_APPROVED") &&
    request.handoverStatus !== "HANDED_OVER" &&
    request.lifecycleStatus === "ACTIVE";

  const handleLineDecisionChange = (lineId: string, status: RequestLineStatus, maxQty: number) => {
    setLineDecisions((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        status,
        approvedQuantity:
          status === "REJECTED"
            ? 0
            : prev[lineId]?.approvedQuantity > 0
              ? prev[lineId].approvedQuantity
              : maxQty,
      },
    }));
  };

  const handleLineQuantityChange = (lineId: string, qty: number) => {
    setLineDecisions((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        approvedQuantity: qty,
        status: qty === 0 ? "REJECTED" : "APPROVED",
      },
    }));
  };

  const handleLineNoteChange = (lineId: string, reason: string) => {
    setLineDecisions((prev) => ({
      ...prev,
      [lineId]: {
        ...prev[lineId],
        reason,
      },
    }));
  };

  const handleReviewSubmit = async (fullReject: boolean = false) => {
    try {
      setErrorMessage(null);

      if (fullReject) {
        await rejectMutation.mutateAsync({
          requestId: request.id,
          reason: overallNotes || "Rejected by board review",
          actorUserId: currentPersona.id,
          actorRole: currentPersona.role,
        });
        setSuccessMessage("Request successfully rejected.");
        return;
      }

      const linesPayload = (request.items || []).map((item) => {
        const state = lineDecisions[item.id] || {
          status: "APPROVED" as RequestLineStatus,
          approvedQuantity: item.requestedQuantity,
          reason: "",
        };
        return {
          lineId: item.id,
          approvedQuantity: state.approvedQuantity,
          rejectionReason: state.reason,
        };
      });

      await reviewMutation.mutateAsync({
        payload: {
          requestId: request.id,
          lines: linesPayload,
          decisionNotes: overallNotes,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
        actorClearance: currentPersona.clearance,
      });

      setSuccessMessage("Review successfully recorded and 48h stock reserved.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to submit review");
    }
  };

  const handleHandoverSubmit = async () => {
    try {
      setErrorMessage(null);
      const lineHandoverDetails = (request.items || [])
        .filter((item) => (item.approvedQuantity || 0) > 0)
        .map((item) => ({
          lineId: item.id,
          serialNumbers: assignedSerials[item.id]
            ? assignedSerials[item.id]
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : undefined,
        }));

      await handoverMutation.mutateAsync({
        payload: {
          requestId: request.id,
          lineHandoverDetails,
          notes: handoverNotes,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowHandoverModal(false);
      setSuccessMessage("Items successfully handed over and active loans created.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to complete handover");
    }
  };

  const handleCancelAllocation = async () => {
    if (!confirm("Are you sure you want to cancel and void this approved request?")) return;
    try {
      await rejectMutation.mutateAsync({
        requestId: request.id,
        reason: "Cancelled / Expired allocation released back to inventory",
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });
      setSuccessMessage("Approved allocation cancelled. Stock returned to available pool.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to cancel allocation");
    }
  };

  return (
    <PageContainer maxWidth="wide">
      <div className="pb-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Link to="/board/requests">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Requests Queue</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Request ${request.id}`}
        description={`Submitted by ${request.userName} on ${new Date(
          request.createdAt
        ).toLocaleDateString()}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={getRequestDisplayStatus(request)} />
            {isApproved && (
              <Button
                variant="default"
                size="default"
                onClick={() => setShowHandoverModal(true)}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Perform Physical Handover</span>
              </Button>
            )}
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
        {/* Left Column: Dossier & Request Info */}
        <div className="space-y-4">
          {/* Borrower Dossier Card */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Borrower Dossier</span>
              </h3>
              <StatusBadge status={borrower?.status || borrower?.accountStatus || "ACTIVE"} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-semibold text-foreground">{request.userName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Clearance</span>
                <span className="font-bold text-primary">
                  Level {borrower?.clearance || borrower?.clearanceLevel || request.userClearance}
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
                <span className="text-muted-foreground">Disciplinary Strikes</span>
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
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-muted-foreground">{request.userId}</span>
              </div>
            </div>

            {(borrower?.strikesCount || borrower?.strikeCount || 0) >= 2 && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-[11px] text-destructive space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Strike Policy Active</span>
                </div>
                <p>
                  Borrower has {borrower?.strikesCount || borrower?.strikeCount} strikes. Class F &
                  G equipment are blocked. Class E requires direct supervision.
                </p>
              </div>
            )}
          </div>

          {/* Request Metadata Card */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
              <FolderGit2 className="w-4 h-4 text-secondary" />
              <span>Request Context</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Project</span>
                <span className="font-medium text-foreground">
                  {request.projectName || "General Logistics"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Submitted At</span>
                <span className="text-foreground">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
              {request.expectedReturnDate && (
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Planned Return</span>
                  <span className="text-foreground">{request.expectedReturnDate}</span>
                </div>
              )}
              <div className="pt-1">
                <span className="text-muted-foreground block mb-1">Purpose / Rationale:</span>
                <p className="p-2 rounded bg-muted/50 border border-border/50 text-foreground font-mono text-[11px] whitespace-pre-wrap">
                  {request.purpose || "No detailed purpose supplied."}
                </p>
              </div>
            </div>
          </div>

          {/* 48-Hour Allocation Card if Approved */}
          {isApproved && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>48-Hour Pickup Window</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Stock has been reserved and deducted from general availability. If the member fails
                to pick up items within 48 hours, cancel the allocation to release inventory.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelAllocation}
                disabled={rejectMutation.isPending}
                className="w-full text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                <span>Void & Release Allocation</span>
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: Line Items Review Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <span>Line Items Review Matrix</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verify stock availability, assign approved quantities, and enforce clearance
                  rules.
                </p>
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {(request.items || []).length} line item
                {(request.items || []).length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Line Items List */}
            <div className="space-y-3">
              {(request.items || []).map((item) => {
                const liveItem = inventory.find((i) => i.id === item.itemId);
                const currentDecision = lineDecisions[item.id] || {
                  status: item.status || "APPROVED",
                  approvedQuantity:
                    item.approvedQuantity !== undefined
                      ? item.approvedQuantity
                      : item.requestedQuantity,
                  reason: item.rejectionReason || "",
                };

                const itemClass = item.equipmentClass || liveItem?.itemClass || "B";
                const isClassG = itemClass === "G";
                const isSuperadmin = currentPersona.role === "SUPERADMIN";
                const classGBlocked = isClassG && !isSuperadmin;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {liveItem?.imageUrl && (
                          <img
                            src={liveItem.imageUrl}
                            alt={item.itemName}
                            className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {item.itemName}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              Class {itemClass}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Requested:{" "}
                            <span className="font-bold text-foreground">
                              {item.requestedQuantity}
                            </span>{" "}
                            units
                            {" · "}
                            Available in Stock:{" "}
                            <span className="font-bold text-emerald-600">
                              {liveItem?.availableQuantity ?? "N/A"}
                            </span>{" "}
                            units
                          </div>
                        </div>
                      </div>

                      {/* Line Decision Controls (only editable if PENDING) */}
                      {isPending ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant={currentDecision.status === "APPROVED" ? "default" : "outline"}
                            disabled={classGBlocked}
                            onClick={() =>
                              handleLineDecisionChange(item.id, "APPROVED", item.requestedQuantity)
                            }
                            className="h-7 text-xs px-2.5"
                          >
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              currentDecision.status === "APPROVED" &&
                              currentDecision.approvedQuantity < item.requestedQuantity
                                ? "default"
                                : "outline"
                            }
                            disabled={classGBlocked}
                            onClick={() =>
                              handleLineQuantityChange(
                                item.id,
                                Math.max(1, Math.floor(item.requestedQuantity / 2))
                              )
                            }
                            className="h-7 text-xs px-2.5"
                          >
                            Partial
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              currentDecision.status === "REJECTED" ? "destructive" : "outline"
                            }
                            onClick={() =>
                              handleLineDecisionChange(item.id, "REJECTED", item.requestedQuantity)
                            }
                            className="h-7 text-xs px-2.5"
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <StatusBadge
                          status={currentDecision.status}
                          label={`${currentDecision.status} (${item.approvedQuantity || 0} units)`}
                        />
                      )}
                    </div>

                    {classGBlocked && (
                      <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-[11px] text-destructive flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Class G item requires Superadmin (Clearance VI) authorization. Board
                          (Level V) cannot approve this line.
                        </span>
                      </div>
                    )}

                    {/* Quantity Selector & Note if Pending */}
                    {isPending && currentDecision.status !== "REJECTED" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/40 text-xs">
                        <div>
                          <label className="text-muted-foreground block mb-1">
                            Approved Quantity:
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={Math.min(
                              item.requestedQuantity,
                              liveItem?.availableQuantity !== undefined
                                ? liveItem.availableQuantity
                                : item.requestedQuantity
                            )}
                            value={currentDecision.approvedQuantity}
                            onChange={(e) =>
                              handleLineQuantityChange(item.id, parseInt(e.target.value) || 0)
                            }
                            className="h-8 text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground block mb-1">
                            Line Review Note:
                          </label>
                          <Input
                            placeholder="Optional note for this item..."
                            value={currentDecision.reason}
                            onChange={(e) => handleLineNoteChange(item.id, e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Overall Decision Section for Pending requests */}
            {isPending && (
              <div className="pt-4 border-t border-border space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Overall Review Rationale / Notes:
                  </label>
                  <Input
                    placeholder="Provide board review rationale or instructions for handover..."
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleReviewSubmit(true)}
                    disabled={reviewMutation.isPending || rejectMutation.isPending}
                    className="w-full sm:w-auto text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Reject Entire Request</span>
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => handleReviewSubmit(false)}
                    disabled={reviewMutation.isPending || rejectMutation.isPending}
                    className="w-full sm:w-auto text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>Submit Approval & Allocate 48h Stock</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handover Dialog Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Physical Handover Intake</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHandoverModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Confirm physical handover to <strong>{request.userName}</strong>. This converts the
              approved allocation into active loan records.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {(request.items || [])
                .filter((item) => (item.approvedQuantity || 0) > 0)
                .map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-border bg-muted/20">
                    <div className="font-semibold text-foreground">
                      {item.itemName} (Qty: {item.approvedQuantity})
                    </div>
                    <div className="mt-1.5">
                      <label className="text-[11px] text-muted-foreground block mb-0.5">
                        Assigned Serial Number(s) / Asset Tag:
                      </label>
                      <Input
                        placeholder="e.g. STM32-0042, POL-01..."
                        value={assignedSerials[item.id] || ""}
                        onChange={(e) =>
                          setAssignedSerials((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Handover Notes / Physical Condition:
              </label>
              <Input
                placeholder="Items handed over in excellent working condition..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHandoverModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleHandoverSubmit}
                disabled={handoverMutation.isPending}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {handoverMutation.isPending ? "Processing..." : "Confirm & Activate Loans"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
