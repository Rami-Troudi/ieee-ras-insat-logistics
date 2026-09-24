import { IAuthService, RegisterMemberInput, RegisterResult } from "../contracts/auth";
import { UserPersona } from "@/types";
import { mockDb } from "@/mocks/db";
import { PROD_DEFAULT_PERSONA } from "@/hooks/useSession";
import { refreshStrikeDerivedProfile } from "./authorization";

class MockAuthService implements IAuthService {
  private subscribers: Set<(persona: UserPersona) => void> = new Set();
  private sessionUserId = PROD_DEFAULT_PERSONA.id;

  constructor() {
    try {
      const saved =
        localStorage.getItem("ras_active_user_id") ||
        (import.meta.env.DEV ? localStorage.getItem("ras_dev_persona_id") : null);
      if (saved) {
        this.sessionUserId = saved;
      }
    } catch {
      // Ignore storage errors in test or restricted environments
    }
    mockDb.subscribe(() => this.notifySubscribers());
  }

  async registerMember(input: RegisterMemberInput): Promise<RegisterResult> {
    await new Promise((res) => setTimeout(res, 200));

    if (!["EXTERNAL", "AEROBOTIX", "IEEE"].includes(input.membership)) {
      throw new Error("Public registration only accepts member affiliations");
    }
    const affiliation = input.membership;
    const newPersona: UserPersona = {
      id: `member-${crypto.randomUUID()}`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: "MEMBER",
      clearance: affiliation === "IEEE" ? "III" : affiliation === "AEROBOTIX" ? "II" : "I",
      affiliation: affiliation,
      isProcessed: false,
      status: "ACTIVE",
      strikesCount: 0,
    };

    mockDb.mutate((draft) => {
      draft.userProfiles[newPersona.id] = {
        ...newPersona,
        phone: input.phone.trim(),
        claimedAffiliation: affiliation,
        joinedDate: new Date().toISOString(),
        strikes: [],
        activeLoansCount: 0,
        totalRequestsCount: 0,
      };
    });

    this.setSession(newPersona);

    const snapshot = mockDb.getSnapshot();
    return {
      persona: newPersona,
      profile: snapshot.userProfiles[newPersona.id],
    };
  }

  async getCurrentSession(): Promise<UserPersona | null> {
    return this.getCurrentUser();
  }

  getCurrentUser(): UserPersona {
    const snapshot = mockDb.getSnapshot();
    const userId = snapshot.userProfiles[this.sessionUserId]
      ? this.sessionUserId
      : PROD_DEFAULT_PERSONA.id;
    return refreshStrikeDerivedProfile(snapshot, userId);
  }

  setSession(persona: UserPersona): void {
    if (!mockDb.getSnapshot().userProfiles[persona.id]) {
      throw new Error("Unknown account");
    }
    this.sessionUserId = persona.id;
    try {
      localStorage.setItem("ras_active_user_id", persona.id);
      if (import.meta.env.DEV) {
        localStorage.setItem("ras_dev_persona_id", persona.id);
      }
    } catch {
      // Ignore storage errors
    }
    this.notifySubscribers();
  }

  clearSession(): void {
    this.sessionUserId = PROD_DEFAULT_PERSONA.id;
    try {
      localStorage.removeItem("ras_active_user_id");
      if (import.meta.env.DEV) {
        localStorage.removeItem("ras_dev_persona_id");
      }
    } catch {
      // Ignore storage errors
    }
    this.notifySubscribers();
  }

  subscribeSession(callback: (persona: UserPersona) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    const currentUser = this.getCurrentUser();
    this.subscribers.forEach((cb) => {
      try {
        cb(currentUser);
      } catch (err) {
        console.error("Session subscriber error:", err);
      }
    });
  }
}

export const mockAuthService = new MockAuthService();
