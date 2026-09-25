import { createContext, useContext } from "react";
import { UserPersona } from "@/types";

export interface SessionContextType {
  currentPersona: UserPersona;
  isDev: boolean;
  isLoading: boolean;
}

export const PROD_DEFAULT_PERSONA: UserPersona = {
  id: "anonymous",
  name: "Guest",
  email: "",
  role: "MEMBER",
  clearance: "III",
  affiliation: "EXTERNAL",
  isProcessed: false,
  status: "PENDING",
  strikesCount: 0,
};

export const SessionContext = createContext<SessionContextType>({
  currentPersona: PROD_DEFAULT_PERSONA,
  isDev: false,
  isLoading: true,
});

export const useSession = (): SessionContextType => useContext(SessionContext);
