import React from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { useSession } from "@/hooks/useSession";
import { useBoardAuditLog } from "@/features/audit-log/board/hooks/useBoardAuditLog";
import { ShieldCheck, CheckCircle2, History, Lock } from "lucide-react";

export const BoardProfilePage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: allAuditEvents = [] } = useBoardAuditLog();

  const auditEvents = allAuditEvents.filter((evt) => evt.actorUserId === currentPersona.id);
  const isSuperadmin = currentPersona.role === "SUPERADMIN";
  const displayName = currentPersona.name || currentPersona.fullName || "Admin";

  const permissions = [
    { name: "Review & Line-Item Approvals (A–F)", level: "Level V", allowed: true },
    { name: "Physical Checkouts & 48h Allocations", level: "Level V", allowed: true },
    { name: "Return Intake & Condition Assessments", level: "Level V", allowed: true },
    { name: "Inventory Restocking & Stock Mutations", level: "Level V", allowed: true },
    {
      name: "Physical Semester Audits & Discrepancy Reconciliation",
      level: "Level V",
      allowed: true,
    },
    { name: "Issue Progressive Strikes 1–4", level: "Level V", allowed: true },
    { name: "Assess Equipment Financial Compensations", level: "Level V", allowed: true },
    { name: "Approve Class G Specialized Equipment", level: "Level VI", allowed: isSuperadmin },
    { name: "Grant / Revoke Manual Level IV Clearances", level: "Level VI", allowed: isSuperadmin },
    {
      name: "Assign Privileged Roles (Board / Superadmin)",
      level: "Level VI",
      allowed: isSuperadmin,
    },
    { name: "Issue Strike 5 (Permanent Blacklist)", level: "Level VI", allowed: isSuperadmin },
    {
      name: "Export Sensitive Domain Datasets (Users, Strikes, Audits)",
      level: "Level VI",
      allowed: isSuperadmin,
    },
  ];

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Board Custodian Profile"
        description="Verified administrative credentials, logistics cabinet authority matrix, and recent custodial ledger events."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Custodian Dossier */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground font-bold text-lg flex items-center justify-center">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">{displayName}</h3>
                <p className="text-xs text-muted-foreground">{currentPersona.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">System Role</span>
                <span className="font-bold text-foreground">{currentPersona.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Clearance Authority</span>
                <span className="font-bold text-primary">
                  Level {currentPersona.clearance}{" "}
                  {isSuperadmin ? "(Superadmin)" : "(Board Member)"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Affiliation</span>
                <span className="font-medium text-foreground">{currentPersona.affiliation}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-muted-foreground">{currentPersona.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authority Matrix & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Authority Matrix */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Operational Authority Matrix</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {permissions.map((p) => (
                <div
                  key={p.name}
                  className={`p-2.5 rounded-lg border flex items-center justify-between ${
                    p.allowed
                      ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
                      : "border-border/60 bg-muted/20 text-muted-foreground opacity-75"
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="font-medium text-[11px]">{p.name}</div>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      Required: {p.level}
                    </span>
                  </div>
                  {p.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <History className="w-4 h-4 text-secondary" />
              <span>Recent Administrative Activity ({auditEvents.length})</span>
            </h3>

            <div className="space-y-2 text-xs">
              {auditEvents.length === 0 ? (
                <p className="text-muted-foreground py-2">
                  No recent administrative actions recorded in this session.
                </p>
              ) : (
                auditEvents.slice(0, 5).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-muted/20 border border-border/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{evt.action}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        Target: {evt.entityType} ({evt.entityId})
                        {evt.reason && ` · Reason: ${evt.reason}`}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(evt.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
