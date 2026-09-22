export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "PLANNING";

export interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  leadName: string;
  membersCount: number;
  memberIds: string[];
}
