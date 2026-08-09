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
