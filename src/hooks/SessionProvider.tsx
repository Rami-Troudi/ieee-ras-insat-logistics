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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    try {
      if (typeof window === "undefined") return false;
      const isCompleted = localStorage.getItem("ras_onboarding_completed");
      const hasEmail = localStorage.getItem("ras_borrower_email");
      const activeUserId = localStorage.getItem("ras_active_user_id");
      const isBoardRoute =
        window.location.pathname.startsWith("/board") ||
        window.location.pathname.startsWith("/auth/board-login");
      const params = new URLSearchParams(window.location.search);
      const hasAuthParam = params.get("auth") === "login" || params.get("login") === "true";

      if (isBoardRoute) return false;
      if (hasAuthParam) return true;
      if (isCompleted || hasEmail || activeUserId) return false;
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

    const handleOpen = () => setIsAuthModalOpen(true);
    window.addEventListener("ras:open-borrower-auth", handleOpen);

    return () => {
      unsubscribe();
      window.removeEventListener("ras:open-borrower-auth", handleOpen);
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{
        currentPersona,
        isDev,
        isLoading,
        isAuthModalOpen,
        openBorrowerAuthModal,
        closeBorrowerAuthModal,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
