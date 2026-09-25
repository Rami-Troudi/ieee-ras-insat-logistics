import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/query-client";
import { SessionProvider } from "@/hooks/SessionProvider";
import { BorrowCartProvider } from "@/features/cart/BorrowCartProvider";

import { DevPersonaProvider } from "@/dev/DevPersonaProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const ProviderComponent =
    import.meta.env.MODE !== "production" ? DevPersonaProvider : SessionProvider;

  return (
    <QueryClientProvider client={queryClient}>
      <ProviderComponent>
        <BorrowCartProvider>{children}</BorrowCartProvider>
      </ProviderComponent>
    </QueryClientProvider>
  );
};
