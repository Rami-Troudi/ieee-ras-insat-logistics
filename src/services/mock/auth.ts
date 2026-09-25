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
    void input;
    throw new Error("Borrower accounts are not used. Enter your email to continue.");
  }

  async getCurrentSession(): Promise<UserPersona | null> {
    return this.getCurrentUser();
  }

  getCurrentUser(): UserPersona {
    const email = localStorage.getItem("ras_borrower_email");
    if (email)
      return {
        id: "anonymous-member",
        name: "Borrower",
        email,
        role: "MEMBER",
        clearance: "I",
        affiliation: "EXTERNAL",
        isProcessed: false,
        status: "ACTIVE",
        strikesCount: 0,
      };
    const snapshot = mockDb.getSnapshot();
    if (!snapshot.userProfiles[this.sessionUserId]) return PROD_DEFAULT_PERSONA;
    return refreshStrikeDerivedProfile(snapshot, this.sessionUserId);
  }

  setSession(persona: UserPersona): void {
    if (persona.id === "anonymous-member" && persona.email) {
      localStorage.setItem("ras_borrower_email", persona.email.trim().toLowerCase());
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
