import React, { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import {
  useBoardRecommendations,
  useBoardIncidents,
  useBoardStrikes,
  useBoardCompensations,
  useCreateIncident,
  useIssueStrike,
  useOverturnStrike,
  useRecordCompensation,
  useUpdateCompensationStatus,
  useReviewRecommendation,
} from "../hooks/useBoardDiscipline";
import { useBoardUsers } from "@/features/users/board/hooks/useBoardUsers";
import {
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  Plus,
  CheckCircle2,
  Lock,
  FileText,
} from "lucide-react";
import { IncidentCategory, IncidentSeverity } from "@/types";

export const BoardIncidentsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const [activeTab, setActiveTab] = useState<
    "RECOMMENDATIONS" | "INCIDENTS" | "STRIKES" | "COMPENSATIONS"
  >("RECOMMENDATIONS");

  const { data: recommendations = [], isLoading: loadingRecs } = useBoardRecommendations();
  const { data: incidents = [], isLoading: loadingIncs } = useBoardIncidents();
  const { data: strikes = [], isLoading: loadingStrikes } = useBoardStrikes();
  const { data: compensations = [], isLoading: loadingComps } = useBoardCompensations();
  const { data: allUsers = [] } = useBoardUsers();

  const createIncidentMutation = useCreateIncident();
  const issueStrikeMutation = useIssueStrike();
  const overturnStrikeMutation = useOverturnStrike();
  const recordCompensationMutation = useRecordCompensation();
  const updateCompensationMutation = useUpdateCompensationStatus();
  const reviewRecMutation = useReviewRecommendation();

  // Issue strike modal state
  const [showStrikeModal, setShowStrikeModal] = useState(false);
  const [strikeUserId, setStrikeUserId] = useState("");
  const [strikeLevel, setStrikeLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [strikeReason, setStrikeReason] = useState("");

  // Create incident modal state
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentUserId, setIncidentUserId] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentCategory, setIncidentCategory] = useState<IncidentCategory>("DAMAGE");
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [incidentDesc, setIncidentDesc] = useState("");

  // Create compensation modal state
  const [showCompModal, setShowCompModal] = useState(false);
  const [compUserId, setCompUserId] = useState("");
  const [compAmount, setCompAmount] = useState<number>(50);
  const [compAssessment, setCompAssessment] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSuperadmin = currentPersona.role === "SUPERADMIN";

  const handleIssueStrikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strikeUserId) return;

    try {
      setErrorMessage(null);
      await issueStrikeMutation.mutateAsync({
        payload: {
          userId: strikeUserId,
          level: strikeLevel,
          reason: strikeReason || `Strike ${strikeLevel} issued for policy violation`,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowStrikeModal(false);
      setSuccessMessage(`Strike ${strikeLevel} issued successfully.`);
      setStrikeReason("");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to issue strike");
    }
  };

  const handleOverturnStrike = async (strikeId: string) => {
    if (!confirm("Are you sure you want to overturn and pardon this strike?")) return;
    try {
      setErrorMessage(null);
      await overturnStrikeMutation.mutateAsync({
        strikeId,
        reason: "Pardoned by board custodial review",
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });
      setSuccessMessage("Strike overturned successfully.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to overturn strike");
    }
  };

  const handleCreateIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      await createIncidentMutation.mutateAsync({
        payload: {
          userId: incidentUserId || currentPersona.id,
          title: incidentTitle,
          category: incidentCategory,
          severity: incidentSeverity,
          description: incidentDesc,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowIncidentModal(false);
      setIncidentTitle("");
      setIncidentDesc("");
      setSuccessMessage("Incident dossier created successfully.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to create incident");
    }
  };

  const handleCreateCompSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compUserId) return;

    try {
      setErrorMessage(null);
      await recordCompensationMutation.mutateAsync({
        payload: {
          userId: compUserId,
          amount: compAmount,
          assessment: compAssessment,
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowCompModal(false);
      setCompAssessment("");
      setSuccessMessage("Financial compensation assessment recorded.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to record compensation");
    }
  };

  const handleSettleComp = async (compId: string) => {
    try {
      setErrorMessage(null);
      await updateCompensationMutation.mutateAsync({
        payload: {
          compensationId: compId,
          status: "PAID",
          notes: "Settled and verified by board",
        },
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });
      setSuccessMessage("Compensation record marked as PAID.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to update compensation");
    }
  };

  const handleReviewRec = async (recId: string, approve: boolean) => {
    try {
      setErrorMessage(null);
      await reviewRecMutation.mutateAsync({
        recommendationId: recId,
        action: approve ? "APPLY" : "DISMISS",
        decisionNotes: approve ? "Recommendation applied" : "Recommendation dismissed",
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage(approve ? "Recommendation applied." : "Recommendation dismissed.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to review recommendation");
    }
  };

  if (loadingRecs || loadingIncs || loadingStrikes || loadingComps) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading disciplinary records and incidents..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Incidents, Strikes & Sanctions"
        description="Human-in-the-loop disciplinary enforcement. Review automated sanction recommendations, log loss/damage incidents, issue progressive strikes (1–5), and track equipment compensation."
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="warning" title="Action Failed" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="info" title="Success" description={successMessage} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3 mb-6 text-xs">
        <Button
          size="sm"
          variant={activeTab === "RECOMMENDATIONS" ? "default" : "outline"}
          onClick={() => setActiveTab("RECOMMENDATIONS")}
          className="gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            Automated Recommendations (
            {recommendations.filter((r) => r.status === "PENDING_REVIEW").length})
          </span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "INCIDENTS" ? "default" : "outline"}
          onClick={() => setActiveTab("INCIDENTS")}
          className="gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Incidents ({incidents.length})</span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "STRIKES" ? "default" : "outline"}
          onClick={() => setActiveTab("STRIKES")}
          className="gap-1.5"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Progressive Strikes ({strikes.length})</span>
        </Button>
        <Button
          size="sm"
          variant={activeTab === "COMPENSATIONS" ? "default" : "outline"}
          onClick={() => setActiveTab("COMPENSATIONS")}
          className="gap-1.5"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Compensations ({compensations.length})</span>
        </Button>
      </div>

      {/* Tab 1: Recommendations */}
      {activeTab === "RECOMMENDATIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Automated Disciplinary Recommendations
            </h3>
            <span className="text-xs text-muted-foreground">
              Derived automatically from 14+ days overdue loans
            </span>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-foreground">
                  No pending recommendations
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  All active loans are within normal operating bounds or have already been triaged.
                </p>
              </div>
            ) : (
              recommendations.map((rec) => {
                const isPending = rec.status === "PENDING_REVIEW";
                return (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isPending
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border bg-card opacity-70"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-destructive">
                          Recommended: Strike {rec.suggestedStrikeLevel}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">{rec.id}</span>
                        <StatusBadge
                          status={
                            rec.status === "PENDING_REVIEW"
                              ? "PENDING"
                              : rec.status === "APPLIED"
                                ? "APPROVED"
                                : "REJECTED"
                          }
                        />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {rec.userName} ({rec.userId}) · Ref: {rec.sourceEntityId}
                      </h4>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewRec(rec.id, false)}
                          disabled={reviewRecMutation.isPending}
                          className="text-xs text-muted-foreground"
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReviewRec(rec.id, true)}
                          disabled={reviewRecMutation.isPending}
                          className="text-xs font-semibold"
                        >
                          Confirm & Issue Strike
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Incidents */}
      {activeTab === "INCIDENTS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Reported Incidents Ledger</h3>
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowIncidentModal(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Incident</span>
            </Button>
          </div>

          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-accent/40">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{inc.title}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-sm">
                        {inc.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{inc.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          inc.severity === "CRITICAL"
                            ? "bg-destructive text-destructive-foreground"
                            : inc.severity === "HIGH"
                              ? "bg-amber-500 text-white"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {inc.reportedByName || inc.reportedBy}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={
                          inc.status === "OPEN" || inc.status === "INVESTIGATING"
                            ? "WARNING"
                            : "SUCCESS"
                        }
                        label={inc.status}
                      />
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {new Date(inc.reportedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Progressive Strikes */}
      {activeTab === "STRIKES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Progressive Disciplinary Strikes (1–5)
              </h3>
              <p className="text-xs text-muted-foreground">
                Strikes 1–4 restrict equipment classes; Strike 5 permanently blacklists the user
                (Superadmin only).
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowStrikeModal(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Progressive Strike</span>
            </Button>
          </div>

          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User ID & Name</th>
                  <th className="py-3 px-4">Strike Level</th>
                  <th className="py-3 px-4">Reason & Details</th>
                  <th className="py-3 px-4">Issued By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {strikes.map((s) => {
                  const isBlacklist = s.level === 5;

                  return (
                    <tr key={s.id} className="hover:bg-accent/40">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{s.userName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {s.userId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isBlacklist
                              ? "bg-black text-white"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}
                        >
                          Strike {s.level} {isBlacklist && "(Blacklist)"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{s.reason}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {s.issuedByName || s.issuedBy}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={s.status === "ACTIVE" ? "RESTRICTED" : "CLOSED"}
                          label={s.status}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOverturnStrike(s.id)}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          >
                            Pardon / Overturn
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Compensations */}
      {activeTab === "COMPENSATIONS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Equipment Financial Compensations
            </h3>
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowCompModal(true)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Assessment</span>
            </Button>
          </div>

          <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Assessed Amount</th>
                  <th className="py-3 px-4">Assessment Rationale</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {compensations.map((comp) => {
                  const isPending = comp.status === "PENDING";

                  return (
                    <tr key={comp.id} className="hover:bg-accent/40">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{comp.userName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                          {comp.userId}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-foreground">{comp.amount} TND</td>
                      <td className="py-3 px-4 text-muted-foreground">{comp.assessment}</td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={
                            comp.status === "PAID"
                              ? "SUCCESS"
                              : comp.status === "PENDING"
                                ? "WARNING"
                                : "INFO"
                          }
                          label={comp.status}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSettleComp(comp.id)}
                            disabled={updateCompensationMutation.isPending}
                            className="h-7 text-xs font-semibold text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Strike Modal */}
      {showStrikeModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <span>Issue Disciplinary Strike</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStrikeModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleIssueStrikeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Target Member:</label>
                <select
                  required
                  value={strikeUserId}
                  onChange={(e) => setStrikeUserId(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="">-- Select Member --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id}) · {u.strikesCount} strikes
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Strike Level (1–5):
                </label>
                <select
                  value={strikeLevel}
                  onChange={(e) => setStrikeLevel(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value={1}>Strike 1: First Official Warning</option>
                  <option value={2}>Strike 2: F/G Blocked, E Supervised Only</option>
                  <option value={3}>Strike 3: F/G Blocked, E Supervised Only</option>
                  <option value={4}>Strike 4: 90-day Full Suspension</option>
                  <option value={5}>Strike 5: Permanent Blacklist (Superadmin Only)</option>
                </select>
              </div>

              {strikeLevel === 5 && !isSuperadmin && (
                <div className="p-2 rounded bg-destructive/10 border border-destructive/30 text-[11px] text-destructive flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Strike 5 (Permanent Blacklist) requires Superadmin privilege. Board members
                    cannot issue Strike 5.
                  </span>
                </div>
              )}

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Rationale / Violation Reason:
                </label>
                <Input
                  required
                  placeholder="e.g. Failure to return overdue hardware after 14 days..."
                  value={strikeReason}
                  onChange={(e) => setStrikeReason(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStrikeModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={
                    issueStrikeMutation.isPending ||
                    (strikeLevel === 5 && !isSuperadmin) ||
                    !strikeUserId
                  }
                  className="text-xs font-semibold"
                >
                  {issueStrikeMutation.isPending ? "Issuing..." : "Confirm Strike"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Log New Incident</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIncidentModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateIncidentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Member Involved:</label>
                <select
                  value={incidentUserId}
                  onChange={(e) => setIncidentUserId(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="">-- General / Current User --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Incident Title:</label>
                <Input
                  required
                  placeholder="e.g. Burnt Motor Driver during testing..."
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Category:</label>
                  <select
                    value={incidentCategory}
                    onChange={(e) => setIncidentCategory(e.target.value as IncidentCategory)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                  >
                    <option value="DAMAGE">Damaged Equipment</option>
                    <option value="LOST">Lost Equipment</option>
                    <option value="OVERDUE">Overdue Escalation</option>
                    <option value="POLICY_BREACH">Policy Breach</option>
                    <option value="SAFETY_VIOLATION">Safety Violation</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Severity:</label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value as IncidentSeverity)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Description:</label>
                <Input
                  placeholder="Circumstances of incident, borrower involved, damage notes..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowIncidentModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={createIncidentMutation.isPending}
                  className="text-xs font-semibold"
                >
                  {createIncidentMutation.isPending ? "Logging..." : "Create Incident Dossier"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Compensation Modal */}
      {showCompModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Assess Financial Compensation</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateCompSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Target Member:</label>
                <select
                  required
                  value={compUserId}
                  onChange={(e) => setCompUserId(e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                >
                  <option value="">-- Select Member --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Amount (TND):</label>
                <Input
                  type="number"
                  min={1}
                  value={compAmount}
                  onChange={(e) => setCompAmount(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Assessment Notes:
                </label>
                <Input
                  required
                  placeholder="e.g. Replacement cost for damaged STM32 board..."
                  value={compAssessment}
                  onChange={(e) => setCompAssessment(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={recordCompensationMutation.isPending || !compUserId}
                  className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {recordCompensationMutation.isPending ? "Recording..." : "Record Assessment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
