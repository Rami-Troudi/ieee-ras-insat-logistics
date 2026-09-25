import type { Context } from "hono";
import { createAuth, trustedAuthOrigin } from "./auth";
import type { AppUser, Env } from "./env";
type AppContext = Context<{ Bindings: Env; Variables: { actor: AppUser } }>;

export async function resolveIdentity(c: AppContext) {
  try {
    const auth = createAuth(c.env, trustedAuthOrigin(c.env, c.req.url));
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session?.user?.id) {
      const user = await c.env.DB.prepare("SELECT * FROM app_users WHERE id=?")
        .bind(session.user.id)
        .first<AppUser>();
      if (user) return user;
    }
  } catch {
    // continue to direct session lookup fallback
  }

  const cookie = c.req.header("Cookie") ?? "";
  const tokenMatch = cookie.match(/(?:better-auth\.session_token|ras_staff_session)=([^;]+)/);
  const token = tokenMatch?.[1]?.trim() || c.req.header("x-device-key");
  if (token) {
    const sessionRow = await c.env.DB.prepare(
      "SELECT userId FROM session WHERE token=? AND expiresAt > ?"
    )
      .bind(token, Date.now())
      .first<{ userId: string }>();
    if (sessionRow?.userId) {
      const user = await c.env.DB.prepare("SELECT * FROM app_users WHERE id=?")
        .bind(sessionRow.userId)
        .first<AppUser>();
      if (user) return user;
    }
  }
  return null;
}

export async function requireMember(c: AppContext) {
  const user = await resolveIdentity(c);
  if (!user || user.status !== "ACTIVE" || user.role !== "MEMBER") return null;
  return user;
}

export async function requireBoard(c: AppContext, fresh = false) {
  const user = await resolveIdentity(c);
  if (!user || user.status !== "ACTIVE" || !["OPERATOR", "SUPERADMIN"].includes(user.role))
    return null;
  const challenge = await c.env.DB.prepare(
    "SELECT expires_at,fresh_until,revoked_at FROM staff_sessions WHERE user_id=?"
  )
    .bind(user.id)
    .first<{ expires_at: number; fresh_until: number; revoked_at: number | null }>();
  if (!challenge || challenge.revoked_at || challenge.expires_at <= Date.now()) return null;
  if (fresh && challenge.fresh_until <= Date.now()) return null;
  return user;
}
