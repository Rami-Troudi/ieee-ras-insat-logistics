import React, { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PolicyNotice } from "@/components/shared/PolicyNotice";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { useUserProfile, useUpdateContactInfo, useResetDemoData } from "../hooks/useProfile";
import { useMyProjects } from "@/features/requests/hooks/useRequests";
import { useSession } from "@/hooks/useSession";
import { formatDate } from "@/lib/dates";
import {
  ShieldCheck,
  UserCheck,
  Phone,
  Mail,
  FolderGit2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export const MemberProfilePage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: profile, isLoading, refetch } = useUserProfile(currentPersona.id);
  const { data: myProjects = [] } = useMyProjects(currentPersona.id);
  const updateContactMutation = useUpdateContactInfo(currentPersona.id);
  const resetDemoMutation = useResetDemoData();

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || "");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateContactMutation.mutateAsync({ phone: phoneNumber });
    setIsEditingPhone(false);
    refetch();
  };

  const handleResetDemoData = async () => {
    await resetDemoMutation.mutateAsync();
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading member profile & clearance..." />
      </PageContainer>
    );
  }

  const p = profile || {
    id: currentPersona.id,
    name: currentPersona.name,
    email: currentPersona.email,
    role: currentPersona.role,
    clearance: currentPersona.clearance,
    affiliation: currentPersona.affiliation,
    isProcessed: currentPersona.isProcessed,
    status: currentPersona.status,
    strikesCount: currentPersona.strikesCount,
    studentId: "INSAT Member",
    phone: "",
    joinedDate: "2024-01-01T00:00:00.000Z",
    strikes: [],
    activeLoansCount: 0,
    totalRequestsCount: 0,
  };

  const isBanned = p.status === "BANNED" || p.status === "BLACKLISTED" || p.strikesCount >= 5;
  const isSuspendedSemester = p.strikesCount === 4;

  return (
    <PageContainer>
      <PageHeader
        title="Member Profile & Credentials"
        description="Verify your logistics clearance, check discipline standing, and inspect assigned team projects."
        action={
          import.meta.env.DEV ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemoData}
              disabled={resetDemoMutation.isPending}
              className="text-xs gap-1.5 min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>{resetSuccess ? "Resetting..." : "Reset Demo Data"}</span>
            </Button>
          ) : undefined
        }
      />

      {/* Verification Notice */}
      {!p.isProcessed && (
        <PolicyNotice
          variant="info"
          title="Account Affiliation Pending Board Verification"
          description="Your affiliation has been registered and is provisional. You can submit requests normally; the Logistics Board will verify your identity and affiliation during processing."
        />
      )}

      {isBanned && (
        <PolicyNotice
          variant="restricted"
          title="Account Blacklisted"
          description="Your account is permanently blacklisted (Strike 5 reached). All logistics privileges are revoked."
        />
      )}

      {isSuspendedSemester && (
        <PolicyNotice
          variant="restricted"
          title="Borrowing Suspended for Semester"
          description="You have accumulated 4 strikes. Borrowing privileges are suspended until the end of the academic semester."
        />
      )}

      {p.strikesCount === 2 && (
        <PolicyNotice
          variant="warning"
          title="Disciplinary Standing: Strike 2 Active"
          description="Second warning standing: all borrow requests require explicit Board review and approval. Heavy Equipment (Class F) and High Value Electronics (Class G) are unavailable."
        />
      )}

      {p.strikesCount === 3 && (
        <PolicyNotice
          variant="warning"
          title="Disciplinary Standing: Strike 3 Active"
          description="Third warning standing: all requests require explicit Board approval. Class E items may only be used under supervision, and Classes F and G remain strictly unavailable."
        />
      )}

      {/* Profile Overview Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {p.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{p.name}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{p.email}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  {p.studentId || "INSAT Member"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={p.status === "ACTIVE" ? "ACTIVE" : "RESTRICTED"} />
            <StatusBadge
              status={p.isProcessed ? "SUCCESS" : "INFO"}
              label={p.isProcessed ? "Verified Member" : "Provisional Affiliation"}
            />
          </div>
        </div>

        {/* Clearance Level Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/60">
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Clearance Level
              </span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground font-mono">
              Level {p.clearance}
            </span>
            <p className="text-[11px] text-muted-foreground">
              {p.clearance === "I"
                ? "External Individuals: Eligible for Classes A and B."
                : p.clearance === "II"
                  ? "Aerobotix: Eligible for Classes A, B, and C."
                  : p.clearance === "III"
                    ? "IEEE Member: Eligible for Classes A–E; F under Level V+ supervision."
                    : p.clearance === "IV"
                      ? "Trusted Individual: Exceptional Level VI authorized access."
                      : p.clearance === "V"
                        ? "RAS Board / Eurobot: Operational logistics authority; can supervise F."
                        : "RAS Chairman / Logistics Manager: Full granting authority across all classes."}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Loans
              </span>
              <UserCheck className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-2xl font-bold text-foreground">{p.activeLoansCount} Current</span>
            <p className="text-[11px] text-muted-foreground">
              Equipment physically checked out in good standing.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Affiliation & Standing
              </span>
              <span className="text-xs font-bold text-foreground font-mono">{p.affiliation}</span>
            </div>
            <span className="text-2xl font-bold text-foreground">
              {p.strikesCount} Active Strike{p.strikesCount !== 1 ? "s" : ""}
            </span>
            <p className="text-[11px] text-muted-foreground">
              Strike 1: Warning · Strike 2: Board approval req. · Strike 3: Class E supervised ·
              Strike 4: Semester suspension · Strike 5: Blacklist.
            </p>
          </div>
        </div>

        {/* Contact Info & Editable Phone */}
        <div className="pt-4 border-t border-border/60 space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Contact & Onboarding Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span>
                Institutional Email: <strong className="text-foreground">{p.email}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>
                  Phone: <strong className="text-foreground">{p.phone || "Not provided"}</strong>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPhoneNumber(p.phone || "");
                  setIsEditingPhone(!isEditingPhone);
                }}
                className="text-xs min-h-[44px] px-3"
              >
                {isEditingPhone ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>

          {isEditingPhone && (
            <form onSubmit={handleSavePhone} className="flex gap-2 pt-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+216 XX XXX XXX"
                className="rounded border border-input bg-background px-3 py-2 text-xs flex-1 min-h-[44px]"
              />
              <Button type="submit" size="sm" className="text-xs min-h-[44px] px-4">
                Save
              </Button>
            </form>
          )}

          <div className="text-xs text-muted-foreground pt-1">
            Member since: <strong>{formatDate(p.joinedDate)}</strong>
          </div>
        </div>
      </div>

      {/* Disciplinary Strikes Ledger */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-secondary" />
            <span>Disciplinary Strikes & Violations Ledger</span>
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {p.strikes?.length || 0} Record(s)
          </span>
        </div>

        {p.strikes && p.strikes.length > 0 ? (
          <div className="divide-y divide-border">
            {p.strikes.map((strike) => (
              <div
                key={strike.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge
                      status={strike.severity === "SUSPENSION" ? "BANNED" : "WARNING"}
                      label={strike.severity}
                    />
                    <span className="text-muted-foreground font-mono">
                      {formatDate(strike.date)}
                    </span>
                  </div>
                  <span className="text-foreground font-medium">{strike.reason}</span>
                </div>
                <StatusBadge
                  status={strike.resolved ? "SUCCESS" : "ERROR"}
                  label={strike.resolved ? "Resolved" : "Active Penalty"}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 font-medium">
            No disciplinary strikes recorded. Account is in exemplary standing with the Logistics
            Board.
          </div>
        )}
      </div>

      {/* Assigned Robotics Projects (Member Scoped) */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-primary" />
          <span>My Assigned Robotics Projects</span>
        </h3>

        {myProjects.length === 0 ? (
          <div className="p-4 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            You are not currently assigned to any active robotics projects by the Logistics Board.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {myProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-4 rounded-lg border border-border bg-muted/30 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{proj.code}</span>
                  <StatusBadge status="ACTIVE" label={proj.status} />
                </div>
                <p className="font-semibold text-foreground">{proj.name}</p>
                <p className="text-muted-foreground line-clamp-2">{proj.description}</p>
                <div className="pt-2 border-t border-border/60 text-muted-foreground flex items-center justify-between">
                  <span>Lead: {proj.leadName}</span>
                  <span>{proj.membersCount} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
