export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "PLANNING";

export type ProjectCategory = "EUROBOT" | "RAS_INTERNAL" | "HACKATHON" | "ACADEMIC" | string;

export interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  description: string;
  status: ProjectStatus;
  leadName: string;
  membersCount: number;
  memberIds: string[];
  category?: ProjectCategory;
  leadId?: string;
  leadMemberId?: string;
  activeLoanCount?: number;
}
