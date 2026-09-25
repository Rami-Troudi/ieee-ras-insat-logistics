import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import type { Env } from "./env";
import { escapeHtml, sendEmail } from "./email";
import { authSchema } from "./database";

export function trustedAuthOrigin(env: Env, requestUrl: string) {
  const requestOrigin = new URL(requestUrl);
  const allowedHosts = new Set([env.VERCEL_URL, env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean));
  const isLocal = ["localhost", "127.0.0.1"].includes(requestOrigin.hostname);
  if (env.APP_ORIGIN && requestOrigin.origin !== new URL(env.APP_ORIGIN).origin && !isLocal)
    throw new Error("Request host is not the configured application address");
  if (!env.APP_ORIGIN && !isLocal && !allowedHosts.has(requestOrigin.host))
    throw new Error("Request host is not a Vercel deployment address");
  const origin =
    env.APP_ORIGIN && !isLocal ? new URL(env.APP_ORIGIN) : new URL(requestOrigin.origin);
  if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash)
    throw new Error("APP_ORIGIN must be an origin without a path");
  if (
    origin.protocol !== "https:" &&
    origin.hostname !== "localhost" &&
    origin.hostname !== "127.0.0.1"
  )
    throw new Error("APP_ORIGIN must use HTTPS");
  return origin.origin;
}

export function createAuth(env: Env, origin = env.APP_ORIGIN ?? "http://localhost:8787") {
  return betterAuth({
    appName: "IEEE RAS INSAT Logistics",
    baseURL: origin,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(env.AUTH_DATABASE, { provider: "sqlite", schema: authSchema }),
    trustedOrigins: [origin],
    advanced: {
      useSecureCookies: true,
      defaultCookieAttributes: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    },
    session: {
      expiresIn: 390 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: { enabled: false },
    },
    rateLimit: { enabled: true, window: 60, max: 10, storage: "database" },
    emailAndPassword: { enabled: false },
    plugins: [
      magicLink({
        expiresIn: 10 * 60,
        storeToken: "hashed",
        disableSignUp: true,
        sendMagicLink: async ({ email, url }) => {
          await sendEmail(
            env,
            email,
            "Your IEEE RAS INSAT Logistics sign-in link",
            `<p>Use this single-use link within 10 minutes to sign in:</p><p><a href="${escapeHtml(url)}">Sign in</a></p><p>If you did not request this email, you can ignore it.</p>`
          );
        },
      }),
    ],
  });
}
