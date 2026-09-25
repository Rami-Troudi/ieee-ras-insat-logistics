import React, { useState, useEffect } from "react";
import { UserPersona } from "@/types";
import { PRESET_PERSONAS } from "@/constants/personas";
import { DevPersonaContext } from "@/hooks/useDevPersona";
import { SessionContext, PROD_DEFAULT_PERSONA } from "@/hooks/useSession";
import { authService } from "@/services";

export { PRESET_PERSONAS, PROD_DEFAULT_PERSONA };

export const DevPersonaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDev = import.meta.env.MODE !== "production";

  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    const session = authService.getCurrentUser();
    return session.id === PROD_DEFAULT_PERSONA.id
      ? (PRESET_PERSONAS.find((persona) => persona.role === "MEMBER") ?? session)
      : session;
  });

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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      const isCompleted = localStorage.getItem("ras_onboarding_completed");
      const hasEmail = localStorage.getItem("ras_borrower_email");
      const isBoardRoute =
        window.location.pathname.startsWith("/board") ||
        window.location.pathname.startsWith("/auth/board-login");
      const params = new URLSearchParams(window.location.search);
      const hasAuthParam = params.get("auth") === "login" || params.get("login") === "true";

      if (isBoardRoute) return false;
      if (hasAuthParam) return true;
      if (isCompleted || hasEmail) return false;
      return true;
    } catch {
      return false;
    }
  });

  const openBorrowerAuthModal = React.useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeBorrowerAuthModal = React.useCallback(() => {
    setIsAuthModalOpen(false);
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("auth") || url.searchParams.has("login")) {
          url.searchParams.delete("auth");
          url.searchParams.delete("login");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
      }
    } catch {
      // Ignore URL manipulation errors
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsAuthModalOpen(true);
    window.addEventListener("ras:open-borrower-auth", handleOpen);
    return () => window.removeEventListener("ras:open-borrower-auth", handleOpen);
  }, []);

  return (
    <DevPersonaContext.Provider
      value={{
        currentPersona,
        personas: isDev ? PRESET_PERSONAS : [],
        setPersona: handleSetPersona,
        isDev,
      }}
    >
      <SessionContext.Provider
        value={{
          currentPersona,
          isDev,
          isLoading: false,
          isAuthModalOpen,
          openBorrowerAuthModal,
          closeBorrowerAuthModal,
        }}
      >
        {children}
      </SessionContext.Provider>
    </DevPersonaContext.Provider>
  );
};
