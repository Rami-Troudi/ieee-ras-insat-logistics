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
    initialPersona.id === PROD_DEFAULT_PERSONA.id ? PROD_DEFAULT_PERSONA : initialPersona
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .getCurrentSession()
      .then((session) => {
        setCurrentPersona(session ?? PROD_DEFAULT_PERSONA);
      })
      .catch(() => setCurrentPersona(PROD_DEFAULT_PERSONA))
      .finally(() => setIsLoading(false));

    const unsubscribe = authService.subscribeSession((session) => {
      setCurrentPersona(session ?? PROD_DEFAULT_PERSONA);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <SessionContext.Provider value={{ currentPersona, isDev, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};
