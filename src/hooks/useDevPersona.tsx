import { createContext, useContext } from "react";
import { UserPersona } from "@/types";
import { PROD_DEFAULT_PERSONA } from "./useSession";

export interface DevPersonaContextType {
  currentPersona: UserPersona;
  personas: UserPersona[];
  setPersona: (persona: UserPersona) => void;
  isDev: boolean;
}

export const DevPersonaContext = createContext<DevPersonaContextType>({
  currentPersona: PROD_DEFAULT_PERSONA,
  personas: [],
  setPersona: () => {},
  isDev: false,
});

export const useDevPersona = (): DevPersonaContextType => useContext(DevPersonaContext);
