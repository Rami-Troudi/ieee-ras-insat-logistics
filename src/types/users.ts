export type Role = "MEMBER" | "BOARD" | "SUPERADMIN";

export type ClearanceLevel = "I" | "II" | "III" | "IV" | "V" | "VI";

export type UserStatus = "ACTIVE" | "RESTRICTED" | "BANNED" | "BLACKLISTED";

export type Affiliation = "EXTERNAL" | "AEROBOTIX" | "IEEE" | "RAS_BOARD" | "EUROBOT";

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: Role;
  clearance: ClearanceLevel;
  affiliation: Affiliation;
  isProcessed: boolean;
  status: UserStatus;
  strikesCount: number;
}

export interface UserStrike {
  id: string;
  date: string;
  reason: string;
  severity: "WARNING" | "RESTRICTION" | "SUSPENSION";
  resolved: boolean;
}

export interface UserProfile extends UserPersona {
  phone?: string;
  studentId?: string;
  joinedDate: string;
  strikes: UserStrike[];
  activeLoansCount: number;
  totalRequestsCount: number;
}
