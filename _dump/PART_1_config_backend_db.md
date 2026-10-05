# PART 1 - Config, backend, database (fresh dump, read from disk)

Source: live working tree. Stale dumps (full_code.md, code_dump.md) were NOT reused.
Excluded: openapi.json (exists at repo root but excluded per instructions), .env and any real secrets, supabase/seed.sql (NOT FOUND).

## Table of contents

| File | Lines |
|---|---|
| package.json | 68 |
| tsconfig.json | 28 |
| vite.config.ts | 13 |
| vercel.json | 13 |
| index.html | 18 |
| .env.example | 46 |
| .gitignore | 32 |
| .github/workflows/lint.yml | 32 |
| supabase/config.toml | 415 |
| api/index.ts | 191 |
| supabase/migrations/0001_gatherum_schema.sql | 717 |
| supabase/migrations/0002_realtime_counters.sql | 144 |
| supabase/migrations/0003_fix_cancel_registration.sql | 61 |
| supabase/migrations/0004_fix_reregistration.sql | 39 |
| supabase/migrations/0005_fix_maintain_event_counters.sql | 46 |
| supabase/migrations/0006_add_storage_buckets.sql | 42 |
| supabase/migrations/0007_admin_fetch_users.sql | 22 |
| supabase/migrations/0008_add_registration_deadline.sql | 2 |
| supabase/migrations/0009_event_archival.sql | 34 |
| supabase/migrations/0010_fix_register_for_event.sql | 58 |
| supabase/migrations/0011_update_archival_rules.sql | 17 |

## package.json

````json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "tsc --noEmit",
    "find-bugs": "tsc --noEmit && eslint ."
  },
  "dependencies": {
    "@hello-pangea/dnd": "^18.0.1",
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "@supabase/supabase-js": "^2.112.2",
    "@tailwindcss/vite": "^4.1.14",
    "@types/canvas-confetti": "^1.9.0",
    "@types/react-datepicker": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.4",
    "@yudiel/react-qr-scanner": "^2.6.0",
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "consola": "^3.4.2",
    "date-fns": "^4.4.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "express-rate-limit": "^8.6.2",
    "lucide-react": "^1.29.0",
    "motion": "^13.0.0",
    "pg": "^8.23.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.0.1",
    "react-countup": "^6.5.3",
    "react-datepicker": "^9.1.0",
    "react-dom": "^19.0.1",
    "react-error-boundary": "^6.1.2",
    "react-hot-toast": "^2.6.0",
    "react-qr-code": "^2.2.0",
    "react-router-dom": "^7.18.2",
    "react-scan": "^0.5.7",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0",
    "three": "^0.185.1",
    "vite": "^6.2.3",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/express": "^4.17.21",
    "@types/node": "^22.20.1",
    "@types/three": "^0.185.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^10.8.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.4",
    "globals": "^17.9.0",
    "tailwindcss": "^4.1.14",
    "ts-node": "^10.9.2",
    "typescript": "~5.8.2",
    "typescript-eslint": "^8.67.0",
    "vite": "^6.2.3"
  },
  "optionalDependencies": {
    "@rolldown/binding-linux-x64-gnu": "*"
  }
}

````

## tsconfig.json

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

````

## vite.config.ts

````ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});

````

## vercel.json

````json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

````

## index.html

````html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Gatherum — The campus event platform that brings students and organizers together." />
    <title>Gatherum — Campus Events, Reimagined</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

````

## .env.example

````bash
# =============================================================================
# Gatherum — Environment Variables Template
# Copy this file to .env and fill in the real values.
# NEVER commit .env to version control.
# =============================================================================

# -----------------------------------------------------------------------------
# CLIENT-SIDE VARIABLES
# These are bundled into the browser JavaScript by Vite (VITE_ prefix).
# They are visible to anyone who opens DevTools on your site.
# DO NOT put secrets here — only public-ish config is safe.
# -----------------------------------------------------------------------------

# Your Supabase project API URL (Project Settings → API → Project URL)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Supabase anon/public key — safe to expose, protected by RLS policies
# (Project Settings → API → Project API keys → anon public)
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Email domain restriction for signup (e.g. @your-college.edu)
VITE_ALLOWED_EMAIL_DOMAIN=@your-college.edu

# Google OAuth client ID — client IDs are public by design (not a secret)
# Leave blank if Google SSO is not being used
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id

# -----------------------------------------------------------------------------
# SERVER-ONLY VARIABLES
# Read ONLY by the Node/Express serverless function (api/index.ts) via process.env.
# These must NEVER have a VITE_ prefix — that would expose them in the
# browser bundle. Never commit real values. Set via your deployment
# platform's secrets manager (Vercel, Railway, Cloud Run, etc.).
# -----------------------------------------------------------------------------

# Supabase service role key — BYPASSES ALL RLS. Treat like a root password.
# (Project Settings → API → Project API keys → service_role secret)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Canonical URL of the deployed app (used for auth redirects, etc.)
# Example: https://gatherum.your-college.edu
APP_URL=https://your-app-domain.com

# Server port (defaults to 3000 if not set)
PORT=3000

````

## .gitignore

````text
node_modules/
build/
dist/
coverage/
.DS_Store
*.log

# Environment files — never commit real secrets
.env
.env.local
.env.*.local
.env*
_env
*.env

# Allow example/template files (contain no real values)
!.env.example
!_env.example

# Supabase local temp files
supabase/.temp/

# Dev/test artifacts
fix_test.cjs
full_code.md
code_dump.md
bun.lock
openapi.json
skills-lock.json
test_rls.mjs
.vercel
.agents/
````

## .github/workflows/lint.yml

````yaml
name: Automated Bug Finder (Linting & Type Checking)

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  find_bugs:
    name: Find Bugs & Errors
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Type Checker
        run: npm run lint

      - name: Run ESLint
        run: npx eslint .

````

## supabase/config.toml

````toml
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "gatherum"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000
# Controls whether new tables, views, sequences and functions created in the `public` schema by
# `postgres` are reachable through the Data API roles (`anon`, `authenticated`, `service_role`)
# without explicit GRANTs. When unset, new entities are NOT auto-exposed, matching the new cloud
# default. Set to `true` to keep the legacy behaviour of auto-exposing new entities; this is
# deprecated and the field is removed on 2026-10-30 once the always-revoked behaviour is permanent.
# auto_expose_new_tables = true

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false
# Paths to self-signed certificate pair.
# cert_path = "../certs/my-cert.pem"
# key_path = "../certs/my-key.pem"

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# Maximum amount of time to wait for health check when starting the local database.
health_timeout = "2m"
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 17

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# If disabled, migrations will be skipped during a db push or reset.
enabled = true
# Specifies an ordered list of schema files, directories, or glob patterns that describe your database.
# Supports paths relative to supabase directory: "./schemas/*.sql", "./database".
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[db.network_restrictions]
# Enable management of network restrictions.
enabled = false
# List of IPv4 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv4 connections. Set empty array to block all IPs.
allowed_cidrs = ["0.0.0.0/0"]
# List of IPv6 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv6 connections. Set empty array to block all IPs.
allowed_cidrs_v6 = ["::/0"]

# Uncomment to reject non-secure connections to the database.
# [db.ssl_enforcement]
# enabled = true

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[local_smtp]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

# Allow connections via S3 compatible clients
[storage.s3_protocol]
enabled = true

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Store analytical data in S3 for running ETL jobs over Iceberg Catalog
# This feature is only available on the hosted platform.
[storage.analytics]
enabled = false
max_namespaces = 5
max_tables = 10
max_catalogs = 2

# Analytics Buckets is available to Supabase Pro plan.
# [storage.analytics.buckets.my-warehouse]

# Store vector embeddings in S3 for large and durable datasets
[storage.vector]
enabled = true
max_buckets = 10
max_indexes = 5

# Vector Buckets is available to Supabase Pro plan.
# [storage.vector.buckets.documents-openai]

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# The public URL that Auth serves on. Defaults to the API external URL with `/auth/v1` appended.
# external_url = ""
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# JWT issuer URL. If not set, defaults to auth.external_url.
# jwt_issuer = ""
# Path to JWT signing key. DO NOT commit your signing keys file to git.
# signing_keys_path = "./signing_keys.json"
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

# Configure passkey sign-ins.
# [auth.passkey]
# enabled = false

# Configure WebAuthn relying party settings (required when passkey is enabled).
# [auth.webauthn]
# rp_display_name = "Supabase"
# rp_id = "localhost"
# rp_origins = ["http://127.0.0.1:3000"]

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30
# Number of Web3 logins that can be made in a 5 minute interval per IP address.
web3 = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

# Uncomment to customize notification email template
# [auth.email.notification.password_changed]
# enabled = true
# subject = "Your password has been changed"
# content_path = "./templates/password_changed_notification.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ `{{ .Code }}` }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a new user is created and allows developers to reject the request based on the incoming user object.
# [auth.hook.before_user_created]
# enabled = true
# uri = "pg-functions://postgres/auth/before-user-created-hook"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ `{{ .Code }}` }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `x`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth callback URL derived from auth.external_url.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false
# If enabled, it will allow the user to successfully authenticate when the provider does not return an email address.
email_optional = false

# Allow Solana wallet holders to sign in to your project via the Sign in with Solana (SIWS, EIP-4361) standard.
# You can configure "web3" rate limit in the [auth.rate_limit] section and set up [auth.captcha] if self-hosting.
[auth.web3.solana]
enabled = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

# OAuth server configuration
[auth.oauth_server]
# Enable OAuth server functionality
enabled = false
# Path for OAuth consent flow UI
authorization_url_path = "/oauth/consent"
# Allow dynamic client registration
allow_dynamic_registration = false

[edge_runtime]
enabled = true
# Supported request policies: `oneshot`, `per_worker`.
# `per_worker` (default) — enables hot reload during local development.
# `oneshot` — fallback mode if hot reload causes issues (e.g. in large repos or with symlinks).
policy = "per_worker"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 2

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

# pg-delta is the schema diff engine for db diff / db pull / db remote commit.
# Set enabled = false to fall back to the legacy migra engine.
[experimental.pgdelta]
enabled = true
# Directory under `supabase/` where declarative files are written.
# declarative_schema_path = "./database"
# JSON string passed through to pg-delta SQL formatting.
# format_options = "{\"keywordCase\":\"upper\",\"indent\":2,\"maxWidth\":80,\"commaStyle\":\"trailing\"}"

````

## api/index.ts

````ts
import express from "express";
import rateLimit from "express-rate-limit";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// ─── Startup validation ───────────────────────────────────────────────────────
// Runs at module load time (cold start). In a serverless context we throw
// rather than calling process.exit() — throwing surfaces as a visible 500
// in Vercel's function logs instead of silently killing and re-invoking
// the process on the next request.
//
// SUPABASE_SERVICE_ROLE_KEY must NEVER have a VITE_ fallback:
// a VITE_-prefixed value would be bundled into client JavaScript by Vite.
const requiredServerEnvVars = ["SUPABASE_SERVICE_ROLE_KEY"];
const missing = requiredServerEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  const msg =
    `❌  Missing required server-only environment variables: ${missing.join(", ")}\n` +
    `   Set these in Vercel → Project Settings → Environment Variables (Production scope).\n` +
    `   For local dev, copy .env.example to .env and fill in real values.`;
  console.error(msg);
  throw new Error(msg); // surfaces in Vercel function logs as a clear cold-start failure
}

// VITE_ fallbacks are acceptable for local dev (where SUPABASE_URL may not be
// set separately). In Vercel production, set SUPABASE_URL directly.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Anon client — used only to verify caller JWTs in the auth middleware.
// If missing, auth middleware will reject all requests with 500.
let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    "⚠️  Supabase URL/anon key not found — auth middleware will reject all requests."
  );
}

// Admin client — SUPABASE_SERVICE_ROLE_KEY is guaranteed present by the
// fail-fast check above. This client bypasses RLS; keep it server-side only.
const adminSupabase = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Express app ─────────────────────────────────────────────────────────────
// No app.listen() — Vercel's Node builder wraps the default-exported Express
// app into a serverless function automatically. Calling app.listen() in a
// serverless context has no effect in production and breaks local `vercel dev`.

const app = express();

app.set("trust proxy", 1);
app.use(express.json());

// ─── Rate limiters ───────────────────────────────────────────────────────────
// Note: in a serverless context these rate limits are per-instance (no shared
// state across Vercel's function instances). For per-user rate limiting at
// scale, back this with an external store (e.g. Redis via Upstash).

const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: (req: any) => req.user?.id || req.ip,
  message: "Too many requests from this user, please try again later.",
});

// ─── Auth middleware ──────────────────────────────────────────────────────────
const authMiddleware = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!supabase) {
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    (req as any).user = user;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.use("/api/", ipLimiter);
app.use("/api/", authMiddleware);
app.use("/api/", userLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/admin/reset-user-access
// Sends a magic-link email to a target user (admin only).
// Security: caller's role is verified server-side via service-role client —
// never trusting the caller's own JWT claim.
app.post("/api/admin/reset-user-access", async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { targetEmail } = req.body;
    if (!targetEmail) {
      res.status(400).json({ error: "Target email required" });
      return;
    }

    // Verify the caller is actually an admin (server-side check, not trusting JWT role claim)
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || (profile as any)?.role !== "admin") {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    // Send magic-link email natively — shouldCreateUser: false means this
    // cannot be abused to create accounts for arbitrary emails.
    const { error: sendError } = await adminSupabase.auth.signInWithOtp({
      email: targetEmail,
      options: { shouldCreateUser: false },
    });

    if (sendError) {
      console.error("Failed to send magic link:", sendError);
      res.status(500).json({ error: "Failed to send access link" });
      return;
    }

    // Audit log
    const { data: targetUser } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", targetEmail)
      .single();

    if (targetUser) {
      await adminSupabase.from("audit_log").insert({
        actor_id: user.id,
        action: "admin_reset_user_access",
        target_table: "auth.users",
        target_id: (targetUser as any).id,
        details: { action: "magiclink_sent" },
      } as any);
    }

    res.json({ success: true, message: "Magic link sent successfully" });
  } catch (error: any) {
    console.error("Admin Reset Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ─── Default export ───────────────────────────────────────────────────────────
// Vercel's Node builder wraps this export into a serverless function.
// DO NOT call app.listen() — Vercel handles the HTTP lifecycle.
export default app;

````

## supabase/migrations/0001_gatherum_schema.sql

````sql
-- 0001_gatherum_schema.sql

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE role_enum AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE registration_status_enum AS ENUM ('registered', 'waitlisted', 'cancelled', 'attended');
CREATE TYPE event_team_role AS ENUM ('volunteer');

-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================
CREATE TABLE platform_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  signups_enabled boolean NOT NULL DEFAULT true,
  allowed_email_domain text NOT NULL DEFAULT '@poornima.org',
  maintenance_mode boolean NOT NULL DEFAULT false
);

INSERT INTO platform_settings (id, allowed_email_domain) VALUES (1, '@poornima.org') ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_enum NOT NULL DEFAULT 'student',
  email text,
  full_name text,
  roll_number text,
  branch text,
  year_of_study int,
  phone_number text,
  avatar_url text,
  public_rsvp boolean NOT NULL DEFAULT true,
  profile_completed boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES profiles(id),
  title text,
  description text,
  category text,
  start_time timestamptz NOT NULL,
  end_time timestamptz CHECK (end_time IS NULL OR end_time > start_time),
  location text,
  capacity int NOT NULL CHECK (capacity > 0),
  poster_url text,
  is_unpublished boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status registration_status_enum NOT NULL DEFAULT 'registered',
  ticket_id text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  attended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE event_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES profiles(id),
  title text,
  description text,
  category text,
  capacity int,
  poster_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  organizer_id uuid REFERENCES profiles(id),
  message text NOT NULL CHECK (char_length(message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (char_length(comment) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE event_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role event_team_role NOT NULL DEFAULT 'volunteer',
  invited_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE calendar_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  followed_organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followed_organizer_id)
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE FUNCTION prevent_restricted_profile_updates()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_banned IS DISTINCT FROM OLD.is_banned OR NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Cannot update restricted fields directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER protect_profiles_trigger BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION prevent_restricted_profile_updates();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- platform_settings
CREATE POLICY "Platform settings are readable by everyone" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Platform settings are insertable by admins" ON platform_settings FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Platform settings are updatable by admins" ON platform_settings FOR UPDATE USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Platform settings are deletable by admins" ON platform_settings FOR DELETE USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- profiles
CREATE POLICY "Profiles are readable by owner or admin" ON profiles FOR SELECT USING ((select auth.uid()) = id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Profiles are updatable by owner" ON profiles FOR UPDATE USING ((select auth.uid()) = id);

-- events
CREATE POLICY "Events are readable by public (published) or organizers/team/admin" ON events FOR SELECT USING (
  is_unpublished = false OR 
  organizer_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM event_team WHERE event_id = events.id AND user_id = (select auth.uid())) OR 
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  (select auth.uid()) = organizer_id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Events are updatable by organizer or admin" ON events FOR UPDATE USING (
  (select auth.uid()) = organizer_id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Events are deletable by organizer or admin" ON events FOR DELETE USING (
  (select auth.uid()) = organizer_id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- registrations
CREATE POLICY "Registrations are readable by owner, event organizer, team, or admin" ON registrations FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = (select auth.uid())) OR
  EXISTS (SELECT 1 FROM event_team WHERE event_id = registrations.event_id AND user_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
-- No INSERT policy for registrations (RPC only)
CREATE POLICY "Registrations are deletable by owner, event organizer, or admin" ON registrations FOR DELETE USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- event_templates
CREATE POLICY "Event templates are readable by owner or admin" ON event_templates FOR SELECT USING (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Event templates are insertable by owner or admin" ON event_templates FOR INSERT WITH CHECK (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Event templates are updatable by owner or admin" ON event_templates FOR UPDATE USING (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Event templates are deletable by owner or admin" ON event_templates FOR DELETE USING (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- announcements
CREATE POLICY "Announcements are readable by public (published events) or organizers/team/admin" ON announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_unpublished = false) OR
  organizer_id = (select auth.uid()) OR
  EXISTS (SELECT 1 FROM event_team WHERE event_id = announcements.event_id AND user_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Announcements are updatable by organizer or admin" ON announcements FOR UPDATE USING (
  organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Announcements are deletable by organizer or admin" ON announcements FOR DELETE USING (
  organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- feedbacks
CREATE POLICY "Feedbacks are insertable by student" ON feedbacks FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
);
CREATE POLICY "Feedbacks are readable by student or organizer/admin after event" ON feedbacks FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  (EXISTS (SELECT 1 FROM events WHERE id = event_id AND (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin') AND (end_time IS NOT NULL AND end_time < now())))
);

-- event_team
CREATE POLICY "Event team is readable by member, organizer, or admin" ON event_team FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
-- No direct INSERT/DELETE for event_team (RPC only)

-- calendar_follows
CREATE POLICY "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows FOR SELECT USING (
  follower_id = (select auth.uid()) OR 
  followed_organizer_id = (select auth.uid()) OR 
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Calendar follows are insertable by follower" ON calendar_follows FOR INSERT WITH CHECK (follower_id = (select auth.uid()));
CREATE POLICY "Calendar follows are deletable by follower" ON calendar_follows FOR DELETE USING (follower_id = (select auth.uid()));

-- audit_log
CREATE POLICY "Audit logs are readable by admin" ON audit_log FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- ============================================================
-- FUNCTIONS (RPCs and Triggers)
-- ============================================================

-- handle_new_user (Fail Closed)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_allowed_domain text;
  v_signups_enabled boolean;
BEGIN
  SELECT allowed_email_domain, signups_enabled INTO v_allowed_domain, v_signups_enabled FROM platform_settings WHERE id = 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Platform settings not found, signups rejected.';
  END IF;

  IF NOT v_signups_enabled THEN
    RAISE EXCEPTION 'Global signups are currently disabled.';
  END IF;

  IF v_allowed_domain IS NOT NULL AND v_allowed_domain != '' AND new.email NOT LIKE '%' || v_allowed_domain THEN
    RAISE EXCEPTION 'Users must use a % email.', v_allowed_domain;
  END IF;

  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_email_domain_and_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Wait, the trigger should probably be BEFORE INSERT for the validation part to reject it early! But `auth.users` trigger must be AFTER INSERT in Supabase otherwise it might not persist the profile properly. Or we can have a BEFORE INSERT on `auth.users` (which is in the auth schema, but we can attach a trigger to it). Actually, `auth.users` allows BEFORE INSERT triggers, but it's safer to just let the AFTER INSERT fail the transaction, which rolls back the user creation anyway.

-- admin_update_user_role
CREATE OR REPLACE FUNCTION admin_update_user_role(p_user_id uuid, p_role role_enum)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE profiles SET role = p_role WHERE id = p_user_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_update_user_role', 'profiles', p_user_id, jsonb_build_object('new_role', p_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- admin_toggle_user_ban
CREATE OR REPLACE FUNCTION admin_toggle_user_ban(p_user_id uuid, p_is_banned boolean)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE profiles SET is_banned = p_is_banned WHERE id = p_user_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_toggle_user_ban', 'profiles', p_user_id, jsonb_build_object('is_banned', p_is_banned));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- admin_update_settings
CREATE OR REPLACE FUNCTION admin_update_settings(p_allow_global_signups boolean, p_allowed_email_domain text, p_maintenance_mode boolean)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE platform_settings SET signups_enabled = p_allow_global_signups, allowed_email_domain = p_allowed_email_domain, maintenance_mode = p_maintenance_mode WHERE id = 1;
  
  INSERT INTO audit_log (actor_id, action, target_table, details)
  VALUES ((select auth.uid()), 'admin_update_settings', 'platform_settings', jsonb_build_object('signups_enabled', p_allow_global_signups, 'allowed_email_domain', p_allowed_email_domain, 'maintenance_mode', p_maintenance_mode));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- register_for_event
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status registration_status_enum;
  v_user_id uuid := (select auth.uid());
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  SELECT count(*) INTO v_registered_count FROM registrations WHERE event_id = p_event_id AND status = 'registered';

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  INSERT INTO registrations (event_id, user_id, status, created_at, attended) 
  VALUES (p_event_id, v_user_id, v_status, now(), false)
  ON CONFLICT (event_id, user_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    attended = EXCLUDED.attended;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', p_event_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- promote_from_waitlist
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_waitlisted_id uuid;
BEGIN
  IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
    SELECT id INTO v_waitlisted_id FROM registrations WHERE event_id = OLD.event_id AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE;
    IF FOUND THEN
      UPDATE registrations SET status = 'registered' WHERE id = v_waitlisted_id;
      INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
      VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id, '{}');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_promote_from_waitlist AFTER UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION promote_from_waitlist();

-- check_in_by_ticket
CREATE OR REPLACE FUNCTION check_in_by_ticket(p_ticket_id text)
RETURNS text AS $$
DECLARE
  v_reg_id uuid;
  v_event_id uuid;
  v_attended boolean;
BEGIN
  SELECT id, event_id, attended INTO v_reg_id, v_event_id, v_attended FROM registrations WHERE ticket_id = p_ticket_id;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  IF NOT (
    EXISTS (SELECT 1 FROM events WHERE id = v_event_id AND organizer_id = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM event_team WHERE event_id = v_event_id AND user_id = (select auth.uid()))
  ) THEN
    RETURN 'unauthorized';
  END IF;

  IF v_attended THEN RETURN 'already_checked_in'; END IF;

  UPDATE registrations SET attended = true, status = 'attended' WHERE id = v_reg_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'check_in_by_ticket', 'registrations', v_reg_id, '{}');

  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- invite_volunteer
CREATE OR REPLACE FUNCTION invite_volunteer(p_event_id uuid, p_email text)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND organizer_id = (select auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  SELECT id INTO v_user_id FROM profiles WHERE email = p_email;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

  INSERT INTO event_team (event_id, user_id, invited_by) VALUES (p_event_id, v_user_id, (select auth.uid()));
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'invite_volunteer', 'event_team', v_user_id, jsonb_build_object('event_id', p_event_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- remove_volunteer
CREATE OR REPLACE FUNCTION remove_volunteer(p_event_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND organizer_id = (select auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM event_team WHERE event_id = p_event_id AND user_id = p_user_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'remove_volunteer', 'event_team', p_user_id, jsonb_build_object('event_id', p_event_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- REVOKE ALL + TARGETED GRANT
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC;

REVOKE ALL ON FUNCTION admin_update_user_role(uuid, role_enum) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_toggle_user_ban(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_update_settings(boolean, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION register_for_event(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION promote_from_waitlist() FROM PUBLIC;
REVOKE ALL ON FUNCTION check_in_by_ticket(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION invite_volunteer(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION remove_volunteer(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trigger_set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION prevent_restricted_profile_updates() FROM PUBLIC;


GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_settings(boolean, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text) TO authenticated;
GRANT EXECUTE ON FUNCTION invite_volunteer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_volunteer(uuid, uuid) TO authenticated;


-- Grant default privileges on the public schema that were dropped with CASCADE

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;


-- Grant privileges to supabase_admin which is required for GoTrue auth triggers and cascading deletes

GRANT USAGE ON SCHEMA public TO supabase_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO supabase_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO supabase_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO supabase_admin;


-- Fix audit_log actor_id foreign key constraint to use ON DELETE SET NULL

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;


-- Fix missing ON DELETE CASCADE for foreign keys referencing profiles

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
ALTER TABLE events ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_templates DROP CONSTRAINT IF EXISTS event_templates_organizer_id_fkey;
ALTER TABLE event_templates ADD CONSTRAINT event_templates_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_organizer_id_fkey;
ALTER TABLE announcements ADD CONSTRAINT announcements_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE feedbacks DROP CONSTRAINT IF EXISTS feedbacks_user_id_fkey;
ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_invited_by_fkey;
ALTER TABLE event_team ADD CONSTRAINT event_team_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE SET NULL;


-- Fix RLS infinite recursion by using SECURITY DEFINER functions

-- 1. Helper function for role
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS role_enum AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Helper function for event organizer (bypasses RLS to avoid mutual recursion)
CREATE OR REPLACE FUNCTION is_event_organizer(p_event_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id AND organizer_id = (select auth.uid()));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. Helper function for event team member (bypasses RLS to avoid mutual recursion)
CREATE OR REPLACE FUNCTION is_event_team_member(p_event_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.event_team WHERE event_id = p_event_id AND user_id = (select auth.uid()));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Drop all problematic policies
DROP POLICY IF EXISTS "Profiles are readable by owner or admin" ON profiles;
DROP POLICY IF EXISTS "Events are readable by public (published) or organizers/team/admin" ON events;
DROP POLICY IF EXISTS "Events are insertable by organizer or admin" ON events;
DROP POLICY IF EXISTS "Events are updatable by organizer or admin" ON events;
DROP POLICY IF EXISTS "Events are deletable by organizer or admin" ON events;
DROP POLICY IF EXISTS "Registrations are readable by owner, event organizer, team, or admin" ON registrations;
DROP POLICY IF EXISTS "Registrations are deletable by owner, event organizer, or admin" ON registrations;
DROP POLICY IF EXISTS "Event templates are readable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Event templates are insertable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Event templates are updatable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Event templates are deletable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Announcements are readable by public (published events) or organizers/team/admin" ON announcements;
DROP POLICY IF EXISTS "Announcements are insertable by organizer or admin" ON announcements;
DROP POLICY IF EXISTS "Announcements are updatable by organizer or admin" ON announcements;
DROP POLICY IF EXISTS "Announcements are deletable by organizer or admin" ON announcements;
DROP POLICY IF EXISTS "Feedbacks are readable by student or organizer/admin after event" ON feedbacks;
DROP POLICY IF EXISTS "Event team is readable by member, organizer, or admin" ON event_team;
DROP POLICY IF EXISTS "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows;
DROP POLICY IF EXISTS "Platform settings are insertable by admins" ON platform_settings;
DROP POLICY IF EXISTS "Platform settings are updatable by admins" ON platform_settings;
DROP POLICY IF EXISTS "Platform settings are deletable by admins" ON platform_settings;

-- Recreate policies using the SECURITY DEFINER functions to prevent recursion

-- platform_settings
CREATE POLICY "Platform settings are insertable by admins" ON platform_settings FOR INSERT WITH CHECK (get_auth_role() = 'admin');
CREATE POLICY "Platform settings are updatable by admins" ON platform_settings FOR UPDATE USING (get_auth_role() = 'admin');
CREATE POLICY "Platform settings are deletable by admins" ON platform_settings FOR DELETE USING (get_auth_role() = 'admin');

-- profiles
CREATE POLICY "Profiles are readable by owner or admin" ON profiles FOR SELECT USING ((select auth.uid()) = id OR get_auth_role() = 'admin');

-- events
CREATE POLICY "Events are readable by public (published) or organizers/team/admin" ON events FOR SELECT USING (
  is_unpublished = false OR 
  organizer_id = (select auth.uid()) OR 
  is_event_team_member(id) OR 
  get_auth_role() = 'admin'
);
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);
CREATE POLICY "Events are updatable by organizer or admin" ON events FOR UPDATE USING (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);
CREATE POLICY "Events are deletable by organizer or admin" ON events FOR DELETE USING (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);

-- registrations
CREATE POLICY "Registrations are readable by owner, event organizer, team, or admin" ON registrations FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  is_event_organizer(event_id) OR
  is_event_team_member(event_id) OR
  get_auth_role() = 'admin'
);
CREATE POLICY "Registrations are deletable by owner, event organizer, or admin" ON registrations FOR DELETE USING (
  user_id = (select auth.uid()) OR 
  is_event_organizer(event_id) OR
  get_auth_role() = 'admin'
);

-- event_templates
CREATE POLICY "Event templates are readable by owner or admin" ON event_templates FOR SELECT USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
CREATE POLICY "Event templates are insertable by owner or admin" ON event_templates FOR INSERT WITH CHECK (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
CREATE POLICY "Event templates are updatable by owner or admin" ON event_templates FOR UPDATE USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
CREATE POLICY "Event templates are deletable by owner or admin" ON event_templates FOR DELETE USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');

-- announcements
CREATE POLICY "Announcements are readable by public (published events) or organizers/team/admin" ON announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_unpublished = false) OR
  organizer_id = (select auth.uid()) OR
  is_event_team_member(event_id) OR
  get_auth_role() = 'admin'
);
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);
CREATE POLICY "Announcements are updatable by organizer or admin" ON announcements FOR UPDATE USING (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);
CREATE POLICY "Announcements are deletable by organizer or admin" ON announcements FOR DELETE USING (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);

-- feedbacks
CREATE POLICY "Feedbacks are readable by student or organizer/admin after event" ON feedbacks FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  (is_event_organizer(event_id) OR get_auth_role() = 'admin') -- simplified check for readability, actual time check might be complex in RLS
);

-- event_team
CREATE POLICY "Event team is readable by member, organizer, or admin" ON event_team FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  is_event_organizer(event_id) OR
  get_auth_role() = 'admin'
);

-- calendar_follows
CREATE POLICY "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows FOR SELECT USING (
  follower_id = (select auth.uid()) OR 
  followed_organizer_id = (select auth.uid()) OR 
  get_auth_role() = 'admin'
);


-- 1. Fix the trigger function to NOT be SECURITY DEFINER, or to check (select auth.role()) properly
CREATE OR REPLACE FUNCTION prevent_restricted_profile_updates()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_banned IS DISTINCT FROM OLD.is_banned OR NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    -- Check if it's a supabase service role or postgres
    -- (select auth.role()) returns 'service_role' for admin, 'authenticated' for users. 
    -- current_user is usually 'postgres' for backend scripts.
    -- If it's a web client, (select auth.role()) will be 'authenticated' or 'anon'.
    IF (select auth.role()) = 'authenticated' OR (select auth.role()) = 'anon' THEN
      RAISE EXCEPTION 'Cannot update restricted fields directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- By removing SECURITY DEFINER, it defaults to SECURITY INVOKER.




-- Revoke execute from public for the helper functions
REVOKE ALL ON FUNCTION get_auth_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_event_organizer(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION is_event_team_member(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_organizer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_team_member(uuid) TO authenticated;

-- Ignore authenticated executable warnings for intended RPCs and helpers

COMMENT ON FUNCTION admin_update_user_role(uuid, role_enum) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION admin_toggle_user_ban(uuid, boolean) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION admin_update_settings(boolean, text, boolean) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION register_for_event(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION check_in_by_ticket(text) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION invite_volunteer(uuid, text) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION remove_volunteer(uuid, uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION get_auth_role() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION is_event_organizer(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION is_event_team_member(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';

-- Revoke anon access from get_auth_role (no legitimate anonymous use)
REVOKE EXECUTE ON FUNCTION get_auth_role() FROM anon;

````

## supabase/migrations/0002_realtime_counters.sql

````sql
-- 0002_realtime_counters.sql

-- 1. Add Counter Columns with constraints
ALTER TABLE events ADD COLUMN IF NOT EXISTS registered_count int NOT NULL DEFAULT 0 CHECK (registered_count >= 0);
ALTER TABLE events ADD COLUMN IF NOT EXISTS waitlist_count int NOT NULL DEFAULT 0 CHECK (waitlist_count >= 0);

-- 2. Backfill existing data safely
UPDATE events e
SET 
  registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
  waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');

-- 3. Prevent client manipulation of counters
-- NOTE: This check relies on maintain_event_counters being SECURITY DEFINER — its internal
-- UPDATE runs as the function owner (postgres), which is what legitimately satisfies this guard.
-- Do not remove SECURITY DEFINER from maintain_event_counters without revisiting this trigger.
CREATE OR REPLACE FUNCTION protect_event_counters()
RETURNS trigger AS $$
BEGIN
  IF NEW.registered_count IS DISTINCT FROM OLD.registered_count OR NEW.waitlist_count IS DISTINCT FROM OLD.waitlist_count THEN
    -- Allow postgres (via SECURITY DEFINER triggers) or admins to modify these columns
    IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
      RAISE EXCEPTION 'Cannot update system-managed counters directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; -- Not SECURITY DEFINER, we want to check the actual caller

DROP TRIGGER IF EXISTS protect_events_counters_trigger ON events;
CREATE TRIGGER protect_events_counters_trigger
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION protect_event_counters();

-- 4. Maintain Counters Trigger (Transaction-Safe)
CREATE OR REPLACE FUNCTION maintain_event_counters()
RETURNS trigger AS $$
DECLARE
  v_reg_delta int := 0;
  v_wait_delta int := 0;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_id := NEW.event_id;
    IF NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_id := NEW.event_id;
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'cancelled' THEN v_wait_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'registered' THEN 
      v_wait_delta := -1; v_reg_delta := 1; 
    END IF;
    IF OLD.status = 'cancelled' AND NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF OLD.status = 'cancelled' AND NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
    IF OLD.status = 'registered' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' THEN v_wait_delta := -1; END IF;
  END IF;

  IF v_reg_delta != 0 OR v_wait_delta != 0 THEN
    UPDATE events
    SET registered_count = registered_count + v_reg_delta,
        waitlist_count = waitlist_count + v_wait_delta
    WHERE id = v_event_id;
  END IF;

  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_maintain_event_counters ON registrations;
CREATE TRIGGER trigger_maintain_event_counters
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION maintain_event_counters();

-- 5. Support Registration DELETE in waitlist promotion (for backward compatibility, even though we move to 'cancelled' status)
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_waitlisted_id uuid;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'registered' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN OLD;
    END IF;
  END IF;

  SELECT id INTO v_waitlisted_id FROM registrations WHERE event_id = v_event_id AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE;
  IF FOUND THEN
    UPDATE registrations SET status = 'registered' WHERE id = v_waitlisted_id;
    INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
    VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id, '{}');
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_promote_from_waitlist ON registrations;
CREATE TRIGGER trigger_promote_from_waitlist AFTER UPDATE OR DELETE ON registrations FOR EACH ROW EXECUTE FUNCTION promote_from_waitlist();

-- 6. Admin Reconciliation RPC
CREATE OR REPLACE FUNCTION admin_reconcile_event_counters()
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE events e
  SET 
    registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
    waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Enable Realtime Publications
DO $$
BEGIN
  -- Create publication if it doesn't exist (Supabase usually provides this)
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'registrations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
  END IF;
END $$;

````

## supabase/migrations/0003_fix_cancel_registration.sql

````sql
-- 0003_fix_cancel_registration.sql
-- Fixes: cancelRegistration silently no-ops because no RLS UPDATE policy exists on registrations.
-- Adds a SECURITY DEFINER RPC consistent with register_for_event / check_in_by_ticket.

CREATE OR REPLACE FUNCTION cancel_registration(p_event_id uuid)
RETURNS void AS $$
DECLARE
  v_user_id uuid := (select auth.uid());
  v_reg_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT id INTO v_reg_id FROM registrations
  WHERE event_id = p_event_id AND user_id = v_user_id AND status IN ('registered', 'waitlisted');

  IF NOT FOUND THEN RAISE EXCEPTION 'Active registration not found'; END IF;

  UPDATE registrations SET status = 'cancelled' WHERE id = v_reg_id;

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'cancel_registration', 'registrations', v_reg_id, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION cancel_registration(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cancel_registration(uuid) TO authenticated;
COMMENT ON FUNCTION cancel_registration(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';

-- Support Registration DELETE in waitlist promotion (for backward compatibility, even though we move to 'cancelled' status)
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_waitlisted_id uuid;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'registered' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN OLD;
    END IF;
  END IF;

  SELECT id INTO v_waitlisted_id FROM registrations WHERE event_id = v_event_id AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE;
  IF FOUND THEN
    UPDATE registrations SET status = 'registered' WHERE id = v_waitlisted_id;
    INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
    VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id,
      jsonb_build_object('triggered_by_op', TG_OP, 'context', 'auto_promotion'));
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

````

## supabase/migrations/0004_fix_reregistration.sql

````sql
-- 0004_fix_reregistration.sql
-- Fix UNIQUE constraint error when users try to register again after cancelling

CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status registration_status_enum;
  v_user_id uuid := (select auth.uid());
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  SELECT count(*) INTO v_registered_count FROM registrations WHERE event_id = p_event_id AND status = 'registered';

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  INSERT INTO registrations (event_id, user_id, status, created_at, attended) 
  VALUES (p_event_id, v_user_id, v_status, now(), false)
  ON CONFLICT (event_id, user_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    attended = EXCLUDED.attended;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', p_event_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

````

## supabase/migrations/0005_fix_maintain_event_counters.sql

````sql
-- 0005_fix_maintain_event_counters.sql
-- Fixes: counters not incrementing when re-registering from 'cancelled' status

CREATE OR REPLACE FUNCTION maintain_event_counters()
RETURNS trigger AS $$
DECLARE
  v_reg_delta int := 0;
  v_wait_delta int := 0;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_id := NEW.event_id;
    IF NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_id := NEW.event_id;
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'cancelled' THEN v_wait_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'registered' THEN 
      v_wait_delta := -1; v_reg_delta := 1; 
    END IF;
    IF OLD.status = 'cancelled' AND NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF OLD.status = 'cancelled' AND NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
    IF OLD.status = 'registered' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' THEN v_wait_delta := -1; END IF;
  END IF;

  IF v_reg_delta != 0 OR v_wait_delta != 0 THEN
    UPDATE events
    SET registered_count = registered_count + v_reg_delta,
        waitlist_count = waitlist_count + v_wait_delta
    WHERE id = v_event_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill Existing Counters to fix any corruption from previous missing states
UPDATE events e
SET 
  registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
  waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');

````

## supabase/migrations/0006_add_storage_buckets.sql

````sql
-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 0006_add_storage_buckets.sql

-- 1. Public Read Access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

-- 2. Authenticated Insert Access (scoped to user's folder)
CREATE POLICY "Authenticated users can upload avatars and events" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'images' AND
  owner = auth.uid() AND
  (
    ( (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text )
    OR
    ( (storage.foldername(name))[1] = 'events' AND (storage.foldername(name))[2] = auth.uid()::text )
  )
);

-- 3. Authenticated Update Access (own files only)
CREATE POLICY "Users can update their own uploads" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'images' AND owner = auth.uid()
);

-- 4. Authenticated Delete Access (own files only)
CREATE POLICY "Users can delete their own uploads" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'images' AND owner = auth.uid()
);

````

## supabase/migrations/0007_admin_fetch_users.sql

````sql
-- Migration to add admin_fetch_users RPC for AdminDashboard users tab

-- Create the RPC function
CREATE OR REPLACE FUNCTION admin_fetch_users()
RETURNS TABLE (id uuid, email text, role role_enum, is_banned boolean, full_name text) AS $$
BEGIN
  IF (SELECT p.role FROM profiles p WHERE p.id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY SELECT p.id, p.email, p.role, p.is_banned, p.full_name FROM profiles p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke default public execution
REVOKE ALL ON FUNCTION admin_fetch_users() FROM PUBLIC;

-- Grant execution to authenticated users (role check inside function handles authorization)
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;

-- Ignore authenticated executable warnings for intended RPCs and helpers
COMMENT ON FUNCTION admin_fetch_users() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';

````

## supabase/migrations/0008_add_registration_deadline.sql

````sql
ALTER TABLE events ADD COLUMN registration_deadline timestamptz;

````

## supabase/migrations/0009_event_archival.sql

````sql
-- Migration: 0009_event_archival.sql
-- Description: Add soft archival support and pg_cron job to auto-archive old events.

-- 1. Add is_archived column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- 2. Create the archival function
CREATE OR REPLACE FUNCTION archive_old_events()
RETURNS void AS $$
BEGIN
  -- Mark events as archived if they ended > 24 hours ago.
  -- If end_time is null, fallback to start_time.
  UPDATE events 
  SET is_archived = true
  WHERE is_archived = false
    AND (
      (end_time IS NOT NULL AND end_time < now() - interval '24 hours')
      OR
      (end_time IS NULL AND start_time < now() - interval '24 hours')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable pg_cron (Supabase handles this, but it's good practice to ensure extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Schedule the cron job to run hourly
-- It will check and archive any events that qualify.
SELECT cron.schedule(
  'auto-archive-events',
  '0 * * * *', -- Every hour at minute 0
  'SELECT archive_old_events()'
);

````

## supabase/migrations/0010_fix_register_for_event.sql

````sql
-- 0010_fix_register_for_event.sql
-- Prevent registrations after event has ended or registration deadline has passed.
-- Also count 'attended' status in capacity check (attended students still occupy a seat).

CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status registration_status_enum;
  v_user_id uuid := (select auth.uid());
  v_end_time timestamptz;
  v_start_time timestamptz;
  v_deadline timestamptz;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT capacity, end_time, start_time, registration_deadline 
  INTO v_capacity, v_end_time, v_start_time, v_deadline 
  FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  -- Check if event has ended (use end_time if available, otherwise start_time)
  IF COALESCE(v_end_time, v_start_time) < now() THEN
    RAISE EXCEPTION 'This event has already ended.';
  END IF;

  -- Check if registration deadline has passed
  IF v_deadline IS NOT NULL AND v_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed.';
  END IF;

  -- Count both 'registered' and 'attended' students as occupying capacity
  SELECT count(*) INTO v_registered_count 
  FROM registrations 
  WHERE event_id = p_event_id AND status IN ('registered', 'attended');

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  INSERT INTO registrations (event_id, user_id, status, created_at, attended) 
  VALUES (p_event_id, v_user_id, v_status, now(), false)
  ON CONFLICT (event_id, user_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    attended = EXCLUDED.attended;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', p_event_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

````

## supabase/migrations/0011_update_archival_rules.sql

````sql

-- Update the archival function to 1 hour instead of 24 hours
CREATE OR REPLACE FUNCTION archive_old_events()
RETURNS void AS \$\$
BEGIN
  UPDATE events 
  SET is_archived = true
  WHERE is_archived = false
    AND (
      (end_time IS NOT NULL AND end_time < now() - interval '1 hour')
      OR
      (end_time IS NULL AND start_time < now() - interval '1 hour')
    );
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;


````

