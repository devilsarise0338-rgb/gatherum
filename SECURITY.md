# SECURITY.md — Gatherum Threat Model

This document describes the security controls implemented in the database schema
(`supabase/migrations/`), what threats they address, and what is explicitly **out
of scope** for this schema. Read this before deploying to production.

---

## Threat Model: What Is Covered

### 1. SQL Injection
**Risk**: An attacker crafts input that breaks out of a query string and executes
arbitrary SQL.

**Controls**:
- All client queries go through PostgREST (Supabase's REST API), which uses
  fully parameterised queries for standard `.select()`, `.insert()`, etc. calls.
- All `SECURITY DEFINER` functions (`0003`) use PL/pgSQL variables and
  `INSERT ... VALUES (param1, param2, ...)` — never string concatenation.
- Any `EXECUTE` within a function uses `USING` clause binding or `format()` with
  `%L` / `%I` literals — never raw user input interpolated into an SQL string.
- Text fields have `CHECK (char_length(x) <= N)` constraints, limiting the
  blast radius of oversized payloads even if injection were somehow attempted.

---

### 2. Privilege Escalation (Horizontal & Vertical)
**Risk**: A student upgrades their own role to `organizer` or `admin`, or one
organizer gains access to another organizer's data.

**Controls**:
- `role` column uses `role_enum` (a Postgres enum) — the database rejects any
  value not in `('student', 'organizer', 'admin')` at the type level.
- The RLS UPDATE policy on `profiles` contains a `with check` clause that
  explicitly asserts `role = old.role` — a student cannot change their own role
  via a plain UPDATE even if the RLS policy itself had a bug.
- Role changes exclusively go through `set_user_role()` (SECURITY DEFINER),
  which performs an **internal** DB lookup to verify the caller is an admin —
  not a JWT claim check, which could be stale or forged.
- Organizers are scoped to their own events via `organizer_id = auth.uid()`
  `with check` clauses on event insert/update policies.

---

### 3. Insecure Direct Object Reference (IDOR)
**Risk**: A user guesses or enumerates another user's resource IDs (registrations,
tickets, profiles) and accesses or modifies them.

**Controls**:
- All tables use random UUID primary keys (`gen_random_uuid()`), not sequential
  integers, so IDs cannot be enumerated by incrementing a counter.
- Ticket IDs are generated as `encode(gen_random_bytes(18), 'base64')` — 144 bits
  of entropy, not derivable from any other observable value.
- RLS `SELECT` policies ensure each user sees only their own rows:
  - `profiles`: `auth.uid() = id`
  - `registrations`: `student_id = auth.uid()` (students) / event ownership join (organizers)
  - `feedbacks`: student sees own rows; organizer sees only their events' feedback
- `check_in_ticket()` verifies the scanning organizer owns the event before
  marking a ticket as attended.

---

### 4. Race Conditions / Overbooking
**Risk**: Two students register simultaneously for the last spot; both succeed,
exceeding event capacity.

**Controls**:
- `register_for_event()` (SECURITY DEFINER, `0003`) opens the transaction,
  issues `SELECT ... FOR UPDATE` on the event row, then counts registrations.
  The row lock serialises all concurrent calls for the same event.
- Direct `INSERT` into `registrations` from any client role is blocked by RLS
  (no INSERT policy exists; RLS is deny-by-default once enabled). The only code
  path that creates registrations is the locked RPC.
- `promote_from_waitlist()` uses `FOR UPDATE SKIP LOCKED` to prevent two
  concurrent cancellations from both promoting the same waitlisted student.
- The `UNIQUE (event_id, student_id)` constraint is the final safety net — even
  if the locks fail, a duplicate registration attempt raises a constraint error
  rather than silently succeeding.

---

### 5. RLS Bypass via Direct Table Access
**Risk**: A client calls `supabase.from('registrations').insert(...)` directly,
bypassing application-level capacity checks.

**Controls**:
- RLS is enabled on **every** table (including `audit_log` and
  `platform_settings`), not just the ones that "matter."
- The `registrations` table has **no INSERT RLS policy** for any client role —
  default-deny applies and the insert is rejected with a permission error.
- SECURITY DEFINER functions (which bypass RLS intentionally and safely) are the
  only permitted write paths for registrations, check-ins, role changes, and bans.

---

### 6. Auth Domain Bypass
**Risk**: An attacker calls the Supabase Auth API directly (bypassing the
frontend's Magic Link form) with an arbitrary email domain, creating a valid
account and JWT.

**Controls**:
- `handle_new_user()` is a trigger on `auth.users INSERT` that reads
  `platform_settings.allowed_email_domain` and raises an exception if the new
  user's email domain doesn't match.
- This trigger fires at the Postgres level — it cannot be bypassed by a raw API
  call to `POST /auth/v1/otp` or Google OAuth, because both paths create a row
  in `auth.users`, which fires the trigger.
- Google SSO-created accounts go through the **same** `auth.users` INSERT trigger
  — there is no separate, laxer code path for OAuth signups.

---

### 7. search_path Hijacking
**Risk**: A malicious user creates a schema that shadows system functions, causing
a `SECURITY DEFINER` function to call the attacker's version instead.

**Controls**:
- Every `SECURITY DEFINER` function is defined with `SET search_path = public`,
  explicitly pinning the name resolution scope. This prevents any schema created
  by a regular user from intercepting function calls.

---

### 8. Audit Trail Tampering
**Risk**: An actor (including a malicious admin) deletes or modifies audit_log
entries to cover their tracks.

**Controls**:
- `audit_log` has RLS enabled with **no UPDATE or DELETE policies** for any role
  including admins. Once a row is written, it cannot be modified or deleted via
  the client API.
- Only `SECURITY DEFINER` functions (which run as the DB owner) can INSERT into
  `audit_log`. No client role has a direct INSERT grant.

---

### 9. Platform Settings Tampering
**Risk**: A student or organizer disables global signups, enables maintenance mode,
or weakens the email domain restriction.

**Controls**:
- `platform_settings` UPDATE/DELETE policies are restricted to `role = 'admin'`
  via a server-side profiles lookup.

---

## First-Admin Bootstrap

The first administrator cannot use the `set_user_role()` function (which requires
an existing admin to call it). The one-time bootstrap is:

```sql
-- Run once in the Supabase SQL Editor after signing up:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'yourname@college.edu';
```

This step:
- Requires direct Supabase project access (SQL Editor or psql with service role).
- Should be performed exactly once per deployment.
- Should **not** be scripted into a seed file that could be re-run in production.
- All subsequent role changes should use `set_user_role()` so they appear in the
  audit log.

---

## Out of Scope

The following are **not** addressed by this schema and must be handled at other
layers of the stack:

| Concern | Where to Address |
|---|---|
| DDoS / volumetric attacks | CDN / WAF layer (Cloudflare, AWS Shield, etc.) |
| HTTP-level request smuggling | Reverse proxy / hosting platform |
| Dependency vulnerabilities in frontend packages | `npm audit`, Dependabot |
| Supabase platform-level vulnerabilities | Supabase's own security programme |
| XSS / script injection in rendered HTML | Frontend rendering layer (sanitize before rendering rich text) |
| Client-side secret exposure (API keys in JS bundle) | Use `VITE_` prefix for anon key only; never ship service_role key to frontend |
| Email deliverability / phishing of Magic Links | Email provider (SPF, DKIM, DMARC) |
| Physical security of devices used by admins | Organisational policy |
| Secrets management in CI/CD | GitHub Actions secrets / Vault |
| Brute-force on Magic Link tokens | Supabase Auth built-in rate limiting (`auth.config`) |
| CSRF on the frontend | SameSite cookie flags (Supabase sets these on session cookies) |

---

## Verification Checklist

Before going to production, manually verify:

- [ ] A student JWT **cannot** read another student's registrations (IDOR test).
- [ ] A student JWT **cannot** INSERT into `registrations` directly (should get 403).
- [ ] A student JWT **cannot** UPDATE `profiles.role` to `'admin'` (should get 403).
- [ ] Signing up with a non-`@college.edu` email fails with an error (domain check).
- [ ] Google OAuth with a non-`@college.edu` Google account fails (same trigger).
- [ ] Two concurrent `register_for_event()` calls on a capacity-1 event result in
  exactly 1 `registered` and 1 `waitlisted` row (overbooking test).
- [ ] `audit_log` rows cannot be deleted even by an admin-role JWT (tamper test).
- [ ] `check_in_ticket()` called twice returns `already_checked_in` on the second
  call, not an error (idempotency test).
