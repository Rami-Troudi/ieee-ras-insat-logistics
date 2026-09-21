import React from "react";
import { UserPersona } from "@/types";
import { SessionContext, PROD_DEFAULT_PERSONA } from "./useSession";

export interface SessionProviderProps {
  children: React.ReactNode;
  initialPersona?: UserPersona;
  isDev?: boolean;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  initialPersona = PROD_DEFAULT_PERSONA,
  isDev = false,
}) => {
  return (
    <SessionContext.Provider value={{ currentPersona: initialPersona, isDev }}>
      {children}
    </SessionContext.Provider>
  );
};
