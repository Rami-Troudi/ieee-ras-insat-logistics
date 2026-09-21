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
    categories: ["inventory", "categories"] as const,
  },
  requests: {
    all: ["requests"] as const,
    mine: (userId: string) => ["requests", "mine", userId] as const,
    detail: (id: string) => ["requests", "detail", id] as const,
  },
  loans: {
    all: ["loans"] as const,
    mine: (userId: string) => ["loans", "mine", userId] as const,
    detail: (id: string) => ["loans", "detail", id] as const,
  },
  notifications: {
    mine: (userId: string) => ["notifications", "mine", userId] as const,
  },
  profile: {
    detail: (userId: string) => ["profile", "detail", userId] as const,
  },
  projects: {
    active: ["projects", "active"] as const,
  },
  favorites: {
    mine: (userId: string) => ["favorites", "mine", userId] as const,
  },
  actionCenter: {
    queue: ["actionCenter", "queue"] as const,
  },
};
