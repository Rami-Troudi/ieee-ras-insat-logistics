export type Role = "MEMBER" | "BOARD" | "SUPERADMIN";
export type UserRole = Role;

export type ClearanceLevel = "I" | "II" | "III" | "IV" | "V" | "VI";

export type UserStatus = "ACTIVE" | "RESTRICTED" | "BANNED" | "BLACKLISTED" | "PENDING";
export type AccountStatus = "PENDING" | "ACTIVE" | "RESTRICTED" | "BANNED" | "SUSPENDED";

export type Affiliation =
  | "EXTERNAL"
  | "AEROBOTIX"
  | "IEEE"
  | "RAS_BOARD"
  | "EUROBOT"
  | "INSAT_STUDENT"
  | "IEEE_STUDENT_MEMBER"
  | "IEEE_RAS_MEMBER"
  | "AEROBOTIX_MEMBER"
  | string;

export type ClearanceSource =
  "AFFILIATION" | "EUROBOT" | "BOARD_ROLE" | "MANUAL_LEVEL_IV" | "SUPERADMIN_ROLE";

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
  clearanceSource?: ClearanceSource;
  // Aliases for compatibility
  fullName?: string;
  clearanceLevel?: ClearanceLevel;
  accountStatus?: AccountStatus;
  strikeCount?: number;
  createdAt?: string;
  isBanned?: boolean;
}

export interface UserStrike {
  id: string;
  date: string;
  reason: string;
  severity: "WARNING" | "RESTRICTION" | "SUSPENSION";
  resolved: boolean;
  level?: 1 | 2 | 3 | 4 | 5;
}

export interface UserProfile extends UserPersona {
  phone?: string;
  studentId?: string;
  joinedDate: string;
  strikes: UserStrike[];
  activeLoansCount: number;
  totalRequestsCount: number;
  claimedAffiliation?: Affiliation;
  verifiedAffiliation?: Affiliation;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}
