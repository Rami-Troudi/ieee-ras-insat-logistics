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
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });
  const body = (await response.json().catch(() => ({}))) as {
    error?: { code?: string; message?: string };
  } & T;
  if (!response.ok)
    throw new ApiError(
      response.status,
      body.error?.code ?? "REQUEST_FAILED",
      body.error?.message ?? "Request failed"
    );
  return body;
}

const get = <T>(path: string) => api<T>(path);
const post = <T>(path: string, body: unknown, headers?: Record<string, string>) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body), headers });

export const remoteInventoryService = {
  listItems: (filters?: { search?: string; category?: string; availableOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (filters?.search) query.set("search", filters.search);
    if (filters?.category) query.set("category", filters.category);
    if (filters?.availableOnly) query.set("availableOnly", "true");
    return get<any[]>(`/api/v1/catalog${query.size ? `?${query}` : ""}`);
  },
  async getItem(id: string) {
    const items = await get<any[]>(`/api/v1/catalog/${encodeURIComponent(id)}`);
    return items as any;
  },
  async getCategories() {
    const items = await get<any[]>("/api/v1/catalog");
    return [...new Set(items.map((item) => item.category))].sort();
  },
};

export const remoteRequestService = {
  listUserRequests: async () => [] as any[],
  getRequest: async (_id: string) => null,
  async createRequest(_userId: string, payload: any) {
    const contactEmail = localStorage.getItem("ras_borrower_email") ?? "";
    let savedProfile: { name?: string; phone?: string; membership?: string } | null = null;
    try {
      const raw = localStorage.getItem("ras_borrower_profile");
      if (raw) savedProfile = JSON.parse(raw);
    } catch {
      // Ignore storage errors
    }
    const requestPayload = {
      ...payload,
      contactEmail,
      borrowerName: savedProfile?.name || cachedPersona.name,
      borrowerPhone: savedProfile?.phone || "",
      borrowerAffiliation: savedProfile?.membership || cachedPersona.affiliation,
    };
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(JSON.stringify({ contactEmail, payload }))
    );
    const payloadHash = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    const storageKey = `ras_request_retry:${payloadHash}`;
    let key: string | null = null;
    try {
      key = sessionStorage.getItem(storageKey);
    } catch {
      /* private browsing may block storage */
    }
    if (!key) {
      key = crypto.randomUUID();
      try {
        sessionStorage.setItem(storageKey, key);
      } catch {
        /* one request remains safe without a retry cache */
      }
    }
    return post<any>("/api/v1/requests", requestPayload, { "Idempotency-Key": key });
  },
  cancelRequest: async (_requestId: string) => {
    throw new ApiError(403, "FORBIDDEN", "Request changes are handled by the logistics desk");
  },
};

export const remoteLoanService = {
  listUserLoans: async () => [] as any[],
  getLoan: async (_id: string) => null,
};

export const remoteNotificationService = {
  listUserNotifications: async () => [] as any[],
  markAsRead: async (_id: string) => undefined,
  markAllAsRead: async () => undefined,
};

export const remoteProfileService = {
  getUserProfile: async () => {
    let savedProfile: { name?: string; phone?: string; membership?: string } | null = null;
    try {
      const raw = localStorage.getItem("ras_borrower_profile");
      if (raw) savedProfile = JSON.parse(raw);
    } catch {
      // Ignore storage errors
    }
    return {
      ...cachedPersona,
      name: savedProfile?.name || cachedPersona.name,
      phone: savedProfile?.phone || "",
      affiliation: (savedProfile?.membership as any) || cachedPersona.affiliation,
      status: "ACTIVE",
      strikesCount: 0,
      totalRequestsCount: 0,
      activeLoansCount: 0,
    } as any;
  },
  updateContactInfo: async (_userId: string, _data: unknown) =>
    ({ ...cachedPersona, phone: "" }) as any,
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

let cachedPersona: UserPersona = PROD_DEFAULT_PERSONA;
const listeners = new Set<(persona: UserPersona) => void>();
async function refreshSession() {
  let email = "";
  let savedProfile: { name?: string; phone?: string; membership?: string } | null = null;
  try {
    email = localStorage.getItem("ras_borrower_email") ?? "";
    const raw = localStorage.getItem("ras_borrower_profile");
    if (raw) savedProfile = JSON.parse(raw);
  } catch {
    /* storage may be disabled */
  }
  const boardContext =
    location.pathname.startsWith("/board") || location.pathname.startsWith("/auth/board-login");
  if (email && !boardContext) {
    const affiliation = (savedProfile?.membership as any) || "EXTERNAL";
    cachedPersona = {
      id: `borrower-${email}`,
      name: savedProfile?.name || "Borrower",
      email,
      role: "MEMBER",
      clearance: affiliation === "IEEE" ? "III" : affiliation === "AEROBOTIX" ? "II" : "I",
      affiliation,
      isProcessed: false,
      status: "ACTIVE",
      strikesCount: 0,
    };
    listeners.forEach((listener) => listener(cachedPersona));
    return cachedPersona;
  }
  try {
    const persona = await get<UserPersona>("/api/v1/me");
    cachedPersona = persona;
    listeners.forEach((listener) => listener(persona));
    return persona;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        email = localStorage.getItem("ras_borrower_email") ?? "";
        const raw = localStorage.getItem("ras_borrower_profile");
        if (raw) savedProfile = JSON.parse(raw);
      } catch {
        email = "";
      }
      const affiliation = (savedProfile?.membership as any) || "EXTERNAL";
      cachedPersona = email
        ? {
            id: `borrower-${email}`,
            name: savedProfile?.name || "Borrower",
            email,
            role: "MEMBER",
            clearance: affiliation === "IEEE" ? "III" : affiliation === "AEROBOTIX" ? "II" : "I",
            affiliation,
            isProcessed: false,
            status: "ACTIVE",
            strikesCount: 0,
          }
        : PROD_DEFAULT_PERSONA;
      listeners.forEach((listener) => listener(cachedPersona));
      return email ? cachedPersona : null;
    }
    throw error;
  }
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
    const name = input.name.trim();
    const affiliation = input.membership;
    const phone = input.phone.trim();

    let apiUser: any = null;
    try {
      const resp = await post<{ ok: boolean; user: any }>("/api/v1/auth/borrower", {
        firstName: input.firstName,
        lastName: input.lastName,
        name,
        email: normalizedEmail,
        phone,
        membership: affiliation,
      });
      apiUser = resp?.user;
    } catch (err) {
      console.warn("Remote borrower registration failed, falling back to local storage:", err);
    }

    const persona: UserPersona = {
      id: apiUser?.id ?? `borrower-${normalizedEmail}`,
      name,
      email: normalizedEmail,
      role: "MEMBER",
      clearance: affiliation === "IEEE" ? "III" : affiliation === "AEROBOTIX" ? "II" : "I",
      affiliation: (affiliation as any) || "EXTERNAL",
      isProcessed: false,
      status: "ACTIVE",
      strikesCount: 0,
    };

    const profile = {
      ...persona,
      phone,
      claimedAffiliation: affiliation,
      joinedDate: new Date().toISOString(),
      strikes: [],
      activeLoansCount: 0,
      totalRequestsCount: 0,
    };

    try {
      localStorage.setItem("ras_borrower_email", normalizedEmail);
      localStorage.setItem("ras_onboarding_completed", "true");
      localStorage.setItem(
        "ras_borrower_profile",
        JSON.stringify({
          firstName: input.firstName,
          lastName: input.lastName,
          name,
          email: normalizedEmail,
          phone,
          membership: affiliation,
        })
      );
    } catch {
      // Ignore storage errors
    }

    cachedPersona = persona;
    listeners.forEach((listener) => listener(persona));

    return { persona, profile: profile as any };
  },
  getCurrentUser: () => cachedPersona,
  getCurrentSession: () => refreshSession(),
  setSession: (persona: UserPersona) => {
    cachedPersona = { ...persona, status: "ACTIVE" };
    if (persona.role === "MEMBER" && persona.email) {
      localStorage.setItem("ras_borrower_email", persona.email.trim().toLowerCase());
      localStorage.setItem("ras_onboarding_completed", "true");
    }
    listeners.forEach((listener) => listener(cachedPersona));
  },
  clearSession: () => {
    localStorage.removeItem("ras_borrower_email");
    localStorage.removeItem("ras_borrower_profile");
    localStorage.removeItem("ras_onboarding_completed");
    localStorage.removeItem("ras_board_device_key");
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
            const digest = await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(operation)
            );
            const idempotencyKey = `op-${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
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
