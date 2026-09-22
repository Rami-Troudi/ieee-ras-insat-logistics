import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import {
  useBoardProjectDetail,
  useAddProjectMember,
  useRemoveProjectMember,
  useUpdateProject,
} from "../hooks/useBoardProjects";
import { useBoardUsers } from "@/features/users/board/hooks/useBoardUsers";
import { ArrowLeft, FolderGit2, Users, UserPlus, Trash2, Award } from "lucide-react";
import { ProjectStatus } from "@/types/projects";

export const BoardProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentPersona } = useSession();

  const { data: project, isLoading } = useBoardProjectDetail(projectId || "");
  const { data: allUsers = [] } = useBoardUsers();

  const addMemberMutation = useAddProjectMember();
  const removeMemberMutation = useRemoveProjectMember();
  const updateProjectMutation = useUpdateProject();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isLoading || !project) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading project specifications..." />
      </PageContainer>
    );
  }

  const isEurobot =
    project.category === "EUROBOT" ||
    project.id.includes("eurobot") ||
    project.code.toLowerCase().includes("eur");

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setErrorMessage(null);
      await addMemberMutation.mutateAsync({
        projectId: project.id,
        userId: selectedUserId,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage(
        isEurobot
          ? `Member added and automatically elevated to Level V (Eurobot).`
          : "Member added to project."
      );
      setSelectedUserId("");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to remove this member from the project?")) return;

    try {
      setErrorMessage(null);
      await removeMemberMutation.mutateAsync({
        projectId: project.id,
        userId: targetUserId,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage("Member removed from project. Clearance recalculated.");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to remove member");
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    try {
      setErrorMessage(null);
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        status: newStatus,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setSuccessMessage(`Project status updated to ${newStatus}.`);
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Failed to update project status");
    }
  };

  // Available users to add (not already members)
  const availableUsers = allUsers.filter((u) => !(project.memberIds || []).includes(u.id));

  return (
    <PageContainer maxWidth="wide">
      <div className="pb-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
          <Link to="/board/projects">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects Queue</span>
          </Link>
        </Button>
      </div>

      <PageHeader
        title={project.name}
        description={`Code: ${project.code} · Category: ${project.category || "GENERAL"}`}
        action={
          <div className="flex items-center gap-2">
            <select
              value={project.status}
              onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
              className="h-8 px-2 rounded-md border border-input bg-background text-xs font-semibold"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        }
      />

      {errorMessage && (
        <div className="mb-4">
          <AlertBanner variant="destructive" title="Action Failed" description={errorMessage} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4">
          <AlertBanner variant="success" title="Success" description={successMessage} />
        </div>
      )}

      {isEurobot && (
        <div className="mb-6 p-3.5 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
          <Award className="w-5 h-5 text-primary shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-bold text-foreground">Eurobot Project Clearance Policy: </span>
            Members assigned to official Eurobot competition teams automatically receive{" "}
            <strong className="text-primary">Level V Project Clearance</strong> to borrow advanced
            sensors and specialized robotics development kits.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Overview */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm h-fit">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <FolderGit2 className="w-4 h-4 text-primary" />
            <span>Project Metadata</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Project Code</span>
              <span className="font-mono font-bold text-foreground">{project.code}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Category</span>
              <span className="font-semibold text-secondary-foreground">
                {project.category || "GENERAL"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Lead Member</span>
              <span className="font-mono text-muted-foreground">
                {project.leadName || project.leadId || "—"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Team Size</span>
              <span className="font-bold text-foreground">
                {(project.memberIds || []).length} member(s)
              </span>
            </div>
            <div className="pt-1">
              <span className="text-muted-foreground block mb-1">Description:</span>
              <p className="text-muted-foreground text-xs">{project.description || "None"}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Team Roster & Clearance Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <span>Assigned Team Roster ({(project.memberIds || []).length})</span>
              </h3>
            </div>

            {/* Add Member Form */}
            <form onSubmit={handleAddMember} className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 h-8 px-2 rounded-md border border-input bg-background text-xs"
              >
                <option value="">-- Select Member to Add --</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.fullName} ({u.email}) · Level {u.clearance || u.clearanceLevel}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                size="sm"
                disabled={!selectedUserId || addMemberMutation.isPending}
                className="h-8 text-xs font-semibold gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </Button>
            </form>

            {/* Members List Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground text-[11px] uppercase font-semibold">
                    <th className="py-2.5 px-3">Member Name & Email</th>
                    <th className="py-2.5 px-3">Clearance</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(project.memberIds || []).map((memId) => {
                    const u = allUsers.find((user) => user.id === memId);
                    const isLead = memId === project.leadId || memId === project.leadMemberId;

                    return (
                      <tr key={memId} className="hover:bg-accent/30">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <span>{u?.name || u?.fullName || memId}</span>
                            {isLead && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary">
                                Team Lead
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {u?.email || memId}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-primary">
                          Level {u?.clearance || u?.clearanceLevel || (isEurobot ? "V" : "I")}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={u?.status || u?.accountStatus || "ACTIVE"} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={removeMemberMutation.isPending || isLead}
                            onClick={() => handleRemoveMember(memId)}
                            className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs"
                            title={isLead ? "Cannot remove team lead" : "Remove member"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
