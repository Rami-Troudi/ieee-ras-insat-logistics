import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import { useBoardAudits, useStartAudit } from "../hooks/useBoardAudits";
import { CheckCircle2, Plus, Eye, Calendar } from "lucide-react";

export const BoardAuditsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: audits = [], isLoading } = useBoardAudits();
  const startAuditMutation = useStartAudit();

  const [showStartModal, setShowStartModal] = useState(false);
  const [auditTitle, setAuditTitle] = useState("Spring 2026 Comprehensive Inventory Audit");
  const [auditNotes, setAuditNotes] = useState("");

  const handleStartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await startAuditMutation.mutateAsync({
        payload: {
          title: auditTitle,
          notes: auditNotes,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowStartModal(false);
      setAuditNotes("");
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading inventory audit campaigns..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Physical Inventory Audits"
        description="Run semesterly hardware stock reconciliation. Snapshots inventory state at T0, tracks net intermediate loans/returns, and reconciles physical discrepancies."
        action={
          <Button
            variant="default"
            size="default"
            onClick={() => setShowStartModal(true)}
            className="gap-2 font-semibold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Start Semester Audit</span>
          </Button>
        }
      />

      {/* Audits Table */}
      <div className="space-y-3">
        {audits.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-foreground">No audits recorded</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new physical stock audit for the current academic semester.
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Audit Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Started At</th>
                    <th className="py-3 px-4">Started By</th>
                    <th className="py-3 px-4">Audited Items</th>
                    <th className="py-3 px-4">Discrepancies</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {audits.map((audit) => {
                    const discrepancies = audit.items.filter(
                      (i) => i.status === "DISCREPANCY"
                    ).length;
                    const matched = audit.items.filter(
                      (i) => i.status === "MATCHED" || i.status === "RECONCILED"
                    ).length;

                    return (
                      <tr key={audit.id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{audit.title}</div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {audit.id}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={audit.status} />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(audit.startedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          {audit.startedByName || audit.startedBy}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">
                          {matched} / {audit.items.length}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold ${
                              discrepancies > 0 ? "text-destructive" : "text-muted-foreground"
                            }`}
                          >
                            {discrepancies}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                            <Link to={`/board/audits/${audit.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                              <span>
                                {audit.status === "IN_PROGRESS" ? "Count / Reconcile" : "Review"}
                              </span>
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Start Audit Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Start Semester Audit</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStartModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleStartSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Audit Title:</label>
                <Input
                  required
                  placeholder="e.g. Spring 2026 Comprehensive Inventory Audit"
                  value={auditTitle}
                  onChange={(e) => setAuditTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Audit Scope / Notes:
                </label>
                <Input
                  placeholder="Physical count across all laboratory cabinets..."
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStartModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={startAuditMutation.isPending}
                  className="text-xs font-semibold"
                >
                  {startAuditMutation.isPending ? "Starting..." : "Take Snapshot & Start"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
