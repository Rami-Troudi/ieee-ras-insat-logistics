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
    await new Promise((res) => setTimeout(res, 50));
    const affiliation = input.membership;
    const normalizedEmail = input.email.trim().toLowerCase();
    const name = input.name.trim();

    const newPersona: UserPersona = {
      id: `borrower-${normalizedEmail}`,
      name,
      email: normalizedEmail,
      role: "MEMBER",
      clearance: affiliation === "IEEE" ? "III" : affiliation === "AEROBOTIX" ? "II" : "I",
      affiliation,
      isProcessed: false,
      status: "ACTIVE",
      strikesCount: 0,
    };

    const profile = {
      ...newPersona,
      phone: input.phone.trim(),
      claimedAffiliation: affiliation,
      joinedDate: new Date().toISOString(),
      strikes: [],
      activeLoansCount: 0,
      totalRequestsCount: 0,
    };

    mockDb.mutate((draft) => {
      draft.userProfiles[newPersona.id] = profile;
    });

    try {
      localStorage.setItem("ras_borrower_email", normalizedEmail);
      localStorage.setItem("ras_onboarding_completed", "true");
      localStorage.setItem(
        "ras_borrower_profile",
        JSON.stringify({
          firstName: input.firstName,
          lastName: input.lastName,
          name,
          email: normalizedEmail,
          phone: input.phone.trim(),
          membership: affiliation,
        })
      );
      localStorage.setItem("ras_active_user_id", newPersona.id);
    } catch {
      // Ignore storage errors
    }

    this.sessionUserId = newPersona.id;
    this.notifySubscribers();

    return {
      persona: newPersona,
      profile,
    };
  }

  async getCurrentSession(): Promise<UserPersona | null> {
    return this.getCurrentUser();
  }

  getCurrentUser(): UserPersona {
    const email = localStorage.getItem("ras_borrower_email");
    if (email) {
      let savedProfile: { name?: string; membership?: "IEEE" | "AEROBOTIX" | "EXTERNAL" } | null =
        null;
      try {
        const raw = localStorage.getItem("ras_borrower_profile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch {
        // Ignore JSON error
      }
      const affiliation = savedProfile?.membership || "EXTERNAL";
      return {
        id: this.sessionUserId === "anonymous-member" ? "anonymous-member" : `borrower-${email}`,
        name: savedProfile?.name || "Borrower",
        email,
        role: "MEMBER",
        clearance: affiliation === "IEEE" ? "III" : affiliation === "AEROBOTIX" ? "II" : "I",
        affiliation,
        isProcessed: false,
        status: "ACTIVE",
        strikesCount: 0,
      };
    }
    const snapshot = mockDb.getSnapshot();
    if (!snapshot.userProfiles[this.sessionUserId]) return PROD_DEFAULT_PERSONA;
    return refreshStrikeDerivedProfile(snapshot, this.sessionUserId);
  }

  setSession(persona: UserPersona): void {
    if (persona.id.startsWith("borrower-") || persona.id === "anonymous-member") {
      if (persona.email) {
        localStorage.setItem("ras_borrower_email", persona.email.trim().toLowerCase());
        localStorage.setItem("ras_onboarding_completed", "true");
      }
      this.sessionUserId = persona.id;
      this.notifySubscribers();
      return;
    }
    if (!mockDb.getSnapshot().userProfiles[persona.id]) {
      throw new Error("Unknown account");
    }
    localStorage.removeItem("ras_borrower_email");
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
    localStorage.removeItem("ras_borrower_email");
    localStorage.removeItem("ras_borrower_profile");
    localStorage.removeItem("ras_onboarding_completed");
    try {
      localStorage.removeItem("ras_active_user_id");
      if (import.meta.env.DEV) {
        localStorage.setItem("ras_dev_persona_id", PROD_DEFAULT_PERSONA.id);
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
