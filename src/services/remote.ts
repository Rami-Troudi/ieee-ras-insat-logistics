import { PROD_DEFAULT_PERSONA } from "@/hooks/useSession";
import type { UserPersona } from "@/types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("text/html")) {
    throw new ApiError(404, "NOT_FOUND", "API endpoint not found");
  }
  const body = (await response.json().catch(() => ({}))) as {
    error?: { code?: string; message?: string };
  } & T;
  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.message ?? "Request failed"
    );
  }
  return body;
}

const get = <T>(path: string) => api<T>(path);
const post = <T>(path: string, body: unknown, headers?: Record<string, string>) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body), headers });

const digestKey = async (value: unknown) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(value))
  );
  return `op-${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
};

export const remoteInventoryService = {
  listItems: (filters?: { search?: string; category?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (filters?.search) query.set("search", filters.search);
    if (filters?.category) query.set("category", filters.category);
    if (filters?.availableOnly) query.set("availableOnly", "true");
    return get<any[]>(`/api/v1/catalog${query.size ? `?${query}` : ""}`);
  },
  getItem: (id: string) => get<any>(`/api/v1/catalog/${encodeURIComponent(id)}`),
  async getCategories() {
    const items = await get<any[]>("/api/v1/catalog");
    return [...new Set(items.map((item) => item.category))].sort();
  },
};

export const remoteRequestService = {
  listUserRequests: () => get<any[]>("/api/v1/requests"),
  getRequest: (id: string) => get<any>(`/api/v1/requests/${encodeURIComponent(id)}`),
  async createRequest(_userId: string, payload: any) {
    const email =
      cachedPersona.email?.trim().toLowerCase() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("ras_borrower_email")?.trim().toLowerCase()
        : "") ||
      "";
    if (!email) throw new ApiError(401, "UNAUTHENTICATED", "Sign in to submit a request");
    const requestPayload = {
      ...payload,
      contactEmail: email,
      borrowerName: cachedPersona.name || "Student Borrower",
      borrowerAffiliation: cachedPersona.affiliation || "EXTERNAL",
    };
    const key = await digestKey({ type: "borrow-request", email, payload });
    return post<any>("/api/v1/requests", requestPayload, { "Idempotency-Key": key });
  },
  cancelRequest: (requestId: string) =>
    api<any>(`/api/v1/requests/${encodeURIComponent(requestId)}`, { method: "DELETE" }),
};

export const remoteLoanService = {
  listUserLoans: () => get<any[]>("/api/v1/loans"),
  getLoan: (id: string) => get<any>(`/api/v1/loans/${encodeURIComponent(id)}`),
};

export const remoteNotificationService = {
  listUserNotifications: () => get<any[]>("/api/v1/notifications"),
  markAsRead: async (id: string) => {
    await api<void>(`/api/v1/notifications/${encodeURIComponent(id)}`, { method: "PATCH" });
  },
  markAllAsRead: async () => {
    await post<void>("/api/v1/notifications/read-all", {});
  },
};

export const remoteProfileService = {
  getUserProfile: () => get<any>("/api/v1/profile"),
  updateContactInfo: (_userId: string, data: unknown) =>
    api<any>("/api/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  resetDemoData: async () => {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Production data cannot be reset from the member interface"
    );
  },
};

export const remoteProjectService = {
  listActiveProjects: () => get<any[]>("/api/v1/projects"),
  listMine: () => get<any[]>("/api/v1/projects/mine"),
};

function getStoredBorrowerPersona(): UserPersona | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ras_borrower_persona");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) return parsed;
    }
    const profileRaw = localStorage.getItem("ras_borrower_profile");
    if (profileRaw) {
      const p = JSON.parse(profileRaw);
      if (p && p.email) {
        return {
          id: p.id || `borrower-${p.email.toLowerCase()}`,
          name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Member",
          email: p.email.toLowerCase(),
          role: "MEMBER",
          clearance: "I",
          affiliation: p.membership || p.affiliation || "IEEE",
          isProcessed: true,
          status: "ACTIVE",
          strikesCount: 0,
        };
      }
    }
  } catch {}
  return null;
}

let cachedPersona: UserPersona = getStoredBorrowerPersona() ?? PROD_DEFAULT_PERSONA;
const listeners = new Set<(persona: UserPersona) => void>();

async function refreshSession() {
  try {
    const persona = await get<UserPersona>("/api/v1/me");
    if (persona && persona.id && persona.role) {
      cachedPersona = persona;
      try {
        localStorage.setItem("ras_borrower_persona", JSON.stringify(persona));
      } catch {}
      listeners.forEach((listener) => listener(persona));
      return persona;
    }
  } catch (_error) {
    // If server session is not found or expired, keep stored borrower session from localStorage
  }
  const fallback = getStoredBorrowerPersona() ?? PROD_DEFAULT_PERSONA;
  cachedPersona = fallback;
  listeners.forEach((listener) => listener(cachedPersona));
  return fallback;
}

export const remoteAuthService = {
  async registerMember(input: {
    firstName?: string;
    lastName?: string;
    name: string;
    email: string;
    phone: string;
    membership: string;
  }) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const response = await post<{
      ok: boolean;
      user: UserPersona;
    }>("/api/v1/auth/borrower", {
      firstName: input.firstName,
      lastName: input.lastName,
      name: input.name.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      membership: input.membership,
    });

    const persona = response.user;
    cachedPersona = persona;
    try {
      localStorage.setItem("ras_borrower_persona", JSON.stringify(persona));
      localStorage.setItem("ras_borrower_email", normalizedEmail);
      localStorage.setItem("ras_onboarding_completed", "true");
      localStorage.setItem(
        "ras_borrower_profile",
        JSON.stringify({
          id: persona.id,
          name: input.name.trim(),
          firstName: input.firstName,
          lastName: input.lastName,
          email: normalizedEmail,
          membership: input.membership,
          phone: input.phone.trim(),
        })
      );
    } catch {}
    listeners.forEach((listener) => listener(cachedPersona));

    return {
      persona,
      profile: {
        ...persona,
        phone: input.phone.trim(),
        claimedAffiliation: input.membership,
        joinedDate: new Date().toISOString(),
        strikes: [],
        activeLoansCount: 0,
        totalRequestsCount: 0,
      },
    };
  },
  getCurrentUser: () => cachedPersona,
  getCurrentSession: () => refreshSession(),
  clearSession: () => {
    try {
      localStorage.removeItem("ras_borrower_persona");
      localStorage.removeItem("ras_borrower_profile");
      localStorage.removeItem("ras_borrower_email");
      localStorage.removeItem("ras_onboarding_completed");
    } catch {}
    void api("/api/auth/sign-out", { method: "POST" })
      .catch(() => undefined)
      .finally(() => {
        cachedPersona = PROD_DEFAULT_PERSONA;
        listeners.forEach((listener) => listener(cachedPersona));
      });
  },

  subscribeSession(callback: (persona: UserPersona) => void) {
    listeners.add(callback);
    const onFocus = () => {
      void refreshSession().catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    return () => {
      listeners.delete(callback);
      window.removeEventListener("focus", onFocus);
    };
  },
};

function boardProxy(service: string) {
  return new Proxy(
    {},
    {
      get: (_target, property) => {
        if (typeof property !== "string") return undefined;
        return async (...args: unknown[]) => {
          const payload =
            args[0] && typeof args[0] === "object"
              ? { ...(args[0] as Record<string, unknown>) }
              : args[0];
          const idempotent = ["confirmHandover", "confirmReturn"].includes(property);
          const nextArgs = [...args];
          if (payload && typeof payload === "object") {
            const operation = JSON.stringify({ service, method: property, payload });
            const idempotencyKey = await digestKey(operation);
            nextArgs[0] = {
              ...(payload as Record<string, unknown>),
              ...(idempotent ? { idempotencyKey } : {}),
            };
          }
          return post(`/api/v1/board/rpc`, { service, method: property, args: nextArgs });
        };
      },
    }
  );
}

export const remoteBoardAllocationService = boardProxy("allocation");
export const remoteBoardRequestService = boardProxy("request");
export const remoteBoardLoanService = boardProxy("loan");
export const remoteBoardInventoryService = boardProxy("inventory");
export const remoteBoardUserService = boardProxy("user");
export const remoteBoardProjectService = boardProxy("project");
export const remoteBoardAuditService = boardProxy("audit");
export const remoteBoardDisciplineService = boardProxy("discipline");
export const remoteBoardInsightsService = boardProxy("insights");
export const remoteBoardExportService = boardProxy("export");
export const remoteBoardAuditLogService = boardProxy("auditLog");
