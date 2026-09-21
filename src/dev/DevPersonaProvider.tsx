import React, { useState, useEffect } from "react";
import { UserPersona } from "@/types";
import { PRESET_PERSONAS } from "@/constants/personas";
import { DevPersonaContext } from "@/hooks/useDevPersona";
import { SessionContext, PROD_DEFAULT_PERSONA } from "@/hooks/useSession";

export { PRESET_PERSONAS, PROD_DEFAULT_PERSONA };

export const DevPersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDev = import.meta.env.DEV;

  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    if (!isDev) {
      return PROD_DEFAULT_PERSONA;
    }
    try {
      const saved = localStorage.getItem("ras_dev_persona_id");
      const found = PRESET_PERSONAS.find((p) => p.id === saved);
      return found || PRESET_PERSONAS[0];
    } catch {
      return PRESET_PERSONAS[0];
    }
  });

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
