import React, { useState, useEffect } from "react";
import { UserPersona } from "@/types";
import { SessionContext, PROD_DEFAULT_PERSONA } from "./useSession";
import { authService } from "@/services";

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
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() =>
    initialPersona.id === PROD_DEFAULT_PERSONA.id ? authService.getCurrentUser() : initialPersona
  );

  useEffect(() => {
    authService.getCurrentSession().then((session) => {
      if (session) {
        setCurrentPersona(session);
      }
    });

    const unsubscribe = authService.subscribeSession((session) => {
      setCurrentPersona(session);
    });
    return unsubscribe;
  }, []);

  return (
    <SessionContext.Provider value={{ currentPersona, isDev }}>{children}</SessionContext.Provider>
  );
};
