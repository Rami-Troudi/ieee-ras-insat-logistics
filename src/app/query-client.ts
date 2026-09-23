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
  // Member namespaces
  inventory: {
    all: ["inventory"] as const,
    list: (filters?: unknown) => ["inventory", "list", filters] as const,
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

  // Board / Admin namespaces
  boardRequests: {
    all: ["board", "requests"] as const,
    list: (filters?: unknown) => ["board", "requests", "list", filters] as const,
    detail: (id: string) => ["board", "requests", "detail", id] as const,
  },
  boardLoans: {
    all: ["board", "loans"] as const,
    list: (filters?: unknown) => ["board", "loans", "list", filters] as const,
    detail: (id: string) => ["board", "loans", "detail", id] as const,
  },
  boardInventory: {
    all: ["board", "inventory"] as const,
    list: (filters?: unknown) => ["board", "inventory", "list", filters] as const,
    detail: (id: string) => ["board", "inventory", "detail", id] as const,
    events: (itemId: string) => ["board", "inventory", "events", itemId] as const,
  },
  boardUsers: {
    all: ["board", "users"] as const,
    list: (filters?: unknown) => ["board", "users", "list", filters] as const,
    detail: (id: string) => ["board", "users", "detail", id] as const,
  },
  boardProjects: {
    all: ["board", "projects"] as const,
    list: (filters?: unknown) => ["board", "projects", "list", filters] as const,
    detail: (id: string) => ["board", "projects", "detail", id] as const,
  },
  boardAudits: {
    all: ["board", "audits"] as const,
    list: ["board", "audits", "list"] as const,
    detail: (id: string) => ["board", "audits", "detail", id] as const,
  },
  boardDiscipline: {
    all: ["board", "discipline"] as const,
    recommendations: ["board", "discipline", "recommendations"] as const,
    incidents: ["board", "discipline", "incidents"] as const,
    incident: (id: string) => ["board", "discipline", "incidents", id] as const,
    strikes: (userId?: string) => ["board", "discipline", "strikes", userId] as const,
    compensations: ["board", "discipline", "compensations"] as const,
  },
  boardInsights: {
    data: ["board", "insights", "data"] as const,
  },
  boardAuditLog: {
    all: ["board", "auditLog"] as const,
    list: (filters?: unknown) => ["board", "auditLog", "list", filters] as const,
  },
  boardAllocations: {
    all: ["board", "allocations"] as const,
    active: ["board", "allocations", "active"] as const,
  },
};
