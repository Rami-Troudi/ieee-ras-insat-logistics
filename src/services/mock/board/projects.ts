import {
  IBoardProjectService,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/services/contracts/board/projects";
import { ProjectSummary, ClearanceLevel, Affiliation, Role } from "@/types";
import { mockDb } from "@/mocks/db";
import { mockBoardAuditLogService } from "./audit-log";

function deriveClearanceFromAffiliation(aff: Affiliation): ClearanceLevel {
  switch (aff) {
    case "EXTERNAL":
      return "I";
    case "AEROBOTIX":
      return "II";
    case "IEEE":
      return "III";
    case "EUROBOT":
      return "V";
    case "RAS_BOARD":
      return "V";
    default:
      return "I";
  }
}

class MockBoardProjectService implements IBoardProjectService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getProjects(filters?: { search?: string; status?: string }): Promise<ProjectSummary[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let projects = [...snapshot.projects];

    if (filters?.status && filters.status !== "ALL") {
      projects = projects.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return projects;
  }

  async getProjectById(projectId: string): Promise<ProjectSummary | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const project = snapshot.projects.find((p) => p.id === projectId);
    return project ? { ...project } : null;
  }

  async createProject(
    payload: CreateProjectPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let newProj: ProjectSummary | null = null;

    mockDb.mutate((draft) => {
      const id = `proj-${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36).slice(-4)}`;
      newProj = {
        id,
        name: payload.name,
        code: payload.code,
        description: payload.description,
        status: "ACTIVE",
        leadName: payload.leadId || "Team Lead",
        leadId: payload.leadId,
        membersCount: (payload.memberIds || []).length,
        memberIds: payload.memberIds || [],
      };

      draft.projects.unshift(newProj);
    });

    if (newProj) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "PROJECT_CREATED",
        entityType: "PROJECT",
        entityId: (newProj as ProjectSummary).id,
        after: newProj,
        reason: `Project ${payload.name} created`,
      });

      return newProj;
    }
    throw new Error("Failed to create project");
  }

  async updateProject(
    payload: UpdateProjectPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let updatedProj: ProjectSummary | null = null;

    mockDb.mutate((draft) => {
      const proj = draft.projects.find((p) => p.id === payload.projectId);
      if (!proj) throw new Error("Project not found");

      if (payload.name) proj.name = payload.name;
      if (payload.description) proj.description = payload.description;
      if (payload.status) proj.status = payload.status;
      if (payload.leadId) proj.leadId = payload.leadId;

      updatedProj = { ...proj };
    });

    if (updatedProj) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "PROJECT_UPDATED",
        entityType: "PROJECT",
        entityId: payload.projectId,
        after: updatedProj,
        reason: "Project details updated",
      });

      return updatedProj;
    }
    throw new Error("Failed to update project");
  }

  async assignMember(
    projectId: string,
    userId: string,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let updatedProj: ProjectSummary | null = null;

    mockDb.mutate((draft) => {
      const proj = draft.projects.find((p) => p.id === projectId);
      if (!proj) throw new Error("Project not found");

      if (!proj.memberIds) proj.memberIds = [];
      if (!proj.memberIds.includes(userId)) {
        proj.memberIds.push(userId);
      }

      // Check if Eurobot project -> elevate clearance to Level V
      const isEurobot =
        proj.id.includes("eurobot") ||
        proj.code.toLowerCase().includes("eur") ||
        proj.name.toLowerCase().includes("eurobot");

      if (isEurobot) {
        const user = draft.userProfiles[userId];
        if (user && user.role === "MEMBER") {
          user.affiliation = "EUROBOT";
          user.clearance = "V";
          user.clearanceSource = "EUROBOT";
        }
      }

      updatedProj = { ...proj };
    });

    if (updatedProj) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "PROJECT_MEMBER_ADDED",
        entityType: "PROJECT",
        entityId: projectId,
        after: { userId, memberIds: (updatedProj as ProjectSummary).memberIds },
        reason: `Assigned user ${userId} to project ${projectId}`,
      });

      return updatedProj;
    }
    throw new Error("Failed to assign member to project");
  }

  async removeMember(
    projectId: string,
    userId: string,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary> {
    await this.simulateLatency();
    let updatedProj: ProjectSummary | null = null;

    mockDb.mutate((draft) => {
      const proj = draft.projects.find((p) => p.id === projectId);
      if (!proj) throw new Error("Project not found");

      proj.memberIds = (proj.memberIds || []).filter((id) => id !== userId);

      const isEurobot =
        proj.id.includes("eurobot") ||
        proj.code.toLowerCase().includes("eur") ||
        proj.name.toLowerCase().includes("eurobot");

      if (isEurobot) {
        // Check if user is still in any other Eurobot project
        const otherEurobot = draft.projects.some(
          (p) =>
            p.id !== projectId &&
            (p.id.includes("eurobot") || p.code.toLowerCase().includes("eur")) &&
            (p.memberIds || []).includes(userId)
        );

        if (!otherEurobot) {
          const user = draft.userProfiles[userId];
          if (user && user.clearanceSource === "EUROBOT") {
            // Recalculate clearance from remaining authoritative source
            user.affiliation = user.verifiedAffiliation || user.claimedAffiliation || "IEEE";
            user.clearance = deriveClearanceFromAffiliation(user.affiliation);
            user.clearanceSource = "AFFILIATION";
          }
        }
      }

      updatedProj = { ...proj };
    });

    if (updatedProj) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "PROJECT_MEMBER_REMOVED",
        entityType: "PROJECT",
        entityId: projectId,
        after: { userId, memberIds: (updatedProj as ProjectSummary).memberIds },
        reason: `Removed user ${userId} from project ${projectId}`,
      });

      return updatedProj;
    }
    throw new Error("Failed to remove member from project");
  }
}

export const mockBoardProjectService = new MockBoardProjectService();
