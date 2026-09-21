import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QUERY_KEYS = {
  inventory: {
    all: ["inventory"] as const,
    list: (filters?: Record<string, unknown>) => ["inventory", "list", filters] as const,
    detail: (id: string) => ["inventory", "detail", id] as const,
  },
  requests: {
    all: ["requests"] as const,
    mine: ["requests", "mine"] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
  },
  loans: {
    all: ["loans"] as const,
    mine: ["loans", "mine"] as const,
    detail: (id: string) => ["loans", "detail", id] as const,
  },
  actionCenter: {
    queue: ["actionCenter", "queue"] as const,
  },
};
