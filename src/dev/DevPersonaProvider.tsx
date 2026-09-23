import React, { useState, useEffect } from "react";
import { UserPersona } from "@/types";
import { PRESET_PERSONAS } from "@/constants/personas";
import { DevPersonaContext } from "@/hooks/useDevPersona";
import { SessionContext, PROD_DEFAULT_PERSONA } from "@/hooks/useSession";
import { authService } from "@/services";

export { PRESET_PERSONAS, PROD_DEFAULT_PERSONA };

export const DevPersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDev = import.meta.env.DEV;

  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() =>
    authService.getCurrentUser()
  );

  useEffect(() => {
    const unsubscribe = authService.subscribeSession((session) => {
      setCurrentPersona(session);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isDev) {
      try {
        localStorage.setItem("ras_dev_persona_id", currentPersona.id);
      } catch {
        // Ignore storage exceptions in restricted environments
      }
    }
  }, [currentPersona, isDev]);

  const handleSetPersona = React.useCallback(
    (persona: UserPersona) => {
      if (isDev) {
        authService.setSession(persona);
        setCurrentPersona(persona);
      }
    },
    [isDev]
  );

  return (
    <DevPersonaContext.Provider
      value={{
        currentPersona,
        personas: isDev ? PRESET_PERSONAS : [],
        setPersona: handleSetPersona,
        isDev,
      }}
    >
      <SessionContext.Provider value={{ currentPersona, isDev }}>
        {children}
      </SessionContext.Provider>
    </DevPersonaContext.Provider>
  );
};
