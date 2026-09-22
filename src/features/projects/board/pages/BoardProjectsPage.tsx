import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/LoadingState";
import { useSession } from "@/hooks/useSession";
import { useBoardProjects, useCreateProject } from "../hooks/useBoardProjects";
import { FolderGit2, Search, Plus, Eye } from "lucide-react";
import { ProjectCategory } from "@/types/projects";

export const BoardProjectsPage: React.FC = () => {
  const { currentPersona } = useSession();
  const { data: projects = [], isLoading } = useBoardProjects();
  const createProjectMutation = useCreateProject();

  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New project form state
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<ProjectCategory>("EUROBOT");
  const [newLeadId, setNewLeadId] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (categoryFilter !== "ALL" && p.category !== categoryFilter) return false;
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchName = p.name.toLowerCase().includes(q);
        if (!matchCode && !matchName) return false;
      }
      return true;
    });
  }, [projects, categoryFilter, statusFilter, searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    try {
      await createProjectMutation.mutateAsync({
        code: newCode,
        name: newName,
        description: newDescription,
        leadId: newLeadId || currentPersona.id,
        actorUserId: currentPersona.id,
        actorRole: currentPersona.role,
      });

      setShowAddModal(false);
      setNewCode("");
      setNewName("");
      setNewDescription("");
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="wide">
        <LoadingState message="Loading projects and equipment allocations..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="wide">
      <PageHeader
        title="Projects & Equipment Assignments"
        description="Manage Eurobot teams, internal club research, hackathon equipment reservations, and project member clearances."
        action={
          <Button
            variant="default"
            size="default"
            onClick={() => setShowAddModal(true)}
            className="gap-2 font-semibold text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Project</span>
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="EUROBOT">Eurobot</option>
            <option value="RAS_INTERNAL">RAS Internal</option>
            <option value="HACKATHON">Hackathons</option>
            <option value="ACADEMIC">Academic</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 rounded-md border border-input bg-background text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Projects Table / Card Grid */}
      <div className="pt-2">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card">
            <FolderGit2 className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search criteria or create a new team project.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-3 px-4">Project Name & Code</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Project Lead</th>
                    <th className="py-3 px-4">Team Roster</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-accent/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{proj.name}</div>
                        <div className="text-[11px] font-mono text-primary font-bold">
                          {proj.code}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                          {proj.category || "GENERAL"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {proj.leadName || proj.leadId || "—"}
                      </td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        {(proj.memberIds || []).length} member
                        {(proj.memberIds || []).length !== 1 ? "s" : ""}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge
                          status={proj.status === "ACTIVE" ? "ACTIVE" : "CLOSED"}
                          label={proj.status}
                        />
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1">
                          <Link to={`/board/projects/${proj.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-primary" />
                <span>Create New Project</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Project Code:</label>
                  <Input
                    required
                    placeholder="e.g. EUROBOT-2027"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                  >
                    <option value="EUROBOT">Eurobot (Elevates to Level V)</option>
                    <option value="RAS_INTERNAL">RAS Internal</option>
                    <option value="HACKATHON">Hackathon</option>
                    <option value="ACADEMIC">Academic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Project Name:</label>
                <Input
                  required
                  placeholder="e.g. Eurobot 2027 Autonomous Rover"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Project Lead (User ID):
                </label>
                <Input
                  placeholder="e.g. user-lead-01 (or leave blank for yourself)"
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Project Description:
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Scope, competition objectives, and hardware requirements..."
                  className="w-full p-2 rounded-md border border-input bg-background text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={createProjectMutation.isPending}
                  className="h-8 text-xs font-semibold"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
