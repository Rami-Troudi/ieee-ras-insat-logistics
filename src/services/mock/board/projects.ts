import {
  IBoardProjectService,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/services/contracts/board/projects";
import { ProjectSummary } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";
import { requireOperatorInDraft } from "../authorization";

class MockBoardProjectService implements IBoardProjectService {
  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async getProjects(filters?: { search?: string; status?: string }): Promise<ProjectSummary[]> {
    await this.simulateLatency();
    let projects = mockDb.getSnapshot().projects;
    if (filters?.status && filters.status !== "ALL")
      projects = projects.filter((project) => project.status === filters.status);
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      projects = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.code.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
      );
    }
    return projects;
  }

  async getProjectById(projectId: string): Promise<ProjectSummary | null> {
    await this.simulateLatency();
    return mockDb.getSnapshot().projects.find((project) => project.id === projectId) ?? null;
  }

  async createProject(
    payload: CreateProjectPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let result!: ProjectSummary;
    let actorName = "";
    let actorRole: "OPERATOR" | "SUPERADMIN" = "OPERATOR";
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      actorName = actor.name;
      actorRole = actor.role === "SUPERADMIN" ? "SUPERADMIN" : "OPERATOR";
      const memberIds = [...new Set(payload.memberIds ?? [])];
      if (memberIds.some((userId) => !draft.userProfiles[userId]))
        throw new Error("Project member not found");
      result = {
        id: `proj-${crypto.randomUUID()}`,
        name: payload.name,
        code: payload.code,
        description: payload.description,
        status: "ACTIVE",
        leadName: payload.leadId
          ? (draft.userProfiles[payload.leadId]?.name ?? "Team Lead")
          : "Team Lead",
        leadId: payload.leadId,
        membersCount: memberIds.length,
        memberIds,
      };
      draft.projects.unshift(result);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName,
      actorRole,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: result.id,
      after: result,
      reason: `Project ${payload.name} created`,
    });
    return result;
  }

  async updateProject(
    payload: UpdateProjectPayload,
    actorUserId: string,
    _actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let result!: ProjectSummary;
    let actorName = "";
    let actorRole: "OPERATOR" | "SUPERADMIN" = "OPERATOR";
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      actorName = actor.name;
      actorRole = actor.role === "SUPERADMIN" ? "SUPERADMIN" : "OPERATOR";
      const project = draft.projects.find((entry) => entry.id === payload.projectId);
      if (!project) throw new Error("Project not found");
      if (payload.name !== undefined) project.name = payload.name;
      if (payload.description !== undefined) project.description = payload.description;
      if (payload.status !== undefined) project.status = payload.status;
      if (payload.leadId !== undefined) {
        if (payload.leadId && !draft.userProfiles[payload.leadId])
          throw new Error("Project lead not found");
        project.leadId = payload.leadId;
        project.leadName = payload.leadId ? draft.userProfiles[payload.leadId].name : "Team Lead";
      }
      result = structuredClone(project);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName,
      actorRole,
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: payload.projectId,
      after: result,
      reason: "Project details updated",
    });
    return result;
  }

  async assignMember(
    projectId: string,
    userId: string,
    actorUserId: string,
    _actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let result!: ProjectSummary;
    let actorName = "";
    let actorRole: "OPERATOR" | "SUPERADMIN" = "OPERATOR";
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      actorName = actor.name;
      actorRole = actor.role === "SUPERADMIN" ? "SUPERADMIN" : "OPERATOR";
      const project = draft.projects.find((entry) => entry.id === projectId);
      if (!project) throw new Error("Project not found");
      if (!draft.userProfiles[userId]) throw new Error("User not found");
      project.memberIds = [...new Set([...(project.memberIds ?? []), userId])];
      project.membersCount = project.memberIds.length;
      result = structuredClone(project);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName,
      actorRole,
      action: "PROJECT_MEMBER_ADDED",
      entityType: "PROJECT",
      entityId: projectId,
      after: { userId, memberIds: result.memberIds },
      reason: `Assigned user ${userId} to project ${projectId}`,
    });
    return result;
  }

  async removeMember(
    projectId: string,
    userId: string,
    actorUserId: string,
    _actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let result!: ProjectSummary;
    let actorName = "";
    let actorRole: "OPERATOR" | "SUPERADMIN" = "OPERATOR";
    mockDb.mutate((draft) => {
      const actor = requireOperatorInDraft(draft, actorUserId);
      actorName = actor.name;
      actorRole = actor.role === "SUPERADMIN" ? "SUPERADMIN" : "OPERATOR";
      const project = draft.projects.find((entry) => entry.id === projectId);
      if (!project) throw new Error("Project not found");
      project.memberIds = (project.memberIds ?? []).filter((memberId) => memberId !== userId);
      project.membersCount = project.memberIds.length;
      result = structuredClone(project);
    });
    await mockBoardAuditLogService.logEvent({
      actorUserId,
      actorName,
      actorRole,
      action: "PROJECT_MEMBER_REMOVED",
      entityType: "PROJECT",
      entityId: projectId,
      after: { userId, memberIds: result.memberIds },
      reason: `Removed user ${userId} from project ${projectId}`,
    });
    return result;
  }
}

export const mockBoardProjectService = new MockBoardProjectService();
