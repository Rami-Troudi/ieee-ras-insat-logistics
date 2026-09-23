import { UserProfile, ProjectSummary } from "@/types";

export interface IProfileService {
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateContactInfo(userId: string, data: { phone?: string }): Promise<UserProfile>;
  resetDemoData(): Promise<void>;
}

export interface IProjectService {
  listActiveProjects(): Promise<ProjectSummary[]>;
  listMine(userId: string): Promise<ProjectSummary[]>;
}
