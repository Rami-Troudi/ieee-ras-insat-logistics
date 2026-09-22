import { IAuthService, RegisterMemberInput, RegisterResult } from "../contracts/auth";
import { UserPersona } from "@/types";
import { mockDb } from "@/mocks/db";
import { PROD_DEFAULT_PERSONA } from "@/hooks/useSession";

class MockAuthService implements IAuthService {
  private subscribers: Set<(persona: UserPersona) => void> = new Set();
  private currentSession: UserPersona = PROD_DEFAULT_PERSONA;

  constructor() {
    try {
      const saved = localStorage.getItem("ras_active_session");
      if (saved) {
        this.currentSession = JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors in test or restricted environments
    }
  }

  async registerMember(input: RegisterMemberInput): Promise<RegisterResult> {
    await new Promise((res) => setTimeout(res, 200));

    const newPersona: UserPersona = {
      id: "p-member-unprocessed",
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: "MEMBER",
      clearance: "I",
      affiliation: "EXTERNAL",
      isProcessed: false,
      status: "ACTIVE",
      strikesCount: 0,
    };

    mockDb.mutate((draft) => {
      draft.userProfiles[newPersona.id] = {
        ...newPersona,
        phone: input.phone.trim(),
        studentId: input.studentId.trim(),
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
    return this.currentSession;
  }

  setSession(persona: UserPersona): void {
    this.currentSession = persona;
    try {
      localStorage.setItem("ras_active_session", JSON.stringify(persona));
      if (import.meta.env.DEV) {
        localStorage.setItem("ras_dev_persona_id", persona.id);
      }
    } catch {
      // Ignore storage errors
    }
    this.notifySubscribers();
  }

  clearSession(): void {
    this.currentSession = PROD_DEFAULT_PERSONA;
    try {
      localStorage.removeItem("ras_active_session");
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
    this.subscribers.forEach((cb) => {
      try {
        cb(this.currentSession);
      } catch (err) {
        console.error("Session subscriber error:", err);
      }
    });
  }
}

export const mockAuthService = new MockAuthService();
