import {
  IBoardUserService,
  ProcessUserPayload,
  UpdateUserClearancePayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
} from "@/services/contracts/board/users";
import { UserProfile, ClearanceLevel, Affiliation, Role, UserStatus } from "@/types";
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

class MockBoardUserService implements IBoardUserService {
  private async simulateLatency(): Promise<void> {
    await new Promise((res) => setTimeout(res, 50));
  }

  async getUsers(filters?: {
    search?: string;
    role?: Role | "ALL";
    clearance?: ClearanceLevel | "ALL";
    affiliation?: Affiliation | "ALL";
    unprocessedOnly?: boolean;
    status?: UserStatus | "ALL";
  }): Promise<UserProfile[]> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    let users = Object.values(snapshot.userProfiles);

    if (filters?.role && filters.role !== "ALL") {
      users = users.filter((u) => u.role === filters.role);
    }
    if (filters?.clearance && filters.clearance !== "ALL") {
      users = users.filter((u) => u.clearance === filters.clearance);
    }
    if (filters?.affiliation && filters.affiliation !== "ALL") {
      users = users.filter((u) => u.affiliation === filters.affiliation);
    }
    if (filters?.unprocessedOnly) {
      users = users.filter((u) => !u.isProcessed);
    }
    if (filters?.status && filters.status !== "ALL") {
      users = users.filter((u) => u.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.studentId && u.studentId.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }

    return users.sort((a, b) => (a.isProcessed === b.isProcessed ? 0 : a.isProcessed ? 1 : -1));
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    await this.simulateLatency();
    const snapshot = mockDb.getSnapshot();
    const user = snapshot.userProfiles[userId];
    return user ? { ...user } : null;
  }

  async processUser(
    payload: ProcessUserPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<UserProfile> {
    await this.simulateLatency();
    let updatedUser: UserProfile | null = null;

    mockDb.mutate((draft) => {
      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");

      const derivedClearance = deriveClearanceFromAffiliation(payload.verifiedAffiliation);

      user.isProcessed = true;
      user.verifiedAffiliation = payload.verifiedAffiliation;
      user.affiliation = payload.verifiedAffiliation;
      user.clearance = derivedClearance;
      user.clearanceSource = "AFFILIATION";
      user.verifiedBy = actorRole === "SUPERADMIN" ? "RAS Chairman" : "Logistics Board";
      user.verifiedAt = new Date().toISOString();
      if (payload.notes) user.notes = payload.notes;

      updatedUser = { ...user };
    });

    if (updatedUser) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "USER_PROCESSED",
        entityType: "USER",
        entityId: payload.userId,
        after: updatedUser,
        reason: payload.notes || `Verified affiliation as ${payload.verifiedAffiliation}`,
      });

      return updatedUser;
    }
    throw new Error("Failed to process user");
  }

  async updateClearance(
    payload: UpdateUserClearancePayload,
    actorUserId: string,
    actorRole: string,
    actorClearance: string
  ): Promise<UserProfile> {
    await this.simulateLatency();
    let updatedUser: UserProfile | null = null;

    mockDb.mutate((draft) => {
      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");

      // Level IV is Superadmin only
      if (payload.newClearance === "IV" && actorClearance !== "VI") {
        throw new Error(
          "Unauthorized: Granting or managing Level IV (Trusted Individual) clearance requires explicit Level VI authority (Superadmin)."
        );
      }

      user.clearance = payload.newClearance;
      user.clearanceSource = payload.source;

      updatedUser = { ...user };
    });

    if (updatedUser) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "CLEARANCE_CHANGED",
        entityType: "USER",
        entityId: payload.userId,
        after: { clearance: payload.newClearance, source: payload.source },
        reason: payload.reason,
      });

      return updatedUser;
    }
    throw new Error("Failed to update clearance");
  }

  async updateRole(
    payload: UpdateUserRolePayload,
    actorUserId: string,
    actorRole: string
  ): Promise<UserProfile> {
    await this.simulateLatency();
    let updatedUser: UserProfile | null = null;

    mockDb.mutate((draft) => {
      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");

      // Managing privileged administrative roles (BOARD / SUPERADMIN) requires Superadmin
      if (
        (payload.newRole === "BOARD" ||
          payload.newRole === "SUPERADMIN" ||
          user.role === "BOARD" ||
          user.role === "SUPERADMIN") &&
        actorRole !== "SUPERADMIN"
      ) {
        throw new Error(
          "Unauthorized: Assigning or revoking privileged roles (BOARD / SUPERADMIN) is restricted to Superadmin."
        );
      }

      user.role = payload.newRole;

      if (payload.newRole === "SUPERADMIN") {
        user.clearance = "VI";
        user.clearanceSource = "SUPERADMIN_ROLE";
      } else if (payload.newRole === "BOARD") {
        user.clearance = "V";
        user.clearanceSource = "BOARD_ROLE";
      } else {
        // Recalculate clearance for standard MEMBER based on affiliation
        user.clearance = deriveClearanceFromAffiliation(user.affiliation);
        user.clearanceSource = "AFFILIATION";
      }

      updatedUser = { ...user };
    });

    if (updatedUser) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: actorRole === "SUPERADMIN" ? "RAS Chairman" : "Board Custodian",
        actorRole: actorRole as Role,
        action: "ROLE_CHANGED",
        entityType: "USER",
        entityId: payload.userId,
        after: { role: payload.newRole, clearance: (updatedUser as UserProfile).clearance },
        reason: payload.reason,
      });

      return updatedUser;
    }
    throw new Error("Failed to update role");
  }

  async updateStatus(
    payload: UpdateUserStatusPayload,
    actorUserId: string,
    actorRole: string
  ): Promise<UserProfile> {
    await this.simulateLatency();
    let updatedUser: UserProfile | null = null;

    mockDb.mutate((draft) => {
      const user = draft.userProfiles[payload.userId];
      if (!user) throw new Error("User not found");

      if (payload.status === "BLACKLISTED" && actorRole !== "SUPERADMIN") {
        throw new Error("Unauthorized: Permanent blacklisting is restricted to Superadmin.");
      }

      user.status = payload.status;
      updatedUser = { ...user };
    });

    if (updatedUser) {
      await mockBoardAuditLogService.logEvent({
        actorUserId,
        actorName: "Board Custodian",
        actorRole: actorRole as Role,
        action: "STATUS_CHANGED",
        entityType: "USER",
        entityId: payload.userId,
        after: { status: payload.status },
        reason: payload.reason,
      });

      return updatedUser;
    }
    throw new Error("Failed to update status");
  }
}

export const mockBoardUserService = new MockBoardUserService();
