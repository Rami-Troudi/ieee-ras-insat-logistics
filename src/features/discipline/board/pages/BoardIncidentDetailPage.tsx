import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import { useBoardIncidentDetail, useResolveIncident } from "../hooks/useBoardDiscipline";
import { ArrowLeft, FileText, Shield } from "lucide-react";

export const BoardIncidentDetailPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId: string }>();
  const { currentPersona } = useSession();

  const { data: incident, isLoading } = useBoardIncidentDetail(incidentId || "");
  const resolveIncidentMutation = useResolveIncident();

  const [resolutionNotes, setResolutionNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isLoading || !incident) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading incident dossier..." />
      </PageContainer>
    );
  }

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMessage(null);
      await resolveIncidentMutation.mutateAsync({
        incidentId: incident.id,
        resolutionNotes,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage("Incident status updated to RESOLVED.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to resolve incident");
    }
  };

  return (
    <PageContainer maxWidth="wide">
      <div className="pb-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Link to="/board/incidents">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Incidents</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={incident.title}
        description={`Incident ID: ${incident.id} · Logged ${new Date(
          incident.reportedAt
        ).toLocaleDateString()}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge
              status={
                incident.status === "RESOLVED" || incident.status === "CLOSED"
                  ? "SUCCESS"
                  : "WARNING"
              }
              label={incident.status}
            />
          </div>
        }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm h-fit">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Incident Context</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Category</span>
              <span className="font-semibold text-foreground">{incident.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Severity Level</span>
              <span
                className={`font-bold ${
                  incident.severity === "CRITICAL"
                    ? "text-destructive"
                    : incident.severity === "HIGH"
                      ? "text-amber-600"
                      : "text-foreground"
                }`}
              >
                {incident.severity}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Member Involved</span>
              <span className="font-semibold text-foreground">
                {incident.userName} ({incident.userId})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Reported By</span>
              <span className="font-mono text-muted-foreground">
                {incident.reportedByName || incident.reportedBy}
              </span>
            </div>
            {incident.resolutionNotes && (
              <div className="pt-1 border-b border-border/50 pb-2">
                <span className="text-muted-foreground block mb-1">Resolution Notes:</span>
                <p className="text-emerald-700 font-medium text-xs">{incident.resolutionNotes}</p>
              </div>
            )}
            <div className="pt-1">
              <span className="text-muted-foreground block mb-1">Description:</span>
              <p className="p-2 rounded bg-muted/30 text-muted-foreground text-xs whitespace-pre-wrap">
                {incident.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Investigation & Resolution Form */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Shield className="w-4 h-4 text-secondary" />
            <span>Investigation Resolution</span>
          </h3>

          {incident.status === "OPEN" || incident.status === "INVESTIGATING" ? (
            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Resolution Notes / Remediation Summary:
                </label>
                <Input
                  required
                  placeholder="Hardware repaired / replacement fee collected / strike issued..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={resolveIncidentMutation.isPending}
                  className="text-xs font-semibold"
                >
                  {resolveIncidentMutation.isPending ? "Resolving..." : "Mark Resolved"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              This incident has been resolved and closed.
            </p>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
