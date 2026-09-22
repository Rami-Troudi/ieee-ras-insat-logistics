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
  useBoardAuditDetail,
  useRecordAuditCounts,
  useCompleteAudit,
} from "../hooks/useBoardAudits";
import { ArrowLeft, CheckCircle2, Save, SlidersHorizontal } from "lucide-react";

export const BoardAuditDetailPage: React.FC = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const { currentPersona } = useSession();

  const { data: audit, isLoading } = useBoardAuditDetail(auditId || "");
  const recordCountsMutation = useRecordAuditCounts();
  const completeAuditMutation = useCompleteAudit();

  const [counts, setCounts] = useState<Record<string, number | undefined>>({});
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (audit) {
      const initial: Record<string, number | undefined> = {};
      audit.items.forEach((item) => {
        initial[item.itemId] = item.physicalCount;
      });
      setCounts(initial);
    }
  }, [audit]);

  if (isLoading || !audit) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading audit reconciliation sheet..." />
      </PageContainer>
    );
  }

  const isInProgress = audit.status === "IN_PROGRESS";

  const handleCountChange = (itemId: string, val: string) => {
    const num = val === "" ? undefined : parseInt(val) || 0;
    setCounts((prev) => ({
      ...prev,
      [itemId]: num,
    }));
  };

  const handleSaveCounts = async () => {
    try {
      setErrorMessage(null);
      const countsPayload = Object.entries(counts)
        .filter(([_, count]) => count !== undefined)
        .map(([itemId, count]) => ({
          itemId,
          physicalCount: count as number,
        }));

      await recordCountsMutation.mutateAsync({
        payload: {
          auditId: audit.id,
          counts: countsPayload,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage("Physical counts saved successfully.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to save counts");
    }
  };

  const handleCompleteAndClose = async () => {
    try {
      setErrorMessage(null);
      await completeAuditMutation.mutateAsync({
        auditId: audit.id,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowReconcileModal(false);
      setSuccessMessage(
        "Audit reconciled and inventory balances synchronized with physical counts."
      );
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to complete audit");
    }
  };

  const discrepanciesCount = audit.items.filter((i) => i.status === "DISCREPANCY").length;
  const matchedCount = audit.items.filter(
    (i) => i.status === "MATCHED" || i.status === "RECONCILED"
  ).length;

  return (
    <PageContainer maxWidth="wide">
      <div className="pb-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Link to="/board/audits">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Audits List</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={audit.title}
        description={`Audit ID: ${audit.id} · Started by ${audit.startedByName || audit.startedBy} on ${new Date(
          audit.startedAt
        ).toLocaleDateString()}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={audit.status} />
            {isInProgress && (
              <>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleSaveCounts}
                  disabled={recordCountsMutation.isPending}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Counts</span>
                </Button>
                <Button
                  variant="default"
                  size="default"
                  onClick={() => setShowReconcileModal(true)}
                  className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reconcile & Close Audit</span>
                </Button>
              </>
            )}
          </div>
        }
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="error" title="Action Failed" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="success" title="Success" description={successMessage} />
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Audited Items
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {audit.items.length}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Catalog lines</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
          <span className="text-[11px] font-semibold uppercase text-emerald-600 block">
            Reconciled Lines
          </span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{matchedCount}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Zero variance</p>
        </div>

        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
          <span className="text-[11px] font-semibold uppercase text-destructive block">
            Discrepancies
          </span>
          <span className="text-2xl font-bold text-destructive mt-1 block">
            {discrepanciesCount}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Count mismatch</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">
            Net Intermediate Events
          </span>
          <span className="text-2xl font-bold text-foreground mt-1 block">
            {audit.items.reduce((acc, i) => acc + Math.abs(i.movementsSinceSnapshot), 0)}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5">Movements since T0</p>
        </div>
      </div>

      {/* Audit Items Reconciliation Table */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            <span>Physical Inventory Reconciliation Matrix</span>
          </h3>
          <span className="text-xs text-muted-foreground">
            Adjusted Expected = Snapshot T0 + Movements Since Snapshot
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground text-[11px] uppercase font-semibold">
                <th className="py-2.5 px-3">Item Name & Specs</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Snapshot (T0)</th>
                <th className="py-2.5 px-3 text-center">Movements Since T0</th>
                <th className="py-2.5 px-3 text-center">Adjusted Expected</th>
                <th className="py-2.5 px-3 text-center">Physical Count</th>
                <th className="py-2.5 px-3 text-center">Discrepancy</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {audit.items.map((item) => {
                const currentPhysical = counts[item.itemId];
                const adjustedExpected = item.adjustedExpectedQuantity;
                const diff =
                  currentPhysical !== undefined ? currentPhysical - adjustedExpected : undefined;

                return (
                  <tr key={item.itemId} className="hover:bg-accent/30">
                    <td className="py-2.5 px-3 font-semibold text-foreground">
                      <div>{item.itemName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground font-normal">
                        {item.itemId}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{item.category}</td>
                    <td className="py-2.5 px-3 text-center text-muted-foreground font-medium">
                      {item.expectedSnapshotQuantity}
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">
                      <span
                        className={
                          item.movementsSinceSnapshot > 0
                            ? "text-emerald-600"
                            : item.movementsSinceSnapshot < 0
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }
                      >
                        {item.movementsSinceSnapshot > 0
                          ? `+${item.movementsSinceSnapshot}`
                          : item.movementsSinceSnapshot}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-foreground">
                      {adjustedExpected}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isInProgress ? (
                        <Input
                          type="number"
                          min={0}
                          value={currentPhysical !== undefined ? currentPhysical : ""}
                          onChange={(e) => handleCountChange(item.itemId, e.target.value)}
                          className="w-20 h-7 text-xs mx-auto text-center font-bold"
                        />
                      ) : (
                        <span className="font-bold text-foreground">
                          {currentPhysical ?? "Uncounted"}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {diff !== undefined ? (
                        <span
                          className={
                            diff === 0 ? "text-emerald-600" : "text-destructive font-extrabold"
                          }
                        >
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {diff === undefined ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          UNCOUNTED
                        </span>
                      ) : diff === 0 ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          MATCH
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-bold">
                          VARIANCE
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconcile and Close Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Reconcile & Close Audit</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReconcileModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Closing this audit will update the master inventory stock balances to match the
              physical count and mark the audit as completed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReconcileModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleCompleteAndClose}
                disabled={completeAuditMutation.isPending}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {completeAuditMutation.isPending ? "Reconciling..." : "Confirm & Close Audit"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
