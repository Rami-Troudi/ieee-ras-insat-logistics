import { Affiliation, ClearanceLevel, UserProfile } from "@/types";
import { mockDb } from "@/mocks/db";

export function requireOperator(actorUserId: string): UserProfile {
  return requireOperatorInDraft(mockDb.getSnapshot(), actorUserId);
}

export function requireOperatorInDraft(
  draft: Pick<import("@/mocks/db").MockDatabaseSchema, "userProfiles">,
  actorUserId: string
): UserProfile {
  const actor = draft.userProfiles[actorUserId];
  if (!actor || !["OPERATOR", "SUPERADMIN"].includes(actor.role) || actor.status !== "ACTIVE")
    throw new Error("Unauthorized: active operator access required");
  return actor;
}

export function requireSuperadmin(actorUserId: string): UserProfile {
  const actor = requireOperator(actorUserId);
  if (actor.role !== "SUPERADMIN") {
    throw new Error("Unauthorized: superadmin access required");
  }
  return actor;
}

export function requireMember(userId: string): UserProfile {
  const user = mockDb.getSnapshot().userProfiles[userId];
  if (!user || user.role !== "MEMBER") throw new Error("Member account required");
  if (user.status !== "ACTIVE" || user.strikesCount >= 4) {
    throw new Error("This account cannot request equipment");
  }
  return user;
}

export function memberClearance(affiliation: Affiliation): ClearanceLevel {
  switch (affiliation) {
    case "AEROBOTIX":
      return "II";
    case "IEEE":
      return "III";
    default:
      return "I";
  }
}

export function canonicalClearance(user: UserProfile): ClearanceLevel {
  if (user.role === "SUPERADMIN") return "VI";
  if (user.role === "OPERATOR") return "V";
  if (user.clearanceSource === "MANUAL_LEVEL_IV") return "IV";
  return memberClearance(user.affiliation);
}
