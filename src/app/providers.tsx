import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/query-client";
import { SessionProvider } from "@/hooks/SessionProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

// In development, dynamically load DevPersonaProvider so dev personas and localStorage logic
// are completely isolated from the production bundle
const DevPersonaProvider = import.meta.env.DEV
  ? React.lazy(() =>
      import("@/dev/DevPersonaProvider").then((m) => ({ default: m.DevPersonaProvider }))
    )
  : null;

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  if (DevPersonaProvider) {
    return (
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={<SessionProvider>{children}</SessionProvider>}>
          <DevPersonaProvider>{children}</DevPersonaProvider>
        </React.Suspense>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};
