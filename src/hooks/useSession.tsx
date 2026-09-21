import { createContext, useContext } from "react";
import { UserPersona } from "@/types";

export interface SessionContextType {
  currentPersona: UserPersona;
  isDev: boolean;
}

export const PROD_DEFAULT_PERSONA: UserPersona = {
  id: "prod-session-user",
  name: "IEEE Member",
  email: "member@insat.u-carthage.tn",
  role: "MEMBER",
  clearance: "III",
  affiliation: "IEEE",
  isProcessed: true,
  status: "ACTIVE",
  strikesCount: 0,
};

export const SessionContext = createContext<SessionContextType>({
  currentPersona: PROD_DEFAULT_PERSONA,
  isDev: false,
});

export const useSession = (): SessionContextType => useContext(SessionContext);
