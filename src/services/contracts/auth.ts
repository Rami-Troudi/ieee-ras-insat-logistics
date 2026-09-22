import { UserPersona, UserProfile } from "@/types";

export interface RegisterMemberInput {
  name: string;
  email: string;
  studentId: string;
  phone: string;
  password?: string;
}

export interface RegisterResult {
  persona: UserPersona;
  profile: UserProfile;
}

export interface IAuthService {
  registerMember(input: RegisterMemberInput): Promise<RegisterResult>;
  getCurrentSession(): Promise<UserPersona | null>;
  setSession(persona: UserPersona): void;
  clearSession(): void;
  subscribeSession(callback: (persona: UserPersona) => void): () => void;
}
