import { ProjectSummary, ProjectStatus } from "@/types";

export interface CreateProjectPayload {
  name: string;
  code: string;
  description: string;
  leadId?: string;
  memberIds?: string[];
}

export interface UpdateProjectPayload {
  projectId: string;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  leadId?: string;
}

export interface IBoardProjectService {
  getProjects(filters?: { search?: string; status?: string }): Promise<ProjectSummary[]>;
  getProjectById(projectId: string): Promise<ProjectSummary | null>;
  createProject(
    payload: CreateProjectPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary>;
  updateProject(
    payload: UpdateProjectPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary>;
  assignMember(
    projectId: string,
    userId: string,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary>;
  removeMember(
    projectId: string,
    userId: string,
    actorUserId: string,
    actorRole: string
  ): Promise<ProjectSummary>;
}
