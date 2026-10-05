# Gatherum — Campus Events, Reimagined

Gatherum is a college event platform for `@poornima.org` users. Students browse
and register for events (with waitlist + QR tickets), organizers create events
and check attendees in, and admins moderate users and platform settings.

## Architecture (read this first)

The **database owns business-critical logic**. The frontend displays, validates
for UX, calls RPCs, and handles results.

- **Frontend:** React 19 + Vite 6 + TypeScript + react-router-dom 7. No Redux —
  `AuthContext` (session/profile) plus per-page state. All backend calls go
  through `@supabase/supabase-js`; there is no custom REST layer except one
  Express endpoint (see below).
- **Backend:** Supabase Postgres 17 — tables, RLS policies, `SECURITY DEFINER`
  RPCs (`register_for_event`, `cancel_registration`, `check_in_by_ticket`,
  admin RPCs), triggers (waitlist promotion, seat counters, profile guard),
  and a `pg_cron` archival job. Migrations live in `supabase/migrations/`
  (numbered, idempotent, never edit applied ones).
- **Custom API:** `api/index.ts` is a single Express app deployed as a Vercel
  serverless function. It exposes only `POST /api/admin/reset-user-access`
  (admin sends a magic link to a user). Everything else is Supabase directly.

### Seat counting (one definition)

`taken = events.registered_count` (registered + attended occupy a seat),
`waitlist = events.waitlist_count`. Both are maintained by DB triggers — the
frontend never counts seats client-side.

## Setup

**Prerequisites:** Node 20+, Supabase CLI, a Supabase project.

```bash
npm install
cp .env.example .env   # fill in real values; NEVER commit .env
```

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | browser bundle | public Supabase config |
| `VITE_ALLOWED_EMAIL_DOMAIN` | browser bundle | signup domain hint (default `@poornima.org`) |
| `VITE_ENABLE_GOOGLE_OAUTH` | browser bundle | `true` shows the Google button (default hidden) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Express API + scripts (bypasses RLS) |
| `APP_URL` | server only | CORS allowlist + redirect base for `/api/*` |
| `PORT` | unused on Vercel | kept for a future standalone server |

```bash
supabase link --project-ref <ref>
supabase db reset   # applies migrations 0001..0017 + supabase/seed.sql
npm run dev         # frontend at http://localhost:5173
```

### First admin (one-time per deployment)

Role changes require an existing admin, so bootstrap the first one:

1. Sign up normally in the app.
2. In the Supabase SQL Editor run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
   ```
3. Refresh — `/admin` is now available. All later role changes go through the
   Admin UI (audited).

## Roles & flows

- **Anonymous:** browse events/home/archives, view event details.
- **Student:** register → `registered` (or `waitlisted` when full) →
  QR ticket → check-in marks `attended`. Cancel via `cancel_registration`
  (frees the seat; earliest waitlisted student is promoted atomically).
  Re-registering while active is idempotent — status/queue position unchanged.
- **Organizer:** create/edit/publish events, upload posters, export
  participants to Excel, scan QR check-ins (ticket must belong to the page's
  event or it is rejected with `event_mismatch`).
- **Event team:** volunteers help check in (no UI yet — DB supports it).
- **Admin:** role changes, bans, platform settings, audit log, event delete,
  magic-link reset.
- **Banned:** blocked in UI *and* rejected by `/api/*` (403).
- **Incomplete profile:** forced to `/profile` before using the app.

Events auto-archive 1 hour after ending (`pg_cron` + client filter).

## Google OAuth status

Hidden by default. To enable: turn on the Google provider in
Supabase Auth → Providers (allow-list the app URL), then set
`VITE_ENABLE_GOOGLE_OAUTH=true`. Non-domain Google accounts are rejected by
the signup trigger with a clear error.

## Deploy (Vercel)

Set server env vars in Project Settings → Environment Variables
(`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`/`SUPABASE_ANON_KEY` or the
`VITE_` equivalents, `APP_URL`). `/api/*` rewrites to the serverless
function; everything else serves the SPA (`vercel.json`).

## Implemented vs. DB-only (honest list)

Fully wired UI: events CRUD, register/waitlist/cancel, QR tickets, QR +
manual check-in, Excel export, roles/bans/settings/audit, magic-link reset.

DB tables/RPCs exist but have **no UI yet**: `announcements`,
`feedbacks`, `event_templates`, `event_team` invites, `calendar_follows`,
`admin_reconcile_event_counters`, realtime seat updates.

## Verify

```bash
npm run lint       # tsc --noEmit (strict)
npm test           # vitest unit suite
npm run find-bugs  # tsc + eslint (CI gate, also in .github/workflows/lint.yml)
npm run build      # production build
node test_rls.mjs  # RLS/RPC matrix — needs TEST_PASSWORD env + a DEV project
```

DB-level regression proof: `supabase/tests/phase0_admin_rpc_trigger.sql`
(admin RPCs vs. trigger, check-in binding) — run after `supabase db reset`.

## Manual action reminders

- If `.env` (service_role key) ever left this machine, **rotate the key** in
  Supabase Project Settings → API.
- `supabase db push` is required to apply migrations 0012–0017 to production.
- Table-level `GRANT ALL TO anon/authenticated` is still in place (function
  grants were tightened); narrowing it further needs a live-DB test first.
