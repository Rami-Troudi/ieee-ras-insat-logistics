import { Affiliation, ClearanceLevel, UserProfile } from "@/types";
import { mockDb } from "@/mocks/db";

type IdentityDraft = Pick<import("@/mocks/db").MockDatabaseSchema, "userProfiles" | "strikes">;

export function activeStrikesForUser(
  draft: Pick<IdentityDraft, "strikes">,
  userId: string,
  at = Date.now()
) {
  return draft.strikes.filter(
    (strike) =>
      strike.userId === userId &&
      strike.status === "ACTIVE" &&
      (!strike.expiresAt || Date.parse(strike.expiresAt) > at)
  );
}

export function activeStrikeCount(
  draft: Pick<IdentityDraft, "strikes">,
  userId: string,
  at = Date.now()
): number {
  return activeStrikesForUser(draft, userId, at).length;
}

export function refreshStrikeDerivedProfile(
  draft: IdentityDraft,
  userId: string,
  at = Date.now()
): UserProfile {
  const user = draft.userProfiles[userId];
  if (!user) throw new Error("User not found");
  const active = activeStrikesForUser(draft, userId, at);
  user.strikesCount = active.length;
  user.strikes = (user.strikes ?? []).map((entry) => {
    const record = draft.strikes.find((strike) => strike.id === entry.id);
    return record ? { ...entry, resolved: !active.includes(record) } : entry;
  });
  const permanentStrike = active.some((strike) => strike.level === 5);
  user.isBanned = Boolean(user.status === "BANNED" || user.manualBlacklisted || permanentStrike);
  if (user.manualBlacklisted || permanentStrike) user.status = "BLACKLISTED";
  else if (active.some((strike) => strike.level === 4) || active.length >= 4)
    user.status = "RESTRICTED";
  else if (user.status === "RESTRICTED" || user.status === "BLACKLISTED") user.status = "ACTIVE";
  return user;
}

export function requireOperator(actorUserId: string): UserProfile {
  return requireOperatorInDraft(mockDb.getSnapshot(), actorUserId);
}

export function requireOperatorInDraft(draft: IdentityDraft, actorUserId: string): UserProfile {
  const actor = draft.userProfiles[actorUserId];
  if (!actor || !["OPERATOR", "SUPERADMIN"].includes(actor.role) || actor.status !== "ACTIVE")
    throw new Error("Unauthorized: active operator access required");
  return actor;
}

export function requireSuperadminInDraft(draft: IdentityDraft, actorUserId: string): UserProfile {
  const actor = requireOperatorInDraft(draft, actorUserId);
  if (actor.role !== "SUPERADMIN") throw new Error("Unauthorized: superadmin access required");
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
  return requireMemberInDraft(mockDb.getSnapshot(), userId);
}

export function requireMemberInDraft(draft: IdentityDraft, userId: string): UserProfile {
  const user = refreshStrikeDerivedProfile(draft, userId);
  if (user.role !== "MEMBER") throw new Error("Member account required");
  if (user.status !== "ACTIVE") throw new Error("This account cannot request equipment");
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
