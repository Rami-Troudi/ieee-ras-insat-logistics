# Production deployment on Vercel Hobby

The application is prepared for Vercel Functions and Turso/libSQL. A production deployment still requires a Vercel project and production environment variables; never copy the test values from `.dev.vars.example` into production.

## One-time project setup

1. Import this GitHub repository into the chapter's Vercel account. Use the Vite framework preset and keep the default build command `npm run build` and output directory `dist`.
2. Create a Turso database for production and a separate one for Preview. Keep their URLs and auth tokens separate.
3. Add these Vercel environment variables for Production and Preview as applicable: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET` (at least 32 random bytes), `APP_ORIGIN`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `TURNSTILE_SECRET_KEY`, `TURNSTILE_SITE_KEY`, and `CRON_SECRET`. Set `APP_ORIGIN` to the deployment's canonical HTTPS URL. Do not put secrets in Git or build logs.
4. Add a Turnstile widget for the canonical hostname. Verify the sender address in Brevo and test email delivery to chapter and university mailboxes.
5. Apply the schema to each database with `TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:migrate`. Run this from a trusted machine or CI secret context. Applying migrations twice is safe.
6. Bootstrap the first superadmin with `npm run bootstrap:superadmin` from a trusted machine configured only with the production database. The command requires an explicit confirmation and refuses to create a second initial superadmin.
7. Deploy a Preview build and complete the release checks below before promoting the same commit to Production.

## Release checks

- `npm run typecheck`, `npm test`, and `npm run build` pass.
- `/api/health` returns `{"status":"ok"}` and `/api/v1/config` exposes only the public Turnstile site key.
- Verify email-link sign-in, single-use replay rejection, session refresh, and staff's separate six-digit email challenge.
- Verify members cannot read another member's request/loan, cannot call board routes, and cannot request classes other than C or E.
- Verify board inventory visibility can include other classes without making them requestable; test approvals, allocation expiry, handover, return, retry behavior, and audit history.
- Run borrower and board flows at desktop and mobile viewport sizes using real accounts in Preview.
- Test cron authentication at `/api/cron/maintenance` and observe its successful scheduled run in Vercel.
- Confirm the deployed canonical URL and API work independently of the developer's computer.

## Operating limits and recovery

Vercel Hobby permits scheduled functions at most once daily, with timing that can vary. The API also releases expired allocations lazily when the catalogue or board inventory is accessed, and the handover endpoint rejects expired allocations. Do not depend on exact five-minute expiry timing.

Turso is the durable data store. Keep an independent database export on a regular schedule and rehearse restoring it to a separate database before relying on it. Vercel and Turso free plans do not provide an uptime SLA; check current quotas and terms before launch. Production starts with empty business data; board operators enter and verify inventory through the application.

## Local development

Copy `.env.example` to `.env.local`, replace placeholders with provider test values, then run `npm run dev:vercel`. Use a local `file:` database only for disposable development. Never point a local process at production data.
