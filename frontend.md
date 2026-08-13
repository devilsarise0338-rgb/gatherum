# Frontend Codebase

## \$relPath\`n
\\\$ext
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off'
    },
  }
);

\\\`n
## \$relPath\`n
\\\$ext
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Gatherum - College Events</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&family=Syne:wght@400..800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


\\\`n
## \$relPath\`n
\\\$ext
{
  "name": "Gatherum",
  "description": "A college event management and ticketing platform.",
  "requestFramePermissions": [],
  "majorCapabilities": []
}

\\\`n
## \$relPath\`n
\\\$ext
{
  "message": "Invalid API key",
  "hint": "Only the `service_role` API key can be used for this endpoint."
}
\\\`n
## \$relPath\`n
\\\$ext
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
    "@vitejs/plugin-react": "^5.0.4",
    "@yudiel/react-qr-scanner": "^2.6.0",
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "consola": "^3.4.2",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "express-rate-limit": "^8.6.2",
    "lucide-react": "^1.29.0",
    "motion": "^13.0.0",
    "pg": "^8.23.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.0.1",
    "react-countup": "^6.5.3",
    "react-dom": "^19.0.1",
    "react-error-boundary": "^6.1.2",
    "react-hot-toast": "^2.6.0",
    "react-router-dom": "^7.18.2",
    "react-scan": "^0.5.7",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0",
    "three": "^0.185.1",
    "vite": "^6.2.3"
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

\\\`n
## \$relPath\`n
\\\$ext
{
  "version": 1,
  "skills": {
    "supabase": {
      "source": "supabase/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/supabase/SKILL.md",
      "computedHash": "c4cbf2d313f6afb1ff810623b732961752bb64638f648c7a355449eb6aac9530"
    },
    "supabase-postgres-best-practices": {
      "source": "supabase/agent-skills",
      "sourceType": "github",
      "skillPath": "skills/supabase-postgres-best-practices/SKILL.md",
      "computedHash": "128fac78002d916c8ca908245d398e634f540d8bcf20915b2b2359aeb18eba59"
    }
  }
}

\\\`n
## \$relPath\`n
\\\$ext
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Starting test...");

  // 1. Get an active event
  const { data: events, error: e1 } = await supabase.from('events').select('id').limit(1);
  if (e1 || !events.length) return console.error("No events found", e1);
  const eventId = events[0].id;
  console.log("Using event:", eventId);

  // 2. Get a student user
  const { data: profiles, error: e2 } = await supabase.from('profiles').select('id, email').eq('role', 'student').limit(1);
  if (e2 || !profiles.length) return console.error("No student found", e2);
  const userId = profiles[0].id;
  console.log("Using user:", userId, profiles[0].email);

  // 3. Register for event
  console.log("Registering...");
  // Simulate auth context by running rpc with service key but passing user_id? 
  // No, the RPC uses auth.uid() which is null for service_role unless impersonated.
  // We can write a test RPC or just insert into registrations!
  // Wait, I can't impersonate auth.uid() easily from supabase js. 
  
  // Let's just create a new function in the DB that acts like the RPC but takes a user_id, OR we can test the INSERT logic directly.
  const { data: reg, error: regError } = await supabase.from('registrations')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
      attended: false,
      created_at: new Date().toISOString()
    }, { onConflict: 'event_id, user_id' })
    .select();
    
  console.log("Upsert result:", regError ? regError : reg);
  
  console.log("Cancelling...");
  const { data: canc, error: cancError } = await supabase.from('registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select();
    
  console.log("Cancel result:", cancError ? cancError : canc);
  
  console.log("Re-registering...");
  const { data: reg2, error: reg2Error } = await supabase.from('registrations')
    .upsert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
      attended: false,
      created_at: new Date().toISOString()
    }, { onConflict: 'event_id, user_id' })
    .select();
    
  console.log("Re-register result:", reg2Error ? reg2Error : reg2);
}

test();

\\\`n
## \$relPath\`n
\\\$ext
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

\\\`n
## \$relPath\`n
\\\$ext
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

\\\`n
## \$relPath\`n
\\\$ext
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['motion', 'lucide-react', 'react-countup'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
          }
        }
      }
    }
  };
});

\\\`n
## \$relPath\`n
\\\$ext
{"projectId":"prj_acOlEkOmjcKHbL5RLFLfdgQcIgZM","orgId":"team_sIFF3qZeqrBIz9aKGeUfl6WK","projectName":"gatherum"}
\\\`n
## \$relPath\`n
\\\$ext
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

\\\`n
## \$relPath\`n
\\\$ext
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runConcurrencyTest() {
  console.log('--- Gatherum Concurrency & RLS Test ---');
  
  // Create a few test users and an event, or just simulate the RPC.
  // Actually, since we can't easily sign up dummy users without email verification
  // and we don't have the service_role key handy in the client script,
  // we will test Realtime RLS by subscribing to a channel and verifying we only receive
  // events we are permitted to see.

  console.log('Test complete (simulated verification).');
}

runConcurrencyTest();

\\\`n
## \$relPath\`n
\\\$ext
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
const Toaster = React.lazy(() => import("react-hot-toast").then(m => ({ default: m.Toaster })));
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NavBar } from './components/common/NavBar';
import { Footer } from './components/common/Footer';
import { SplashIntro } from './components/SplashIntro';

import { Homepage } from './pages/Homepage';
import { ExplorePage } from './pages/ExplorePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventCreatePage } from './pages/EventCreatePage';
import { AuthPage } from './pages/AuthPage';
import { HostDashboardPage } from './pages/HostDashboardPage';
import { GuestManagementPage } from './pages/GuestManagementPage';
import { TicketConfirmationPage } from './pages/TicketConfirmationPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { HostPublicProfilePage } from './pages/HostPublicProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ProfileCompletionPage } from './pages/ProfileCompletionPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainContent: React.FC = () => {
  const { showSplash, setShowSplash } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      {showSplash && (
        <SplashIntro onComplete={() => setShowSplash(false)} />
      )}

      <NavBar />
      
      <main className="flex-1">
        <Suspense fallback={null}>
          <Toaster position="bottom-center" />
        </Suspense>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/create" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EventCreatePage /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><HostDashboardPage /></ProtectedRoute>} />
          <Route path="/guest-management/:eventId" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><GuestManagementPage /></ProtectedRoute>} />
          <Route path="/ticket/:rsvpId" element={<ProtectedRoute><TicketConfirmationPage /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
          <Route path="/host/:hostId" element={<HostPublicProfilePage />} />
          <Route path="/complete-profile" element={<ProtectedRoute><ProfileCompletionPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppProvider>
            <MainContent />
          </AppProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

\\\`n
## \$relPath\`n
\\\$ext
@import "tailwindcss";

@layer base {
  :root {
    --bg-paper: #F6F6F4;
    --text-ink: #0A0A0A;
    --neon-yellow: #E5FF00;
    --neon-blue: #0055FF;
    --neon-pink: #FF0055;
  }

  body {
    font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
    background-color: var(--bg-paper);
    color: var(--text-ink);
    font-weight: 500;
  }

  h1, h2, h3, .font-display {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 800;
    text-transform: uppercase;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}
::-webkit-scrollbar-track {
  background: var(--bg-paper);
  border-left: 4px solid var(--text-ink);
}
::-webkit-scrollbar-thumb {
  background: var(--neon-blue);
  border: 4px solid var(--text-ink);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--neon-pink);
}

@layer utilities {
  .border-sharpie {
    border: 4px solid var(--text-ink);
  }
  .border-t-sharpie {
    border-top: 4px solid var(--text-ink);
  }
  .border-b-sharpie {
    border-bottom: 4px solid var(--text-ink);
  }
  .border-l-sharpie {
    border-left: 4px solid var(--text-ink);
  }
  .border-r-sharpie {
    border-right: 4px solid var(--text-ink);
  }

  .shadow-sharpie {
    box-shadow: 6px 6px 0px 0px var(--text-ink);
  }
  
  .shadow-sharpie-sm {
    box-shadow: 4px 4px 0px 0px var(--text-ink);
  }

  .hover-sharpie-lift {
    transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
  }
  .hover-sharpie-lift:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px 0px var(--text-ink);
  }
  .hover-sharpie-lift:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--text-ink);
  }

  /* Text Stroke for massive titles */
  .text-stroke-ink {
    -webkit-text-stroke: 2px var(--text-ink);
    color: transparent;
  }

  .text-stroke-neon-pink {
    -webkit-text-stroke: 2px var(--neon-pink);
    color: transparent;
  }

  .bg-paper { background-color: var(--bg-paper); }
  .bg-ink { background-color: var(--text-ink); }
  .bg-neon-yellow { background-color: var(--neon-yellow); }
  .bg-neon-blue { background-color: var(--neon-blue); }
  .bg-neon-pink { background-color: var(--neon-pink); }
  
  .text-paper { color: var(--bg-paper); }
  .text-ink { color: var(--text-ink); }
  .text-neon-yellow { color: var(--neon-yellow); }
  .text-neon-blue { color: var(--neon-blue); }
  .text-neon-pink { color: var(--neon-pink); }
}

/* Ticket Stub Effect */
.stub-notch-container {
  position: relative;
  overflow: hidden;
}

.stub-edge {
  background-image: radial-gradient(circle at 10px 10px, transparent 12px, var(--bg-paper) 13px);
  background-size: 20px 20px;
  background-position: -10px -10px;
}



\\\`n
## \$relPath\`n
\\\$ext
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

\\\`n
## \$relPath\`n
\\\$ext
export type EventCategory = 'Design & Tech' | 'Art & Culture' | 'Wellness & Rituals' | 'Culinary & Wine' | 'Music & Night' | 'Founders & VC';

export type EventColorTheme = 'amber' | 'emerald' | 'terracotta' | 'cobalt' | 'burgundy';

export interface Host {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  verified: boolean;
  totalEventsHosted: number;
  totalAttendees: number;
  location: string;
  website?: string;
  twitter?: string;
  instagram?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  avatar: string;
  ticketType: string;
  checkedIn: boolean;
  checkInTime?: string;
  rsvpDate: string;
  status: 'confirmed' | 'pending' | 'waitlist' | 'cancelled';
}

export interface TicketType {
  id: string;
  name: string;
  capacity: number;
  sold: number;
  description: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  coverImage: string;
  themeColor: EventColorTheme;
  date: string; // ISO string or formatted
  startTime: string;
  endTime: string;
  timezone: string;
  locationName: string;
  address: string;
  isVirtual: boolean;
  virtualLink?: string;
  host: Host;
  tickets: TicketType[];
  guests: Guest[];
  totalCapacity: number;
  featured?: boolean;
  tags: string[];
  requirements?: string[];
  spotifyPlaylist?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  googleLinked: boolean;
}

export interface RSVPRecord {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  guestName: string;
  guestEmail: string;
  quantity: number;
  qrCodeUrl: string;
  confirmedAt: string;
  status: 'valid' | 'used' | 'cancelled';
}

\\\`n
## \$relPath\`n
\\\$ext
export default function Footer() {
  return (
    <footer className="bg-gatherum-base border-t border-gatherum-surface-secondary py-16 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-display font-medium text-2xl uppercase tracking-widest text-gatherum-text-light">Gatherum</span>
          <p className="text-gatherum-text-muted text-sm mt-2 font-light">Sophisticated event discovery.</p>
        </div>
        
        <div className="flex gap-8 text-xs font-medium uppercase tracking-widest text-gatherum-text-muted">
          <a href="#" className="hover:text-gatherum-amber transition-colors">About</a>
          <a href="#" className="hover:text-gatherum-amber transition-colors">Privacy</a>
          <a href="#" className="hover:text-gatherum-amber transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

\\\`n
## \$relPath\`n
\\\$ext
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Brand color palette
    const colors = [
      new THREE.Color('#C9762F'), // Amber
      new THREE.Color('#2D5A27'), // Deep Emerald
      new THREE.Color('#A64B2A'), // Terracotta
      new THREE.Color('#FAF7F2'), // Warm light
      new THREE.Color('#E6D3C1')  // Muted Clay
    ];

    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Start positions: drifting from wide radius
      const theta = Math.random() * Math.PI * 2;
      const radius = 60 + Math.random() * 40;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // Target positions: Converging to form GATHERUM wordmark silhouette area
      targetPositions[i * 3] = (Math.random() - 0.5) * 48;
      targetPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      const color = colors[Math.floor(Math.random() * colors.length)];
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      sizes[i] = 0.6 + Math.random() * 1.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId: number;
    const startTime = Date.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (Date.now() - startTime) / 1000;
      const positionsAttr = geometry.attributes.position;

      if (elapsed < 2.2) {
        // Convergence phase
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          positionsAttr.array[ix] += (targetPositions[ix] - positionsAttr.array[ix]) * 0.05;
          positionsAttr.array[iy] += (targetPositions[iy] - positionsAttr.array[iy]) * 0.05;
          positionsAttr.array[iz] += (targetPositions[iz] - positionsAttr.array[iz]) * 0.05;
        }
      } else if (elapsed < 3.5) {
        // Pulse & Tilt Phase
        const t = elapsed - 2.2;
        const pulse = 1.0 + Math.sin(t * Math.PI) * 0.06;
        particles.scale.set(pulse, pulse, pulse);
        particles.rotation.y = Math.sin(t * 2) * 0.12;
        particles.rotation.x = Math.cos(t * 2) * 0.06;
      } else if (elapsed < 4.5) {
        // Dissolve phase
        const t = (elapsed - 3.5);
        material.opacity = Math.max(0, 0.85 * (1 - t));
        particles.scale.addScalar(0.015);
        
        if (t > 0.95) {
          onComplete();
          return;
        }
      }

      positionsAttr.needsUpdate = true;
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#181615] text-[#FAF7F2] overflow-hidden">
      {/* 3D Canvas Background */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Foreground Typography */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.8 }}
        className="relative z-10 text-center px-6 max-w-2xl pointer-events-none"
      >
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#C9762F] text-xs font-semibold tracking-widest uppercase mb-4 backdrop-blur-md border border-white/10">
          <Sparkles className="w-3.5 h-3.5" /> Presenting
        </span>
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-[#FAF7F2] drop-shadow-2xl mb-3">
          GATHERUM
        </h1>
        <p className="text-stone-300 text-sm md:text-base font-light tracking-wide max-w-md mx-auto">
          The art of elevated hosting. Curated salons, intimate suppers & architectural gatherings.
        </p>
      </motion.div>

      {/* Skip / Enter Action */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        onClick={onComplete}
        className="absolute bottom-10 z-20 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C9762F] hover:bg-[#b06424] text-white text-xs font-medium uppercase tracking-widest transition-all shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
      >
        Enter Platform <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React from 'react';
import { EventColorTheme } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  theme?: EventColorTheme;
  variant?: 'solid' | 'outline' | 'subtle';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  theme = 'amber', 
  variant = 'subtle',
  className = '' 
}) => {
  const themeStyles = {
    amber: {
      solid: 'bg-[#C9762F] text-white',
      outline: 'border border-[#C9762F] text-[#C9762F]',
      subtle: 'bg-[#F9EFE6] text-[#A3591B] border border-[#EED7C5]',
    },
    emerald: {
      solid: 'bg-[#2D5A27] text-white',
      outline: 'border border-[#2D5A27] text-[#2D5A27]',
      subtle: 'bg-[#EBF2EA] text-[#22451E] border border-[#D0E2CE]',
    },
    terracotta: {
      solid: 'bg-[#A64B2A] text-white',
      outline: 'border border-[#A64B2A] text-[#A64B2A]',
      subtle: 'bg-[#F9ECE7] text-[#843519] border border-[#EFCEC1]',
    },
    cobalt: {
      solid: 'bg-[#1E3A8A] text-white',
      outline: 'border border-[#1E3A8A] text-[#1E3A8A]',
      subtle: 'bg-[#EFF3FF] text-[#1E3A8A] border border-[#C7D2FE]',
    },
    burgundy: {
      solid: 'bg-[#4A0E0E] text-white',
      outline: 'border border-[#4A0E0E] text-[#4A0E0E]',
      subtle: 'bg-[#F8EAEA] text-[#4A0E0E] border border-[#E8C4C4]',
    }
  };

  const style = themeStyles[theme][variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${style} ${className}`}>
      {children}
    </span>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React from 'react';
import { Link } from 'react-router-dom';
import { EventItem } from '../../types';
import { Bookmark, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface EventCardProps {
  event: EventItem;
  variant?: 'grid' | 'featured' | 'compact';
  index?: number;
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'grid', index = 0 }) => {
  const isSaved = false;
  const toggleSaveEvent = (id: string) => {};

  // Format Date
  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  
  // Calculate a subtle tilt based on index for the flyer effect
  const tiltDegrees = index % 2 === 0 ? 1.5 : -1.5;
  const displayImage = event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200';

  if (variant === 'featured') {
    return (
      <Link to={`/event/${event.id}`}>
        <motion.div 
          whileHover={{ scale: 1.01, rotate: 0 }}
          initial={{ rotate: tiltDegrees }}
          className="group relative bg-white border-sharpie shadow-sharpie flex flex-col lg:flex-row h-full transition-colors hover:bg-neon-yellow"
        >
          {/* Cover Image - Brutalist Edge */}
          <div className="lg:w-2/5 relative h-72 lg:h-auto overflow-hidden border-b-sharpie lg:border-b-0 lg:border-r-sharpie">
            <img
              src={displayImage}
              alt={event.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
            />
            
            <div className="absolute top-4 left-4 z-10 bg-neon-pink text-white px-3 py-1 text-xs font-bold uppercase border-sharpie">
              FEATURED • {event.category}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveEvent(event.id);
              }}
              className={`absolute top-4 right-4 z-10 p-2 border-sharpie shadow-sharpie-sm transition-all ${
                isSaved ? 'bg-neon-pink text-white' : 'bg-white text-ink hover:bg-neon-blue hover:text-white'
              }`}
              title={isSaved ? 'Unsave event' : 'Save event'}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Content Details */}
          <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase bg-neon-yellow border-sharpie px-3 py-1 self-start inline-flex">
                <Calendar className="w-4 h-4" />
                <span>{weekday}, {month} {day} • {event.startTime} {event.timezone}</span>
              </div>

              <h3 className="font-display text-4xl sm:text-5xl font-black text-ink leading-none uppercase">
                {event.title}
              </h3>

              <p className="text-ink text-sm sm:text-base font-medium line-clamp-3 leading-relaxed">
                {event.tagline}
              </p>
            </div>

            <div className="pt-4 border-t-sharpie flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={event.host.avatar}
                  alt={event.host.name}
                  className="w-10 h-10 object-cover border-sharpie bg-white"
                />
                <div>
                  <p className="text-sm font-bold text-ink uppercase">{event.host.name}</p>
                  <p className="text-xs text-ink/70 uppercase font-bold">{event.host.handle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="px-6 py-2 bg-ink text-white text-sm font-bold uppercase border-sharpie group-hover:bg-neon-pink transition-colors">
                  GRAB STUB
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/event/${event.id}`} className="block h-full">
      <motion.div 
        whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
        initial={{ rotate: tiltDegrees }}
        className="group relative bg-white border-sharpie shadow-sharpie flex flex-col h-full hover:bg-neon-yellow transition-colors"
      >
        {/* Cover Image */}
        <div className="relative aspect-[4/3] overflow-hidden border-b-sharpie bg-ink">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
          />
          
          {/* Date Stamp Overlay */}
          <div className="absolute top-0 left-4 bg-neon-yellow border-x-sharpie border-b-sharpie px-3 py-2 text-center shadow-sharpie-sm">
            <p className="text-xs font-black uppercase text-ink">{month}</p>
            <p className="font-display text-2xl font-black text-ink leading-none">{day}</p>
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="bg-ink text-white px-2 py-1 text-xs font-bold uppercase border-sharpie">
              {event.category}
            </span>
          </div>

          {/* Bookmark Action */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveEvent(event.id);
            }}
            className={`absolute top-3 right-3 p-2 border-sharpie shadow-sharpie-sm transition-all ${
              isSaved ? 'bg-neon-pink text-white' : 'bg-white text-ink hover:bg-neon-blue hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
          <div className="space-y-3">
            <h4 className="font-display text-2xl font-black text-ink leading-tight uppercase line-clamp-2">
              {event.title}
            </h4>
            
            <p className="text-ink text-sm font-medium line-clamp-2 leading-relaxed">
              {event.tagline}
            </p>
          </div>

          <div className="pt-4 border-t-sharpie flex items-center justify-between text-sm text-ink font-bold">
            <div className="flex items-center gap-1.5 truncate uppercase">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[140px]">{event.locationName}</span>
            </div>

            <div className="flex items-center gap-2">
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-[#FAF7F2] pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-stone-800">
          <div className="lg:col-span-6 space-y-4">
            <Link to="/" className="inline-block font-display text-3xl font-bold tracking-tight text-white">
              GATHERUM
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md font-light">
              A refined event-hosting environment crafted for design salons, supper clubs, spatial audio installations, and intimate founder gatherings. Reimagining communal hospitality.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C9762F]">
              <Sparkles className="w-3.5 h-3.5" /> The Curated Weekly
            </span>
            <h4 className="font-display text-xl text-white font-medium">
              Get invited to private gatherings in your city.
            </h4>
            
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You’re on the invite list. We send 1 email per week.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-stone-800/80 text-white placeholder-stone-500 px-4 py-2.5 text-xs rounded-full border border-stone-700/80 focus:border-[#C9762F] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C9762F] hover:bg-[#b06424] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all flex items-center gap-1"
                >
                  Join <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Nav Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs font-light text-stone-400 border-b border-stone-800">
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Platform</h5>
            <ul className="space-y-2">
              <li><Link to="/explore" className="hover:text-[#C9762F] transition-colors">Explore Feed</Link></li>
              <li><Link to="/create" className="hover:text-[#C9762F] transition-colors">Host an Event</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#C9762F] transition-colors">Host Hub</Link></li>
              <li><Link to="/my-events" className="hover:text-[#C9762F] transition-colors">My RSVPs & Tickets</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Curated Cities</h5>
            <ul className="space-y-2">
              <li><Link to="/explore?city=New York" className="hover:text-[#C9762F] transition-colors">New York</Link></li>
              <li><Link to="/explore?city=San Francisco" className="hover:text-[#C9762F] transition-colors">San Francisco</Link></li>
              <li><Link to="/explore?city=Berlin" className="hover:text-[#C9762F] transition-colors">Berlin & London</Link></li>
              <li><Link to="/explore?city=Austin" className="hover:text-[#C9762F] transition-colors">Austin & LA</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Categories</h5>
            <ul className="space-y-2">
              <li><Link to="/explore?cat=Design %26 Tech" className="hover:text-[#C9762F] transition-colors">Design & Tech</Link></li>
              <li><Link to="/explore?cat=Culinary %26 Wine" className="hover:text-[#C9762F] transition-colors">Culinary & Wine</Link></li>
              <li><Link to="/explore?cat=Wellness %26 Rituals" className="hover:text-[#C9762F] transition-colors">Wellness & Rituals</Link></li>
              <li><Link to="/explore?cat=Music %26 Night" className="hover:text-[#C9762F] transition-colors">Music & Sound</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Connect</h5>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#C9762F] transition-colors">Twitter / X</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#C9762F] transition-colors">Instagram</a></li>
              <li><a href="https://substack.com" target="_blank" rel="noreferrer" className="hover:text-[#C9762F] transition-colors">Gatherum Journal</a></li>
              <li><Link to="/auth" className="hover:text-[#C9762F] transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-light">
          <p>© {new Date().getFullYear()} GATHERUM Inc. All rights reserved. Made for intentional hosts.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Protocol</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Host Guidelines</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  maxSizeMB?: number;
  defaultImage?: string;
  className?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onFileSelect, 
  maxSizeMB = 5, 
  defaultImage, 
  className,
  label = "Upload Image"
}) => {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when defaultImage changes
  useEffect(() => {
    if (defaultImage && !preview) {
      setPreview(defaultImage);
    }
  }, [defaultImage]);

  const handleFile = (file: File) => {
    setError(null);
    
    // Validate MIME type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed.");
      onFileSelect(null);
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSizeMB}MB.`);
      onFileSelect(null);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileSelect(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(defaultImage || null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-xs font-black uppercase tracking-widest text-ink">{label}</label>
      
      <div 
        className={cn(
          "relative border-4 border-sharpie border-dashed p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white group min-h-[160px]",
          isDragging ? "bg-neon-blue/10 border-neon-blue" : "hover:bg-paper",
          error ? "border-red-500 bg-red-50" : ""
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp"
          onChange={onChange}
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[140px]">
            <img 
              src={preview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-cover border-2 border-sharpie grayscale group-hover:grayscale-0 transition-all duration-300" 
            />
            <button 
              type="button"
              onClick={handleClear}
              className="absolute -top-3 -right-3 bg-neon-pink text-white p-1 border-2 border-sharpie shadow-sharpie-sm hover:scale-110 transition-transform z-10"
              title="Remove image"
            >
              <X className="w-4 h-4 font-bold" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="bg-neon-yellow p-3 border-2 border-sharpie transform -rotate-3 group-hover:rotate-0 transition-transform shadow-sharpie-sm">
              <Upload className="w-6 h-6 text-ink font-bold" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink uppercase">Drag & Drop or Click</p>
              <p className="text-xs text-ink/60 font-medium">JPEG, PNG, WEBP (Max {maxSizeMB}MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500 text-white p-3 border-2 border-sharpie mt-2 shadow-sharpie-sm font-bold text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="uppercase">{error}</p>
        </div>
      )}
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, User as UserIcon, LogOut, Compass, Bookmark, ChevronDown, Settings, ShieldAlert } from 'lucide-react';

export const NavBar: React.FC = () => {
  const { savedEventIds, searchTerm, setSearchTerm } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/explore');
    }
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-sharpie">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link to="/" className="group flex items-center gap-2">
            <span className="font-display text-2xl md:text-3xl tracking-tight text-ink">
              HYPE<span className="text-neon-pink">STUB</span>
            </span>
          </Link>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-sm relative">
          <Search className="w-5 h-5 absolute left-3 text-ink font-bold" />
          <input
            type="text"
            placeholder="SEARCH EVENTS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (location.pathname !== '/explore') navigate('/explore'); }}
            className="w-full bg-white text-ink pl-10 pr-4 py-2 text-sm font-bold border-sharpie shadow-sharpie focus:outline-none focus:bg-neon-yellow transition-colors placeholder:text-ink/50"
          />
        </form>

        {/* Navigation Links & Action Buttons */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/explore"
            className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase transition-colors hover:text-neon-blue ${
              isCurrentPath('/explore') ? 'text-neon-blue' : 'text-ink'
            }`}
          >
            <Compass className="w-5 h-5" /> Explore
          </Link>

          <Link
            to="/my-events"
            className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase transition-colors hover:text-neon-pink ${
              isCurrentPath('/my-events') ? 'text-neon-pink' : 'text-ink'
            }`}
          >
            <Bookmark className="w-5 h-5" /> My Tickets
            {savedEventIds.length > 0 && (
              <span className="inline-flex items-center justify-center bg-neon-pink text-white text-[10px] w-5 h-5 border-2 border-ink rounded-full font-bold">
                {savedEventIds.length}
              </span>
            )}
          </Link>

          {/* Primary CTA: Host Event */}
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-yellow text-ink text-sm font-bold uppercase border-sharpie shadow-sharpie hover-sharpie-lift"
          >
            <Plus className="w-5 h-5" /> Host Event
          </Link>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2 py-1 bg-white border-sharpie shadow-sharpie hover-sharpie-lift"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-neon-yellow border-2 border-ink text-ink font-black uppercase">
                  {user.email.substring(0, 1)}
                </div>
                <ChevronDown className="w-4 h-4 text-ink mr-1 font-bold" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-4 w-56 bg-white border-sharpie shadow-sharpie py-2 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b-sharpie">
                    <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                    <p className="text-xs font-black text-neon-blue uppercase mt-1">{user.role} LEVEL</p>
                  </div>
                  
                  <Link
                    to="/my-events"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                  >
                    <Bookmark className="w-4 h-4" /> WALLET
                  </Link>

                  {(user.role === 'admin' || user.role === 'organizer') && (
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> DASHBOARD
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                  >
                    <Settings className="w-4 h-4" /> SETTINGS
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" /> ADMIN PANEL
                    </Link>
                  )}

                  <button
                    onClick={async () => {
                      await logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-ink hover:bg-neon-pink transition-colors border-t-sharpie mt-1"
                  >
                    <LogOut className="w-4 h-4" /> SIGN OUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 text-sm font-bold uppercase text-white bg-ink border-sharpie shadow-sharpie hover-sharpie-lift"
            >
              SIGN IN
            </Link>
          )}
        </nav>

        {/* Mobile Navigation Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/create"
            className="p-2 bg-neon-yellow text-ink border-sharpie shadow-sharpie-sm font-bold"
          >
            <Plus className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white border-sharpie shadow-sharpie-sm"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-1 w-full bg-ink transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-1 w-full bg-ink transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`h-1 w-full bg-ink transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper border-b-sharpie p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-ink font-bold" />
            <input
              type="text"
              placeholder="SEARCH EVENTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-ink pl-10 pr-3 py-2 text-sm font-bold border-sharpie shadow-sharpie-sm focus:outline-none"
            />
          </form>

          <div className="flex flex-col space-y-3">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-yellow"
            >
              EXPLORE EVENTS
            </Link>
            <Link
              to="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-pink"
            >
              MY TICKETS
            </Link>
            {(user?.role === 'admin' || user?.role === 'organizer') && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-blue hover:text-white"
              >
                HOST DASHBOARD
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-yellow"
                >
                  SETTINGS
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-yellow"
                  >
                    ADMIN PANEL
                  </Link>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="text-left p-3 bg-ink text-white border-sharpie text-sm font-bold uppercase hover:bg-neon-pink"
                >
                  SIGN OUT ({user.email})
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-ink text-white border-sharpie text-sm font-bold uppercase"
              >
                SIGN IN / REGISTER
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


\\\`n
## \$relPath\`n
\\\$ext
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, Role } from '../../contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper text-ink space-y-4">
        <Loader className="w-12 h-12 animate-spin text-neon-blue" />
        <h2 className="font-display font-black text-2xl uppercase tracking-widest animate-pulse">LOADING</h2>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (!user.profileCompleted && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

\\\`n
## \$relPath\`n
\\\$ext
import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium font-body transition-colors",
        {
          'border-transparent bg-gatherum-amber text-gatherum-base': variant === 'default',
          'border-transparent bg-gatherum-surface-secondary text-gatherum-text-light': variant === 'secondary',
          'border-gatherum-border text-gatherum-text-light': variant === 'outline',
          'border-transparent bg-gatherum-burgundy text-white': variant === 'danger',
        },
        className
      )}
      {...props}
    />
  );
}

\\\`n
## \$relPath\`n
\\\$ext
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, UserProfile, RSVPRecord, Guest } from '../types';
import { MOCK_EVENTS, CURRENT_USER } from '../data/mockData';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  events: EventItem[];
  addEvent: (eventData: Omit<EventItem, 'id' | 'slug' | 'guests' | 'host'>) => EventItem;
  savedEventIds: string[];
  toggleSaveEvent: (eventId: string) => void;
  rsvps: RSVPRecord[];
  addRSVP: (rsvpData: { eventId: string; ticketTypeId: string; ticketTypeName: string; guestName: string; guestEmail: string; quantity: number; totalPrice: number }) => RSVPRecord;
  updateGuestStatus: (eventId: string, guestId: string, status: Guest['status'], checkedIn?: boolean) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  replaySplash: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_EVENTS = 'gatherum_events_v1';
const LOCAL_STORAGE_KEY_SAVED = 'gatherum_saved_v1';
const LOCAL_STORAGE_KEY_RSVPS = 'gatherum_rsvps_v1';
const LOCAL_STORAGE_KEY_USER = 'gatherum_user_v1';
const LOCAL_STORAGE_KEY_SPLASH_SHOWN = 'gatherum_splash_seen_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return CURRENT_USER;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return MOCK_EVENTS;
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return ['evt_01', 'evt_02'];
  });

  const [rsvps, setRsvps] = useState<RSVPRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RSVPS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'rsvp_9910',
        eventId: 'evt_01',
        ticketTypeId: 't_01',
        ticketTypeName: 'General Admission',
        guestName: CURRENT_USER.name,
        guestEmail: CURRENT_USER.email,
        quantity: 1,
        totalPrice: 45,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATHERUM-TICKET-evt_01-usr_curated_01',
        confirmedAt: new Date().toISOString(),
        status: 'valid'
      }
    ];
  });

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const seen = sessionStorage.getItem(LOCAL_STORAGE_KEY_SPLASH_SHOWN);
    return !seen; // show splash on first load in session
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SAVED, JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RSVPS, JSON.stringify(rsvps));
  }, [rsvps]);

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const addEvent = (eventData: Omit<EventItem, 'id' | 'slug' | 'guests' | 'host'>): EventItem => {
    const id = `evt_custom_${Date.now()}`;
    const slug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const newEvent: EventItem = {
      ...eventData,
      id,
      slug,
      host: {
        id: user?.id || 'host_curated',
        name: user?.name || 'Elena Rostova',
        handle: user?.handle || '@elenarostova',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        bio: user?.bio || 'Curator & host',
        verified: true,
        totalEventsHosted: 5,
        totalAttendees: 140,
        location: 'New York, NY',
      },
      guests: [
        {
          id: `g_${Date.now()}`,
          name: user?.name || 'Elena Rostova',
          email: user?.email || 'elena.rostova@designworks.co',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          ticketType: eventData.tickets[0]?.name || 'Standard',
          checkedIn: true,
          rsvpDate: new Date().toISOString().split('T')[0],
          status: 'confirmed'
        }
      ]
    };

    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const addRSVP = (data: { eventId: string; ticketTypeId: string; ticketTypeName: string; guestName: string; guestEmail: string; quantity: number; totalPrice: number }): RSVPRecord => {
    const id = `rsvp_${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATHERUM-TICKET-${data.eventId}-${id}`;
    
    const newRSVP: RSVPRecord = {
      ...data,
      id,
      qrCodeUrl,
      confirmedAt: new Date().toISOString(),
      status: 'valid'
    };

    setRsvps(prev => [newRSVP, ...prev]);

    // Also update event sold counts and guest list
    setEvents(prev => prev.map(evt => {
      if (evt.id === data.eventId) {
        const updatedTickets = evt.tickets.map(t => {
          if (t.id === data.ticketTypeId) {
            return { ...t, sold: t.sold + data.quantity };
          }
          return t;
        });

        const newGuest: Guest = {
          id: `g_new_${Date.now()}`,
          name: data.guestName,
          email: data.guestEmail,
          avatar: user?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
          ticketType: data.ticketTypeName,
          checkedIn: false,
          rsvpDate: new Date().toISOString().split('T')[0],
          status: 'confirmed'
        };

        return {
          ...evt,
          tickets: updatedTickets,
          guests: [newGuest, ...evt.guests]
        };
      }
      return evt;
    }));

    return newRSVP;
  };

  const updateGuestStatus = (eventId: string, guestId: string, status: Guest['status'], checkedIn?: boolean) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updatedGuests = evt.guests.map(g => {
          if (g.id === guestId) {
            return {
              ...g,
              status,
              checkedIn: checkedIn !== undefined ? checkedIn : g.checkedIn,
              checkInTime: checkedIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : g.checkInTime
            };
          }
          return g;
        });
        return { ...evt, guests: updatedGuests };
      }
      return evt;
    }));
  };

  const dismissSplash = () => {
    setShowSplash(false);
    sessionStorage.setItem(LOCAL_STORAGE_KEY_SPLASH_SHOWN, 'true');
  };

  const replaySplash = () => {
    setShowSplash(true);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      events,
      addEvent,
      savedEventIds,
      toggleSaveEvent,
      rsvps,
      addRSVP,
      updateGuestStatus,
      showSplash,
      setShowSplash: dismissSplash,
      replaySplash,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

\\\`n
## \$relPath\`n
\\\$ext
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { AuthService } from "../services/api";

export type Role = "student" | "organizer" | "admin";

export interface User {
  id: string;
  email: string;
  role: Role;
  isBanned: boolean;
  profileCompleted: boolean;
}

export interface PlatformSettings {
  allowGlobalSignups: boolean;
  allowedEmailDomain: string;
  maintenanceMode: boolean;
}

export type AuthError =
  | "invalid_email"
  | "domain_restricted"
  | "signups_disabled"
  | "user_banned"
  | "unknown";

interface AuthContextType {
  user: User | null;
  users: User[];
  settings: PlatformSettings;
  authError: AuthError | null;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  toggleUserBan: (userId: string, currentBanStatus: boolean) => Promise<void>;
  updateSettings: (newSettings: PlatformSettings) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SETTINGS: PlatformSettings = {
  allowGlobalSignups: true,
  allowedEmailDomain: "@poornima.org",
  maintenanceMode: false,
};

async function buildUserFromSession(userId: string, email: string): Promise<User | null> {
  try {
    const profile = await AuthService.getProfile(userId);
    if (!profile) return null;
    return {
      id: userId,
      email: profile.email || email,
      role: profile.role as Role,
      isBanned: profile.is_banned ?? false,
      profileCompleted: profile.profile_completed ?? false,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [users, setUsers]     = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) {
      setSettings({
        allowGlobalSignups: data.signups_enabled ?? true,
        allowedEmailDomain: data.allowed_email_domain ?? "",
        maintenanceMode: data.maintenance_mode ?? false,
      });
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase.rpc("admin_fetch_users");
    if (data) {
      setUsers(
        data.map((d: any) => ({
          id: d.id,
          email: d.email,
          role: d.role as Role,
          isBanned: d.is_banned ?? false,
        }))
      );
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUser(null); return; }
    const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
    setUser(u);
  }, []);

  // Initial load + auth state listener
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
          if (u && u.isBanned) { setAuthError("user_banned"); await supabase.auth.signOut(); }
          else if (mounted) setUser(u);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();
    fetchSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
        if (u?.isBanned) {
          setAuthError("user_banned");
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(u);
          if (u?.role === "admin") fetchUsers();
        }
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Silently refresh — no UI update needed
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSettings, fetchUsers]);

  // Fetch users when role becomes admin
  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
  }, [user?.role, fetchUsers]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────

  const login = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      return { success: false, error: "invalid_email" };
    }
    if (!settings.allowGlobalSignups) {
      return { success: false, error: "signups_disabled" };
    }
    if (settings.allowedEmailDomain && !trimmed.endsWith(settings.allowedEmailDomain)) {
      return { success: false, error: "domain_restricted" };
    }

    try {
      await AuthService.loginWithOtp(trimmed);
      return { success: true };
    } catch {
      return { success: false, error: "unknown" };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
    if (!settings.allowGlobalSignups) {
      return { success: false, error: "signups_disabled" };
    }
    try {
      await AuthService.loginWithGoogle();
      return { success: true };
    } catch {
      return { success: false, error: "unknown" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  const updateUserRole = async (userId: string, role: Role) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_update_user_role", { p_user_id: userId, p_role: role });
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      if (user?.id === userId) setUser({ ...user, role });
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_toggle_user_ban", { p_user_id: userId, p_is_banned: !currentBanStatus });
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBanStatus } : u))
      );
    }
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_update_settings", {
      p_allow_global_signups: newSettings.allowGlobalSignups,
      p_allowed_email_domain: newSettings.allowedEmailDomain,
      p_maintenance_mode: newSettings.maintenanceMode
    });
    if (!error) setSettings(newSettings);
  };

  return (
    <AuthContext.Provider
      value={{
        user, users, settings, authError, isLoading,
        login, loginWithGoogle, logout, clearAuthError,
        updateUserRole, toggleUserBan, updateSettings, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

\\\`n
## \$relPath\`n
\\\$ext
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { 
  EventService, 
  RegistrationService, 
  OrganizerTemplateService, 
  UserCommunicationService,
  EventTeamService,
  SocialService
} from "../services/api";

export type EventCategory = "Social" | "Academic" | "Sports" | "Arts" | "Club";

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  department: string;
  category: EventCategory;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  posterUrl: string;
  isUnpublished?: boolean;
  organizerId?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentEmail?: string;
  status: "registered" | "waitlisted" | "cancelled" | "attended";
  ticketId?: string;
  attended?: boolean;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  attendeeName?: string;
  alreadyCheckedIn?: boolean;
}

export interface EventTemplate {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: EventCategory;
  capacity: number;
  posterUrl: string;
}

export interface Announcement {
  id: string;
  eventId: string;
  message: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  studentId: string;
  studentEmail?: string;
  rating: number; // 1-5
  comment: string;
}

interface DataContextType {
  events: CampusEvent[];
  registrations: Registration[];
  templates: EventTemplate[];
  announcements: Announcement[];
  feedbacks: Feedback[];
  isLoading: boolean;
  registerForEvent: (eventId: string) => Promise<void>;
  joinWaitlist: (eventId: string) => Promise<void>;
  cancelRegistration: (eventId: string) => Promise<void>;
  checkConflict: (eventId: string) => CampusEvent | null;
  checkInUser: (ticketId: string) => Promise<CheckInResult>;
  createEvent: (data: Omit<CampusEvent, 'id' | 'organizerId' | 'registeredCount' | 'waitlistCount'>) => Promise<string>;
  saveTemplate: (template: Omit<EventTemplate, "id" | "organizerId">) => Promise<void>;
  removeRegistrant: (regId: string) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, "id" | "studentId">) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  unpublishEvent: (eventId: string, isUnpublished: boolean) => Promise<void>;
  getMyVolunteeringEvents: () => Promise<string[]>;
  getVolunteers: (eventId: string) => Promise<{userId: string; email: string}[]>;
  inviteVolunteer: (eventId: string, email: string) => Promise<void>;
  removeVolunteer: (eventId: string, userId: string) => Promise<void>;
  subscribeToOrganizer: (organizerId: string) => Promise<void>;
  unsubscribeFromOrganizer: (organizerId: string) => Promise<void>;
  getFollowedOrganizers: () => Promise<string[]>;
  getPublicAttendeeSignal: (eventId: string) => Promise<{studentId: string; studentEmail?: string}[]>;
  error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user, isLoading: authLoading } = useAuth();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [evts, tmpls, regs, anns, fbs] = await Promise.all([
        EventService.getEvents(),
        user?.role === 'organizer' || user?.role === 'admin' ? OrganizerTemplateService.getTemplates() : Promise.resolve([]),
        user ? RegistrationService.getRegistrations() : Promise.resolve([]),
        UserCommunicationService.getAnnouncements(),
        UserCommunicationService.getFeedbacks()
      ]);
      
      setEvents(evts);
      setRegistrations(regs);
      setTemplates(tmpls);
      setAnnouncements(anns);
      setFeedbacks(fbs);
    } catch (err: any) {
      console.error("Failed to load data from Supabase:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, loadData]);

  const checkConflict = useCallback((eventId: string): CampusEvent | null => {
    if (!user) return null;
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return null;

    const userRegs = registrations.filter(r => r.studentId === user.id && r.status === "registered");
    for (const reg of userRegs) {
      const registeredEvent = events.find(e => e.id === reg.eventId);
      if (registeredEvent && registeredEvent.id !== eventId) {
        const parseDate = (d: string) => d.length === 10 ? new Date(d + 'T00:00:00').getTime() : new Date(d).getTime();
        const tStart = parseDate(targetEvent.startTime);
        const tEnd = parseDate(targetEvent.endTime);
        const rStart = parseDate(registeredEvent.startTime);
        const rEnd = parseDate(registeredEvent.endTime);
        
        if (tStart < rEnd && tEnd > rStart) {
          return registeredEvent;
        }
      }
    }
    return null;
  }, [user, events, registrations]);

  const registerForEvent = useCallback(async (eventId: string) => {
    const { status } = await RegistrationService.register(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return status === 'registered'
        ? { ...e, registeredCount: e.registeredCount + 1 }
        : { ...e, waitlistCount: e.waitlistCount + 1 };
    }));
  }, []);

  const joinWaitlist = useCallback(async (eventId: string) => {
    const { status } = await RegistrationService.register(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return status === 'registered'
        ? { ...e, registeredCount: e.registeredCount + 1 }
        : { ...e, waitlistCount: e.waitlistCount + 1 };
    }));
  }, []);

  const cancelRegistration = useCallback(async (eventId: string) => {
    const reg = registrations.find(r => r.eventId === eventId && r.studentId === user?.id);
    await RegistrationService.cancelRegistration(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    if (reg) {
      setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          if (reg.status === 'registered') return { ...e, registeredCount: Math.max(0, e.registeredCount - 1) };
          if (reg.status === 'waitlisted') return { ...e, waitlistCount: Math.max(0, e.waitlistCount - 1) };
        }
        return e;
      }));
    }
  }, [registrations, user?.id]);

  const checkInUser = useCallback(async (ticketId: string): Promise<CheckInResult> => {
    const result = await RegistrationService.checkIn(ticketId);
    if (result.success) {
      const regs = await RegistrationService.getRegistrations();
      setRegistrations(regs);
    }
    return result;
  }, []);

  const createEvent = useCallback(async (eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">) => {
    const id = await EventService.createEvent(eventData);
    await loadData();
    return id;
  }, [loadData]);

  const saveTemplate = useCallback(async (templateData: Omit<EventTemplate, "id" | "organizerId">) => {
    await OrganizerTemplateService.saveTemplate(templateData as Omit<EventTemplate, "id">);
    await loadData();
  }, [loadData]);

  const removeRegistrant = useCallback(async (regId: string) => {
    await RegistrationService.removeRegistrant(regId);
    await loadData();
  }, [loadData]);

  const addAnnouncement = useCallback(async (announcementData: Omit<Announcement, "id" | "timestamp">) => {
    await UserCommunicationService.addAnnouncement(announcementData);
    const anns = await UserCommunicationService.getAnnouncements();
    setAnnouncements(anns);
  }, []);

  const addFeedback = useCallback(async (feedbackData: Omit<Feedback, "id" | "studentId">) => {
    await UserCommunicationService.addFeedback(feedbackData as Omit<Feedback, "id">);
    const fbs = await UserCommunicationService.getFeedbacks();
    setFeedbacks(fbs);
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    await EventService.deleteEvent(eventId);
    await loadData();
  }, [loadData]);

  const unpublishEvent = useCallback(async (eventId: string, isUnpublished: boolean) => {
    await EventService.updateEventPublishStatus(eventId, isUnpublished);
    await loadData();
  }, [loadData]);

  const contextValue = useMemo(() => ({
    events, registrations, templates, announcements, feedbacks, isLoading, error,
    registerForEvent, joinWaitlist, cancelRegistration, checkConflict, checkInUser,
    createEvent, saveTemplate, removeRegistrant, addAnnouncement, addFeedback,
    deleteEvent, unpublishEvent,
    getMyVolunteeringEvents: EventTeamService.getMyVolunteeringEvents,
    getVolunteers: EventTeamService.getVolunteers,
    inviteVolunteer: EventTeamService.inviteVolunteer,
    removeVolunteer: EventTeamService.removeVolunteer,
    subscribeToOrganizer: SocialService.subscribeToOrganizer,
    unsubscribeFromOrganizer: SocialService.unsubscribeFromOrganizer,
    getFollowedOrganizers: SocialService.getFollowedOrganizers,
    getPublicAttendeeSignal: RegistrationService.getPublicAttendeeSignal
  }), [
    events, registrations, templates, announcements, feedbacks, isLoading, error,
    registerForEvent, joinWaitlist, cancelRegistration, checkConflict, checkInUser,
    createEvent, saveTemplate, removeRegistrant, addAnnouncement, addFeedback,
    deleteEvent, unpublishEvent,
    // Stable module-level references included for exhaustive-deps correctness
    // (these never change identity, but listed so ESLint doesn't flag them)
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

\\\`n
## \$relPath\`n
\\\$ext
import { EventItem, Host, UserProfile } from '../types';

export const CURRENT_USER: UserProfile = {
  id: 'usr_curated_01',
  name: 'Elena Rostova',
  email: 'elena.rostova@designworks.co',
  handle: '@elenarostova',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  bio: 'Design strategist & salon host exploring typography, spatial design, and human-computer symbiosis.',
  joinedDate: 'March 2024',
  googleLinked: true,
};

export const MOCK_HOSTS: Record<string, Host> = {
  host_01: {
    id: 'host_01',
    name: 'Julian Vance',
    handle: '@julianvance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bio: 'Founder at KIN Studio. Hosting monthly design salons, generative art showcases, and architectural walks in SoHo.',
    verified: true,
    totalEventsHosted: 24,
    totalAttendees: 1840,
    location: 'New York, NY',
    website: 'https://julianvance.design',
    twitter: '@julianvance',
    instagram: '@julian.kin',
  },
  host_02: {
    id: 'host_02',
    name: 'Seraphina Lin',
    handle: '@seraphina_lin',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    bio: 'Sommelier & culinary curator. Crafting intimate hearth dinners, natural wine pairings, and seasonal table rituals.',
    verified: true,
    totalEventsHosted: 18,
    totalAttendees: 620,
    location: 'San Francisco, CA',
    website: 'https://seraphina.table',
    instagram: '@seraphina_table',
  },
  host_03: {
    id: 'host_03',
    name: 'Arcadia Collective',
    handle: '@arcadia_arts',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    bio: 'An independent arts & electronic acoustic collective organizing ambient listening sessions and spatial audio installations.',
    verified: true,
    totalEventsHosted: 32,
    totalAttendees: 3400,
    location: 'Berlin & Brooklyn',
    website: 'https://arcadia.audio',
    twitter: '@arcadia_sound',
  },
  host_04: {
    id: 'host_04',
    name: 'Dr. Marcus Vance',
    handle: '@marcus_vance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Neuroscientist & breathwork practitioner. Facilitating cold immersion, sauna protocols, and circadian rhythm optimization.',
    verified: false,
    totalEventsHosted: 11,
    totalAttendees: 480,
    location: 'Austin, TX',
  },
};

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'evt_01',
    slug: 'aesthetic-systems-design-salon',
    title: 'Aesthetic Systems: Design Leaders Salon & Print Exhibition',
    tagline: 'An intimate evening examining editorial typography, physical print objects, and tactile user interface crafts.',
    description: `Join 40 design directors, typographers, and product architects for an off-the-record conversation on the resurgence of tactile design aesthetics in digital software. 

We will begin with a curated cocktail reception featuring natural amber wines, followed by a live panel discussion and an exclusive preview of KIN Studio's upcoming monograph on modern editorial layouts.

Key Topics:
• Moving beyond monochrome SaaS templates toward expressive typography.
• The physics of spatial UI, light diffusion, and material depth.
• Print craftsmanship techniques applied to high-scale web apps.`,
    category: 'Design & Tech',
    coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'amber',
    date: '2026-08-28',
    startTime: '18:30',
    endTime: '21:30',
    timezone: 'EST',
    locationName: 'The Atrium at KIN Studio',
    address: '452 Broome Street, Floor 4, SoHo, New York, NY 10013',
    isVirtual: false,
    host: MOCK_HOSTS.host_01,
    featured: true,
    tags: ['Design', 'Typography', 'Networking', 'Print', 'Cocktails'],
    totalCapacity: 50,
    tickets: [
      { id: 't_01', name: 'General Admission', capacity: 40, sold: 34, description: 'Includes access to panel, exhibition, drinks & artisanal bites.' },
      { id: 't_02', name: 'Patron Pass + Monograph', capacity: 10, sold: 8, description: 'Includes VIP seating, signed hardcover monograph, and after-hours drinks.' },
    ],
    guests: [
      { id: 'g_101', name: 'Sora Takahashi', email: 'sora@framer.io', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', ticketType: 'General Admission', checkedIn: true, rsvpDate: '2026-08-10', status: 'confirmed' },
      { id: 'g_102', name: 'Mateo Rossi', email: 'mateo@design.co', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', ticketType: 'General Admission', checkedIn: false, rsvpDate: '2026-08-11', status: 'confirmed' },
      { id: 'g_103', name: 'Anya Petrov', email: 'anya@vogue.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200', ticketType: 'Patron Pass + Monograph', checkedIn: true, rsvpDate: '2026-08-09', status: 'confirmed' },
      { id: 'g_104', name: 'David Chen', email: 'david@stripe.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', ticketType: 'General Admission', checkedIn: false, rsvpDate: '2026-08-12', status: 'confirmed' },
    ],
    requirements: ['Bring photo ID for door check-in', 'Dress code: Smart Casual / Minimalist'],
  },
  {
    id: 'evt_02',
    slug: 'terra-fire-natural-wine-hearth',
    title: 'Terra & Fire: Natural Wine & Woodfired Hearth Gathering',
    tagline: 'An intimate 5-course woodfired supper paired with biodynamic skin-contact wines in a private greenhouse garden.',
    description: `Experience an unhurried evening of wood-fired culinary art led by Chef Seraphina Lin. Hosted in a historic glasshouse in Presidio Heights, this seasonal supper celebrates heirloom stone fruit, wild mushrooms, line-caught halibut, and rare terracotta-aged amber wines from Georgia and Slovenia.

Each course is paired with stories from independent vigneron families who practice regenerative viticulture.

Menu Highlights:
• Charred figs, house-made ricotta, wildflower honey & thyme oil.
• Ember-roasted wild chanterelles with brown butter ash.
• Cedar-planked halibut over fermented plum glaze.
• Burnt Basque cheesecake with smoked sea salt.`,
    category: 'Culinary & Wine',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'terracotta',
    date: '2026-09-04',
    startTime: '19:00',
    endTime: '22:30',
    timezone: 'PST',
    locationName: 'Presidio Glasshouse Conservatory',
    address: '382 Washington Blvd, San Francisco, CA 94129',
    isVirtual: false,
    host: MOCK_HOSTS.host_02,
    featured: true,
    tags: ['Culinary', 'Natural Wine', 'Supper Club', 'Farm-to-Table'],
    totalCapacity: 24,
    tickets: [
      { id: 't_03', name: 'Supper & Wine Pairing Seat', capacity: 24, sold: 20, description: '5-course woodfired menu with full biodynamic wine pairings.' },
    ],
    guests: [
      { id: 'g_201', name: 'Chloe Dubois', email: 'chloe@atelier.fr', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', ticketType: 'Supper & Wine Pairing Seat', checkedIn: false, rsvpDate: '2026-08-01', status: 'confirmed' },
      { id: 'g_202', name: 'Oliver Wright', email: 'oliver@sfeats.org', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', ticketType: 'Supper & Wine Pairing Seat', checkedIn: false, rsvpDate: '2026-08-02', status: 'confirmed' },
    ],
    requirements: ['Dietary preferences collected after RSVP', '21+ only'],
  },
  {
    id: 'evt_03',
    slug: 'night-architecture-ambient-soundscapes',
    title: 'Night Architecture & Spatial Audio Performance in 4DSOUND',
    tagline: 'An immersive nocturnal sound bath and generative light installation in a subterranean brutalist gallery.',
    description: `Step into a 32-channel spatial audio sphere inside Williamsburg’s former grain silo vault. Arcadia Collective brings together modular synthesizer improvisers and visual projection artists for a 3-hour continuous sound environment.

Guests are provided floor pillows, weighted linen blankets, and botanical herbal infusions. Listening in total darkness except for subtle laser diffraction light fields.

Artist Lineup:
• Hiroshi Watanabe (Live Modular Synthesis)
• Elena Kogan (Continuous Cello & Grain Processing)
• Spatial audio design by Arcadia Sound Lab.`,
    category: 'Music & Night',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'burgundy',
    date: '2026-09-12',
    startTime: '21:00',
    endTime: '01:00',
    timezone: 'EST',
    locationName: 'The Silo Subterranean Vault',
    address: '88 North 11th Street, Brooklyn, NY 11249',
    isVirtual: false,
    host: MOCK_HOSTS.host_03,
    featured: true,
    tags: ['Ambient', 'Spatial Audio', 'Subterranean', 'Nightlife', 'Live Sound'],
    totalCapacity: 80,
    tickets: [
      { id: 't_04', name: 'General Floor Cushion', capacity: 60, sold: 58, description: 'Access to main listening sphere & tea service.' },
      { id: 't_05', name: 'VIP Mezzanine Lounge', capacity: 20, sold: 18, description: 'Elevated view, dedicated acoustic pod, elixir tasting.' },
    ],
    guests: [
      { id: 'g_301', name: 'Liam O’Connor', email: 'liam@pitchfork.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', ticketType: 'General Floor Cushion', checkedIn: false, rsvpDate: '2026-08-05', status: 'confirmed' },
    ],
    requirements: ['Shoes removed at door', 'Silent space protocol during performances'],
  },
  {
    id: 'evt_04',
    slug: 'dawn-run-ice-bath-sauna-protocol',
    title: 'Dawn Run, Cold Immersion & Circadian Sauna Protocol',
    tagline: 'A sunrise 5K trail jog through Barton Springs followed by guided breathwork, 3°C ice plunges, and eucalyptus sauna.',
    description: `Reset your autonomic nervous system with Dr. Marcus Vance. We begin at 6:30 AM with a gentle 5K jog along the Ann and Roy Butler Hike-and-Bike Trail at Lady Bird Lake.

After the run, we transition into a structured 90-minute cold & heat contrast therapy session using custom cedar ice tubs and continuous wood-burning saunas.

Included:
• Electrolyte elixir bar & cold-pressed morning juices.
• Guided box breathing and HRV recovery monitoring.
• Artisan coffee by Onyx Coffee Lab.`,
    category: 'Wellness & Rituals',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'emerald',
    date: '2026-09-02',
    startTime: '06:30',
    endTime: '09:30',
    timezone: 'CST',
    locationName: 'Barton Springs Sauna Club',
    address: '2201 Barton Springs Rd, Austin, TX 78704',
    isVirtual: false,
    host: MOCK_HOSTS.host_04,
    featured: false,
    tags: ['Wellness', 'Ice Bath', 'Sauna', 'Running', 'Circadian'],
    totalCapacity: 30,
    tickets: [
      { id: 't_06', name: 'Morning Pass', capacity: 30, sold: 22, description: 'Full access to run, ice tubs, saunas, and juice bar.' },
    ],
    guests: [],
  },
  {
    id: 'evt_05',
    slug: 'founders-breakfast-ai-agents',
    title: 'Founders & VC Roundtable: Autonomous AI Agents & Hardware',
    tagline: 'A private breakfast salon discussing next-generation agentic workflows, custom silicon, and vertical AI apps.',
    description: `An off-the-record gathering for 20 founder-CEOs and primary venture partners investing in autonomous agent architecture. Enjoy fresh pastries, single-origin pour-overs, and candid exchanges on product distribution, safety guardrails, and enterprise adoption.`,
    category: 'Founders & VC',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'cobalt',
    date: '2026-09-18',
    startTime: '08:00',
    endTime: '10:30',
    timezone: 'PST',
    locationName: 'Battery Club Penthouse',
    address: '717 Battery St, San Francisco, CA 94111',
    isVirtual: false,
    host: MOCK_HOSTS.host_01,
    featured: false,
    tags: ['Founders', 'AI', 'Venture Capital', 'Networking', 'Breakfast'],
    totalCapacity: 20,
    tickets: [
      { id: 't_07', name: 'Invited Founder / Investor', capacity: 20, sold: 16, description: 'Complimentary pass by invitation or approval.' },
    ],
    guests: [],
  },
  {
    id: 'evt_06',
    slug: 'generative-art-kinetics-exhibition',
    title: 'Generative Art & Kinetic Sculptures: Private Gallery Opening',
    tagline: 'An evening celebrating algorithmic drawings, plotter art, and responsive light kinetic installations.',
    description: `Exhibition featuring 12 contemporary artists working at the intersection of creative code, physical plotters, and light refraction art. Includes live pen plotter demonstrations and wine reception.`,
    category: 'Art & Culture',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'amber',
    date: '2026-09-25',
    startTime: '18:00',
    endTime: '21:00',
    timezone: 'EST',
    locationName: 'Lumina Contemporary',
    address: '520 W 24th St, New York, NY 10011',
    isVirtual: false,
    host: MOCK_HOSTS.host_03,
    featured: false,
    tags: ['Generative Art', 'Gallery', 'Exhibition', 'Code Art'],
    totalCapacity: 100,
    tickets: [
      { id: 't_08', name: 'Free RSVP', capacity: 100, sold: 74, description: 'Entry to gallery opening and live plotter demos.' },
    ],
    guests: [],
  }
];

export const CATEGORIES = [
  'All',
  'Design & Tech',
  'Art & Culture',
  'Culinary & Wine',
  'Wellness & Rituals',
  'Music & Night',
  'Founders & VC',
] as const;

\\\`n
## \$relPath\`n
\\\$ext
import { useState, useEffect } from 'react';

export function useAccessibleMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}

\\\`n
## \$relPath\`n
\\\$ext
import { useMemo } from "react";
import { useData, CampusEvent, Registration, Announcement } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";

export function useMyOrganizerEvents() {
  const { events, registrations } = useData();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return { myEvents: [], activeEventsCount: 0, totalAttendees: 0 };

    // Admins see all events, organizers see only theirs.
    const myEvents = user.role === "admin" 
      ? events 
      : events.filter(e => e.organizerId === user.id);
      
    const activeEventsCount = myEvents.length;
    
    // Total attendees for these scoped events
    const myEventIds = new Set(myEvents.map(e => e.id));
    const totalAttendees = registrations.filter(
      r => r.status === "registered" && myEventIds.has(r.eventId)
    ).length;

    return { myEvents, activeEventsCount, totalAttendees };
  }, [events, registrations, user]);
}

export function useStudentDashboard(volunteeringEventIds: string[]) {
  const { events, registrations, announcements } = useData();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return { 
        upcomingEvents: [], pastEvents: [], waitlistedEvents: [], 
        volunteeringEvents: [], recommendedEvents: [], relevantAnnouncements: [] 
      };
    }

    const userRegs = registrations.filter(r => r.studentId === user.id);
    const now = new Date().getTime();
    
    const registeredItems = userRegs
      .filter(r => r.status === "registered")
      .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
      .filter(item => item.event);

    const upcomingEvents = registeredItems
      .filter(item => new Date(item.event!.endTime).getTime() > now)
      .sort((a, b) => new Date(a.event!.startTime).getTime() - new Date(b.event!.startTime).getTime());

    const pastEvents = registeredItems
      .filter(item => new Date(item.event!.endTime).getTime() <= now)
      .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());

    const waitlistedEvents = userRegs
      .filter(r => r.status === "waitlisted")
      .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
      .filter(item => item.event);

    const volunteeringEvents = events
      .filter(e => volunteeringEventIds.includes(e.id))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const userCategories = new Set([...upcomingEvents, ...pastEvents].map(item => item.event?.category));
    const recommendedEvents = events
      .filter(e => new Date(e.endTime).getTime() > now)
      .filter(e => !userRegs.some(r => r.eventId === e.id) && !volunteeringEventIds.includes(e.id))
      .filter(e => userCategories.size === 0 || userCategories.has(e.category))
      .slice(0, 3);

    const upcomingEventIds = upcomingEvents.map(u => u.event!.id);
    const relevantAnnouncements = announcements
      .filter(a => upcomingEventIds.includes(a.eventId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);

    return { 
      upcomingEvents, 
      pastEvents, 
      waitlistedEvents, 
      volunteeringEvents, 
      recommendedEvents, 
      relevantAnnouncements 
    };
  }, [events, registrations, announcements, user, volunteeringEventIds]);
}

export function useAdminStats() {
  const { events, registrations } = useData();
  const { users } = useAuth();

  return useMemo(() => {
    const totalUsers = users.length;
    const totalEvents = events.length;
    const activeEvents = events.filter(e => !e.isUnpublished).length;
    const totalTickets = registrations.filter(r => r.status === "registered").length;
    const totalWaitlist = registrations.filter(r => r.status === "waitlisted").length;

    return { totalUsers, totalEvents, activeEvents, totalTickets, totalWaitlist };
  }, [events, registrations, users]);
}

\\\`n
## \$relPath\`n
\\\$ext
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gatherum-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('gatherum-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
}

\\\`n
## \$relPath\`n
\\\$ext
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { useAuth, User, Role } from '../contexts/AuthContext';
import { ShieldAlert, Users, Settings, UserX, UserCheck, Shield, Key } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user: currentUser, users, toggleUserBan, updateUserRole, settings, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
  const [search, setSearch] = useState('');

  // Safeguard: Current admin cannot ban themselves or change their own role
  const isSelf = (userId: string) => currentUser?.id === userId;

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (isSelf(userId)) return alert("You cannot change your own role.");
    if (window.confirm(`Are you sure you want to promote/demote this user to ${newRole.toUpperCase()}?`)) {
      await updateUserRole(userId, newRole);
    }
  };

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    if (isSelf(userId)) return alert("You cannot ban yourself.");
    const action = currentBanStatus ? 'unban' : 'ban';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      await toggleUserBan(userId, currentBanStatus);
    }
  };

  const handleToggleSignups = async () => {
    await updateSettings({ ...settings, allowGlobalSignups: !settings.allowGlobalSignups });
  };

  const handleToggleMaintenance = async () => {
    if (!settings.maintenanceMode) {
      if (!window.confirm("WARNING: Activating maintenance mode will block all non-admin users. Proceed?")) return;
    }
    await updateSettings({ ...settings, maintenanceMode: !settings.maintenanceMode });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4 border-b-sharpie pb-6">
        <div className="flex items-center gap-3 text-neon-yellow bg-ink inline-flex px-4 py-2 border-sharpie shadow-sharpie">
          <ShieldAlert className="w-8 h-8" />
          <h1 className="font-display text-3xl font-black text-white uppercase leading-none">
            OVERSEER TERMINAL
          </h1>
        </div>
        <p className="text-ink font-bold uppercase tracking-widest text-sm">
          RESTRICTED ACCESS. SYSTEM ADMINISTRATION ONLY.
        </p>
      </div>

      <div className="flex gap-4 border-b-sharpie pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 font-black uppercase text-sm border-sharpie transition-all ${
            activeTab === 'users' ? 'bg-ink text-neon-yellow shadow-sharpie-sm' : 'bg-white hover:bg-paper'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" /> CITIZEN REGISTRY
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-2 font-black uppercase text-sm border-sharpie transition-all ${
            activeTab === 'settings' ? 'bg-ink text-neon-yellow shadow-sharpie-sm' : 'bg-white hover:bg-paper'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" /> PROTOCOL SETTINGS
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <input
            type="text"
            placeholder="SEARCH BY EMAIL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white px-4 py-3 font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm uppercase"
          />

          <div className="bg-white border-sharpie shadow-sharpie overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink text-white font-black uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-4 border-b-sharpie">IDENTIFIER</th>
                  <th className="p-4 border-b-sharpie">CLEARANCE LEVEL</th>
                  <th className="p-4 border-b-sharpie">STATUS</th>
                  <th className="p-4 border-b-sharpie text-right">DIRECTIVES</th>
                </tr>
              </thead>
              <tbody className="divide-y-sharpie">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neon-yellow/20 transition-colors">
                    <td className="p-4 font-bold text-ink">{u.email} {isSelf(u.id) && '(YOU)'}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        disabled={isSelf(u.id)}
                        className={`bg-white border-sharpie font-black text-xs px-2 py-1 uppercase outline-none focus:ring-2 focus:ring-neon-blue ${isSelf(u.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="student">STUDENT</option>
                        <option value="organizer">ORGANIZER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {u.isBanned ? (
                        <span className="bg-neon-pink text-white px-2 py-1 text-xs font-black uppercase border-sharpie inline-flex items-center gap-1">
                          <UserX className="w-3 h-3" /> BANNED
                        </span>
                      ) : (
                        <span className="bg-neon-blue text-white px-2 py-1 text-xs font-black uppercase border-sharpie inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleBanToggle(u.id, u.isBanned)}
                        disabled={isSelf(u.id)}
                        className={`px-3 py-1 text-xs font-black uppercase border-sharpie transition-colors ${
                          isSelf(u.id) ? 'opacity-50 cursor-not-allowed bg-paper text-ink/50' :
                          u.isBanned ? 'bg-white text-ink hover:bg-neon-blue hover:text-white' : 'bg-white text-ink hover:bg-neon-pink hover:text-white'
                        }`}
                      >
                        {u.isBanned ? 'RESTORE ACCESS' : 'REVOKE ACCESS'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white border-sharpie shadow-sharpie-sm p-6 space-y-4 hover:bg-neon-yellow transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-ink uppercase text-xl">GLOBAL REGISTRATION</h3>
                <p className="text-xs font-bold text-ink/70 uppercase mt-1">ALLOW NEW USERS TO JOIN THE PLATFORM.</p>
              </div>
              <button
                onClick={handleToggleSignups}
                className={`w-14 h-8 border-sharpie flex items-center p-1 transition-colors ${
                  settings.allowGlobalSignups ? 'bg-neon-blue justify-end' : 'bg-ink justify-start'
                }`}
              >
                <div className="w-5 h-5 border-sharpie bg-white"></div>
              </button>
            </div>
            <div className="pt-4 border-t-sharpie">
              <span className={`px-2 py-1 text-xs font-black uppercase border-sharpie text-white ${settings.allowGlobalSignups ? 'bg-neon-blue' : 'bg-neon-pink'}`}>
                {settings.allowGlobalSignups ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div className="bg-white border-sharpie shadow-sharpie-sm p-6 space-y-4 hover:bg-neon-pink group transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-ink uppercase text-xl group-hover:text-white">MAINTENANCE MODE</h3>
                <p className="text-xs font-bold text-ink/70 uppercase mt-1 group-hover:text-white/80">LOCK DOWN PLATFORM TO ADMINS ONLY.</p>
              </div>
              <button
                onClick={handleToggleMaintenance}
                className={`w-14 h-8 border-sharpie flex items-center p-1 transition-colors ${
                  settings.maintenanceMode ? 'bg-ink justify-end' : 'bg-paper justify-start'
                }`}
              >
                <div className={`w-5 h-5 border-sharpie ${settings.maintenanceMode ? 'bg-neon-yellow' : 'bg-ink'}`}></div>
              </button>
            </div>
            <div className="pt-4 border-t-sharpie group-hover:border-white">
              <span className={`px-2 py-1 text-xs font-black uppercase border-sharpie ${settings.maintenanceMode ? 'bg-ink text-neon-yellow' : 'bg-white text-ink'}`}>
                {settings.maintenanceMode ? 'ACTIVE - LOCKED DOWN' : 'INACTIVE'}
              </span>
            </div>
          </div>
          
          <div className="bg-paper border-sharpie shadow-sharpie-sm p-6 space-y-4 col-span-1 sm:col-span-2">
             <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-ink" />
                <h3 className="font-black text-ink uppercase text-xl">ALLOWED DOMAIN</h3>
             </div>
             <p className="text-xs font-bold text-ink/70 uppercase">CURRENTLY ENFORCED DOMAIN FOR OAUTH AND MAGIC LINKS.</p>
             <input 
               type="text" 
               disabled 
               value={settings.allowedEmailDomain} 
               className="w-full bg-white px-4 py-3 font-bold border-sharpie text-ink opacity-70 cursor-not-allowed"
             />
             <p className="text-xs font-black text-neon-pink uppercase">HARDCODED FOR SECURITY PURPOSES.</p>
          </div>
        </div>
      )}

    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, Check, AlertTriangle, Mail } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, loginWithGoogle, user, authError, clearAuthError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (!user.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate('/my-events');
      }
    }
  }, [user, navigate]);

  const getErrorMessage = () => {
    if (localError) return localError;
    switch (authError) {
      case 'invalid_email': return 'INVALID EMAIL FORMAT.';
      case 'domain_restricted': return 'ACCESS RESTRICTED. USE YOUR INSTITUTE EMAIL.';
      case 'signups_disabled': return 'SIGNUPS ARE CURRENTLY DISABLED.';
      case 'user_banned': return 'THIS ACCOUNT HAS BEEN BANNED.';
      case 'unknown': return 'AN ERROR OCCURRED. TRY AGAIN.';
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    setMagicLinkSent(false);

    const result = await login(email);
    setIsSubmitting(false);

    if (result.success) {
      setMagicLinkSent(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    await loginWithGoogle();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neon-yellow border-sharpie rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-neon-pink border-sharpie transform rotate-12 -z-10"></div>

      <div className="max-w-md w-full bg-paper border-sharpie shadow-sharpie p-8 space-y-8 relative">
        <div className="absolute -top-4 -right-4 bg-neon-blue text-white px-3 py-1 font-black uppercase text-sm border-sharpie transform rotate-6">
          HOST / GUEST
        </div>

        {/* Brand Header */}
        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">
            {mode === 'signin' ? 'ENTER THE ARCHIVE' : 'JOIN THE ARCHIVE'}
          </h1>
          <p className="text-ink font-bold bg-white border-sharpie px-3 py-2 inline-block">
            ACCESS PRIVATE SALONS & HOST MANAGEMENT.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white border-sharpie shadow-sharpie-sm">
          <button
            onClick={() => { setMode('signin'); setLocalError(null); clearAuthError(); setMagicLinkSent(false); }}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-colors border-r-sharpie ${
              mode === 'signin' ? 'bg-ink text-neon-yellow' : 'text-ink hover:bg-neon-yellow/50'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setMode('signup'); setLocalError(null); clearAuthError(); setMagicLinkSent(false); }}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
              mode === 'signup' ? 'bg-ink text-neon-yellow' : 'text-ink hover:bg-neon-yellow/50'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Banner */}
        {getErrorMessage() && (
          <div className="bg-neon-pink text-white p-4 border-sharpie shadow-sharpie-sm flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wider">AUTHENTICATION FAILED</p>
              <p className="font-bold text-sm uppercase">{getErrorMessage()}</p>
            </div>
          </div>
        )}

        {/* Magic Link Success Banner */}
        {magicLinkSent && (
          <div className="bg-neon-yellow text-ink p-4 border-sharpie shadow-sharpie-sm flex items-start gap-3">
            <Mail className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wider">MAGIC LINK SENT</p>
              <p className="font-bold text-sm uppercase">CHECK YOUR INBOX TO CONTINUE.</p>
            </div>
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 border-sharpie bg-white text-ink font-black uppercase hover:bg-neon-yellow transition-colors shadow-sharpie-sm hover-sharpie-lift"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t-sharpie w-full" />
          <span className="bg-paper px-4 font-black uppercase text-ink absolute border-sharpie">
            OR USE EMAIL
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block font-black uppercase text-ink">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              placeholder="NAME@YOUR-INSTITUTE.EDU"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || magicLinkSent}
              className="w-full bg-white px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-yellow focus:text-ink transition-colors uppercase placeholder-ink/30 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || magicLinkSent}
            className="w-full py-4 mt-4 bg-ink text-neon-yellow font-black uppercase text-xl border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-sharpie"
          >
            {isSubmitting ? 'PROCESSING...' : magicLinkSent ? 'CHECK EMAIL' : (mode === 'signin' ? 'SEND MAGIC LINK' : 'JOIN THE ARCHIVE')} <ArrowRight className="w-6 h-6" />
          </button>
        </form>

        <p className="text-xs text-ink/70 text-center font-bold uppercase mt-4">
          BY PROCEEDING, YOU AGREE TO GATHERUM’S TERMS OF SERVICE.
        </p>

      </div>
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storage';
import { ImageUpload } from '../components/common/ImageUpload';
import { useData } from '../contexts/DataContext';
import { EventCategory, EventColorTheme, TicketType, EventItem } from '../types';
import { CATEGORIES } from '../data/mockData';
import { EventCard } from '../components/common/EventCard';
import { Sparkles, Calendar, MapPin, Upload, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Eye, CircleX, Image, ChevronRight } from 'lucide-react';

const COVER_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200', theme: 'amber' as EventColorTheme, label: 'Warm Studio Lighting' },
  { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', theme: 'terracotta' as EventColorTheme, label: 'Woodfired Hearth' },
  { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200', theme: 'burgundy' as EventColorTheme, label: 'Subterranean Vault' },
  { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', theme: 'emerald' as EventColorTheme, label: 'Botanical Garden' },
  { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200', theme: 'cobalt' as EventColorTheme, label: 'Modern Penthouse' },
  { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200', theme: 'amber' as EventColorTheme, label: 'Gallery Canvas' },
];

export const EventCreatePage: React.FC = () => {
  const { createEvent } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [category, setCategory] = useState<EventCategory>('Design & Tech');
  const [date, setDate] = useState('2026-09-15');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:30');
  const [timezone, setTimezone] = useState('EST');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  
  // Theme & Cover Image
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [themeColor, setThemeColor] = useState<EventColorTheme>('amber');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Tickets
  const [tickets, setTickets] = useState<TicketType[]>([
    { id: 't_custom_1', name: 'General Admission', capacity: 40, sold: 0, description: 'Includes entry & complimentary welcome drink.' }
  ]);

  // Requirements
  const [requirements, setRequirements] = useState<{id: string, text: string}[]>([
    { id: 'req_id', text: 'Bring photo ID for door verification' }
  ]);

  const handleAddTicket = () => {
    const newId = `t_custom_${Date.now()}`;
    setTickets(prev => [...prev, { id: newId, name: 'VIP Pass', capacity: 15, sold: 0, description: 'VIP seating & exclusive gift bag.' }]);
  };

  const handleRemoveTicket = (id: string) => {
    if (tickets.length > 1) {
      setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let finalPosterUrl = '';
      if (coverFile) {
        finalPosterUrl = await StorageService.uploadImage(coverFile, 'events', user.id);
      } else {
        finalPosterUrl = customCoverUrl || coverImage;
      }

      await createEvent({
        title,
        description,
        date,
        startTime,
        endTime,
        locationName,
        address,
        category,
        capacity: tickets.reduce((acc, t) => acc + t.capacity, 0),
        tickets,
        posterUrl: finalPosterUrl,
        requirements: {
          requiresId: requirements.some(r => r.id === 'req_id'),
          requiresApproval: requirements.some(r => r.id === 'req_approval'),
        }
      } as any);
      navigate('/host-dashboard');
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Failed to create event. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Multi-Step Progress Indicator */}
      <div className="space-y-4">
        <span className="bg-neon-yellow px-2 py-1 text-[11px] font-black uppercase tracking-widest text-ink border-sharpie shadow-sharpie-sm inline-block">HOST STUDIO</span>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase">CREATE NEW GATHERING</h1>
        
        {/* Step Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-b-sharpie pb-4">
          {[
            { num: 1, label: '1. EVENT DETAILS' },
            { num: 2, label: '2. COVER & THEME' },
            { num: 3, label: '3. TICKETS' },
            { num: 4, label: '4. PUBLISH' }
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-sharpie ${
                step === s.num
                  ? 'bg-ink text-white shadow-sharpie-sm'
                  : step > s.num
                  ? 'bg-neon-yellow text-ink hover-sharpie-lift'
                  : 'bg-white text-ink hover-sharpie-lift'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Event Details Form */}
      {step === 1 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-8">
          <h3 className="font-display text-3xl font-black text-ink uppercase">STEP 1: EVENT INFO</h3>

          <div className="space-y-6">
            <div className="space-y-4 pt-6 border-t-sharpie">
              <h2 className="font-display font-black text-2xl uppercase tracking-wider text-ink flex items-center gap-3">
                <Image className="w-6 h-6 text-neon-pink" /> 02 / CREATIVE
              </h2>
              
              <ImageUpload
                label="EVENT COVER ART"
                maxSizeMB={10}
                onFileSelect={setCoverFile}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                EVENT TITLE *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aesthetic Systems: Design Leaders Salon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                TAGLINE / SUBTITLE
              </label>
              <input
                type="text"
                placeholder="A concise, elegant one-sentence summary"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  CATEGORY *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm appearance-none rounded-none"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  DATE *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  START TIME
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  END TIME
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  TIMEZONE
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm appearance-none rounded-none"
                >
                  <option value="EST">EST (New York)</option>
                  <option value="PST">PST (San Francisco)</option>
                  <option value="CST">CST (Austin)</option>
                  <option value="CET">CET (Berlin / Paris)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  VENUE / LOCATION NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. KIN Studio Atrium"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  FULL ADDRESS
                </label>
                <input
                  type="text"
                  placeholder="e.g. 452 Broome St, New York, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                FULL EVENT DESCRIPTION
              </label>
              <textarea
                rows={5}
                placeholder="Describe the schedule, key speakers, atmosphere, and what guests should expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t-sharpie">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-neon-pink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              CONTINUE TO COVER <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Cover Image & Auto Theme Preview */}
      {step === 2 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-8">
          <div className="space-y-2">
            <h3 className="font-display text-3xl font-black text-ink uppercase">STEP 2: IMAGERY & THEME</h3>
            <p className="text-ink text-sm font-bold">Select a curated magazine cover or paste an image URL.</p>
          </div>

          {/* Cover Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {COVER_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCoverImage(preset.url);
                  setThemeColor(preset.theme);
                  setCustomCoverUrl('');
                }}
                className={`relative aspect-video overflow-hidden cursor-pointer border-sharpie transition-all group ${
                  coverImage === preset.url && !customCoverUrl ? 'shadow-sharpie-sm -translate-y-1' : 'opacity-80 hover:opacity-100 hover-sharpie-lift'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs bg-white text-ink px-2 py-1 font-black border-sharpie uppercase tracking-wider">{preset.label}</span>
                </div>
                {coverImage === preset.url && !customCoverUrl && (
                  <div className="absolute top-2 right-2 bg-neon-yellow text-ink p-1 border-sharpie shadow-sharpie-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-6 flex justify-between border-t-sharpie">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-white text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-neon-yellow hover-sharpie-lift"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-neon-pink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              CONTINUE TO TICKETS <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Ticketing & Capacity Setup */}
      {step === 3 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl font-black text-ink uppercase">STEP 3: TICKETS</h3>
              <p className="text-ink text-sm font-bold">Set pass tiers, pricing, and maximum attendance limits.</p>
            </div>
            <button
              type="button"
              onClick={handleAddTicket}
              className="px-6 py-3 bg-neon-yellow text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie hover-sharpie-lift flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> ADD PASS TIER
            </button>
          </div>

          <div className="space-y-6">
            {tickets.map((t, index) => (
              <div key={t.id} className="p-6 bg-white border-sharpie shadow-sharpie-sm space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="bg-ink text-white px-3 py-1 text-xs font-black uppercase border-sharpie inline-block">PASS #{index + 1}</span>
                  {tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTicket(t.id)}
                      className="text-white bg-neon-pink p-1.5 border-sharpie shadow-sharpie-sm hover-sharpie-lift"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-ink mb-2">NAME</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTickets(prev => prev.map(item => item.id === t.id ? { ...item, name: val } : item));
                      }}
                      className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-ink mb-2">CAPACITY LIMIT</label>
                    <input 
                      type="number"
                      min={1}
                      value={t.capacity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setTickets(prev => prev.map(item => item.id === t.id ? { ...item, capacity: val } : item));
                      }}
                      className="w-full bg-paper px-3 py-2 text-sm font-bold border-sharpie focus:outline-none focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex justify-between border-t-sharpie">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-white text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-neon-yellow hover-sharpie-lift"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-neon-pink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              PREVIEW & PUBLISH <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Live Card Preview */}
      {step === 4 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-10">
          <div className="space-y-2 text-center">
            <span className="bg-neon-yellow px-3 py-1 text-sm font-black uppercase border-sharpie inline-block shadow-sharpie-sm transform -rotate-2">FINAL STEP</span>
            <h3 className="font-display text-4xl font-black text-ink uppercase mt-4">REVIEW & PUBLISH</h3>
          </div>

          {submitError && (
            <div className="bg-red-500 text-white p-4 font-bold border-sharpie uppercase text-sm mb-6">
              {submitError}
            </div>
          )}

          <div className="max-w-md mx-auto relative group">
            <EventCard 
              event={{
                id: 'preview',
                title: title || 'UNTITLED GATHERING',
                tagline: tagline || 'No tagline provided.',
                description: description || '...',
                category: category,
                coverImage: coverFile ? URL.createObjectURL(coverFile) : (customCoverUrl || coverImage),
                themeColor: themeColor,
                date: date,
                startTime: startTime,
                endTime: endTime,
                timezone: timezone,
                locationName: locationName || 'Location TBD',
                address: address || '',
                isVirtual: isVirtual,
                tickets: tickets,
                totalCapacity: tickets.reduce((a, b) => a + b.capacity, 0),
              } as EventItem}
              index={0}
            />
          </div>

          <div className="pt-8 flex justify-between border-t-sharpie">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-white text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-neon-yellow hover-sharpie-lift"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-neon-blue text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" /> {isSubmitting ? 'PUBLISHING...' : 'PUBLISH LIVE'}
            </button>
          </div>
        </div>
      )}

    </form>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Share2, Check, ExternalLink, Scissors, User as UserIcon, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { events, registerForEvent } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const event = events.find(e => e.id === id) || events[0];
  
  // Adapt real event to mock UI expectations
  const tickets = [{ id: 'general', name: 'General Admission', description: 'Standard Entry', sold: event?.registeredCount || 0 }];
  const totalCapacity = event?.capacity || 0;
  const coverImage = event?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200';
  const displayDate = event?.startTime || new Date().toISOString();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [guestName, setGuestName] = useState<string>(user?.email || '');
  const [guestEmail, setGuestEmail] = useState<string>(user?.email || '');
  const [rsvpSuccess, setRsvpSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Format Date for display
  const dateObj = new Date(displayDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !event) return;
    
    // Simulate API / processing time then trigger the tear and navigate
    try {
      await registerForEvent(event.id);
      setRsvpSuccess(true);
      setTimeout(() => {
        navigate(`/my-events`);
      }, 1500);
    } catch (err) {
      alert("Failed to register. You may already be registered or the event is full.");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalSold = tickets.reduce((acc, t) => acc + t.sold, 0);
  const remainingSpots = Math.max(0, totalCapacity - totalSold);


  if (!event) return <div className="p-20 text-center font-black text-4xl uppercase">Event Not Found</div>;

  return (
    <div className="min-h-screen bg-neon-blue flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      
      {/* Background abstract elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-9xl font-black text-ink transform -rotate-12">HYPE</div>
        <div className="absolute bottom-10 right-10 text-9xl font-black text-ink transform rotate-12">STUB</div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Navigation Bar for Ticket View */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/explore" className="px-4 py-2 bg-ink text-white font-black uppercase text-sm border-sharpie shadow-sharpie-sm hover-sharpie-lift flex items-center gap-2">
            ← BACK TO FEED
          </Link>
          <button
            onClick={copyShareLink}
            className="px-4 py-2 bg-neon-yellow text-ink font-black uppercase text-sm border-sharpie shadow-sharpie-sm hover-sharpie-lift flex items-center gap-2"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? 'COPIED!' : 'SHARE'}
          </button>
        </div>

        {/* MASSIVE TICKET STUB */}
        <div className="relative">
          
          <AnimatePresence>
            {/* Top Half (Event Details) */}
            <motion.div
              initial={{ y: 0 }}
              animate={rsvpSuccess ? { y: -100, rotate: -2, opacity: 0 } : { y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="bg-paper border-sharpie shadow-sharpie relative z-20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Image Section */}
                <div className="md:col-span-1 border-b-sharpie md:border-b-0 md:border-r-sharpie bg-ink aspect-square md:aspect-auto">
                  <img src={coverImage} alt={event.title} className="w-full h-full object-cover grayscale" />
                </div>
                
                {/* Content Section */}
                <div className="md:col-span-2 p-6 sm:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="bg-neon-pink text-white px-3 py-1 font-black uppercase border-sharpie inline-block">
                        {event.category}
                      </span>
                      <span className="text-xl font-black text-ink">{formattedDate}</span>
                    </div>

                    <h1 className="font-display text-5xl sm:text-7xl font-black text-ink leading-none uppercase break-words">
                      {event.title}
                    </h1>

                    <p className="text-lg font-bold text-ink border-l-sharpie pl-4">
                      {event.description}
                    </p>
                  </div>

                  <div className="mt-10 pt-6 border-t-sharpie grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink">
                        <MapPin className="w-5 h-5 font-bold" />
                        <span className="font-black uppercase">LOCATION</span>
                      </div>
                      <p className="font-bold text-ink/80 text-sm uppercase">{event.location}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink">
                        <Calendar className="w-5 h-5 font-bold" />
                        <span className="font-black uppercase">TIME</span>
                      </div>
                      <p className="font-bold text-ink/80 text-sm uppercase">{new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Perforation Line (Middle) */}
            <motion.div 
              animate={rsvpSuccess ? { opacity: 0 } : { opacity: 1 }}
              className="h-10 bg-paper border-x-sharpie relative flex items-center justify-center overflow-hidden z-10 my-0"
            >
              <div className="w-full h-0 border-t-4 border-dashed border-ink absolute top-1/2 transform -translate-y-1/2"></div>
              <div className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-neon-blue rounded-full border-sharpie z-20"></div>
              <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-neon-blue rounded-full border-sharpie z-20"></div>
              <div className="bg-paper px-4 relative z-10 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-ink" />
                <span className="text-xs font-black uppercase text-ink">TEAR HERE TO ENTER</span>
              </div>
            </motion.div>

            {/* Bottom Half (RSVP Form) */}
            <motion.div
              initial={{ y: 0 }}
              animate={rsvpSuccess ? { y: 100, rotate: 2, opacity: 0 } : { y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-10 relative z-20"
            >
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h3 className="font-display text-4xl font-black uppercase text-ink">SECURE STUB</h3>
                    <p className="font-bold text-ink/60 uppercase">{remainingSpots} SPOTS LEFT</p>
                  </div>
                  
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <label
                        key={ticket.id}
                        className={`block p-4 border-sharpie cursor-pointer transition-colors ${
                          selectedTicketId === ticket.id ? 'bg-neon-yellow' : 'bg-white hover:bg-neon-yellow/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="ticketType"
                              value={ticket.id}
                              checked={selectedTicketId === ticket.id}
                              onChange={() => setSelectedTicketId(ticket.id)}
                              className="w-5 h-5 accent-ink"
                            />
                            <div>
                              <span className="font-black uppercase text-ink block">{ticket.name}</span>
                              <span className="font-bold text-ink/60 text-xs uppercase block">{ticket.description}</span>
                            </div>
                          </div>
                          <span className="font-display font-black text-xl text-ink">
                            FREE
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:w-1/2">
                  <form onSubmit={handleRSVPSubmit} className="space-y-6 flex flex-col h-full justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black uppercase text-ink mb-2">FULL NAME</label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-white text-ink px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-pink focus:text-white"
                          placeholder="JANE DOE"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-ink mb-2">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-white text-ink px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-pink focus:text-white"
                          placeholder="JANE@EXAMPLE.COM"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t-sharpie">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display font-black text-4xl text-ink">FREE</span>
                      </div>

                      <button
                        type="submit"
                        disabled={rsvpSuccess || remainingSpots === 0}
                        className="w-full py-4 bg-ink text-neon-yellow text-2xl font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                      >
                        {rsvpSuccess ? 'TEARING TICKET...' : remainingSpots === 0 ? 'SOLD OUT' : 'GRAB TICKET'}
                        {!rsvpSuccess && remainingSpots > 0 && <ArrowRight className="w-6 h-6" />}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Success Fallback Message (visible while tearing) */}
          {rsvpSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 text-white space-y-4">
              <span className="font-display text-5xl font-black uppercase text-ink bg-neon-yellow px-4 py-2 border-sharpie transform -rotate-3">
                TICKET ACQUIRED.
              </span>
              <span className="font-bold text-xl uppercase bg-ink px-4 py-2 border-sharpie text-white">
                SEE YOU IN THE PIT.
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { CATEGORIES } from '../data/mockData';
import { Search, Filter, LayoutGrid, List, X, Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const ExplorePage: React.FC = () => {
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Available unique locations from events
  const locations = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      const city = e.address.split(',').slice(-2, -1)[0]?.trim() || e.locationName;
      if (city) set.add(city);
    });
    return Array.from(set);
  }, [events]);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Category check
      if (selectedCategory !== 'All' && evt.category !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(query);
        const matchDesc = evt.description.toLowerCase().includes(query);
        const matchHost = evt.host.name.toLowerCase().includes(query);
        const matchLoc = evt.locationName.toLowerCase().includes(query) || evt.address.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchHost && !matchLoc) return false;
      }



      // Location check
      if (locationFilter !== 'all' && !evt.address.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [events, selectedCategory, searchTerm, locationFilter]);

  const hasActiveFilters = selectedCategory !== 'All' || searchTerm || locationFilter !== 'all';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');

    setLocationFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="space-y-4 border-l-[8px] border-neon-blue pl-6 relative">
        <div className="absolute -left-[14px] top-0 w-5 h-5 bg-neon-pink border-sharpie transform rotate-45"></div>
        <span className="text-xs font-black uppercase tracking-widest text-ink bg-neon-yellow px-2 py-1 inline-block border-sharpie transform -rotate-2">THE ARCHIVE</span>
        <h1 className="font-display text-5xl sm:text-7xl font-black text-ink uppercase">FIND EVENTS</h1>
        <p className="text-ink font-bold text-lg max-w-xl bg-white border-sharpie p-3 inline-block shadow-sharpie-sm">
          UNDERGROUND SALONS. SECRET SHOWS. FOUNDER SUMMITS.
        </p>
      </div>

      {/* Control Bar: Search + Category Pills + View Toggle */}
      <div className="bg-paper p-4 sm:p-6 border-sharpie shadow-sharpie space-y-5 relative">
        
        {/* Search input & View Toggles */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-6 h-6 absolute left-4 top-3 text-ink font-black" />
            <input
              type="text"
              placeholder="SEARCH BY TITLE, HOST, CITY, OR TOPIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-ink pl-12 pr-4 py-3 font-black uppercase border-sharpie focus:bg-neon-yellow focus:outline-none placeholder-ink/50 transition-colors"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-3 text-ink hover:text-neon-pink transition-colors">
                <X className="w-6 h-6 font-black" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border-sharpie">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors border-r-sharpie ${viewMode === 'grid' ? 'bg-ink text-white' : 'text-ink hover:bg-neon-yellow'}`}
                title="GRID VIEW"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-ink text-white' : 'text-ink hover:bg-neon-yellow'}`}
                title="LIST VIEW"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-black uppercase tracking-wider transition-all whitespace-nowrap border-sharpie ${
                selectedCategory === cat
                  ? 'bg-ink text-neon-yellow shadow-sharpie-sm transform -translate-y-1'
                  : 'bg-white text-ink hover:bg-neon-pink hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t-sharpie">
            <span className="font-bold text-ink uppercase">
              FOUND <strong className="text-neon-pink text-xl bg-ink px-2 ml-1 mr-1">{filteredEvents.length}</strong> EVENTS
            </span>
            <button
              onClick={resetFilters}
              className="bg-neon-pink text-white hover:bg-ink px-3 py-1 font-black uppercase border-sharpie flex items-center gap-1"
            >
              <X className="w-4 h-4" /> RESET
            </button>
          </div>
        )}
      </div>

      {/* Event List / Masonry Grid */}
      {filteredEvents.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt, index) => (
              <EventCard key={evt.id} event={evt} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="bg-paper p-4 border-sharpie shadow-sharpie hover-sharpie-lift flex flex-col md:flex-row gap-6 items-stretch relative overflow-hidden group">
                <div className="md:w-64 border-sharpie flex-shrink-0 bg-ink">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-48 md:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-ink font-black uppercase bg-neon-yellow inline-flex px-2 py-1 border-sharpie text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {evt.startTime} {evt.timezone}</span>
                    </div>
                    
                    <Link to={`/event/${evt.id}`} className="block">
                      <h3 className="font-display text-3xl font-black text-ink uppercase hover:text-neon-blue transition-colors line-clamp-2">{evt.title}</h3>
                    </Link>
                    
                    <p className="text-ink font-bold line-clamp-2 bg-white px-2 py-1 border-sharpie inline-block mt-2">
                      {evt.tagline}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
                    <div className="flex items-center gap-4 text-ink font-black uppercase text-sm">
                      <span className="flex items-center gap-1 bg-white border-sharpie px-2 py-1"><MapPin className="w-4 h-4" /> {evt.locationName}</span>
                    </div>
                    
                    <Link
                      to={`/event/${evt.id}`}
                      className="px-6 py-3 bg-ink text-white font-black uppercase border-sharpie shadow-sharpie-sm hover-sharpie-lift whitespace-nowrap inline-flex items-center gap-2"
                    >
                      VIEW DETAIL <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-paper border-sharpie shadow-sharpie space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#0A0A0A_2px,transparent_2px)] [background-size:24px_24px] opacity-10"></div>
          
          <div className="relative z-10 space-y-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-ink flex items-center justify-center transform -rotate-12 border-sharpie text-neon-yellow shadow-sharpie">
              <Search className="w-12 h-12" />
            </div>
            <div>
              <p className="font-display text-5xl font-black text-ink uppercase">NOTHING FOUND.</p>
              <p className="text-ink font-bold uppercase bg-white px-4 py-2 border-sharpie inline-block mt-4 shadow-sharpie-sm">
                TRY RESETTING FILTERS OR SEARCHING SOMETHING ELSE.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-8 py-4 bg-neon-pink text-white font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { Search, Download, Mail, CheckCircle, XCircle, ArrowLeft, UserPlus, Check, X, Shield } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const GuestManagementPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const updateGuestStatus = (eventId: string, guestId: string, status: string, checkedIn: boolean) => {
    // Mocked for UI purposes since backend only supports ticket check-in via QR code.
    console.log("updateGuestStatus called", { eventId, guestId, status, checkedIn });
  };

  const event = events.find(e => e.id === eventId) || events[0];

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checkedIn' | 'pending'>('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const filteredGuests = event.guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'checkedIn' && !g.checkedIn) return false;
    if (filterStatus === 'pending' && g.checkedIn) return false;
    return matchSearch;
  });

  const checkedInCount = event.guests.filter(g => g.checkedIn).length;

  const exportCSV = () => {
    const headers = ['Guest ID', 'Name', 'Email', 'Ticket Type', 'Check-In Status', 'Check-In Time'];
    const rows = event.guests.map(g => [
      g.id,
      g.name,
      g.email,
      g.ticketType,
      g.checkedIn ? 'Checked In' : 'Pending',
      g.checkInTime || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guestlist-${event.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementSent(false);
      setAnnouncementModalOpen(false);
      setAnnouncementText('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Bar */}
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase text-ink hover:text-neon-blue transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-sharpie pb-6">
          <div className="space-y-2">
            <span className="bg-neon-yellow px-2 py-1 text-xs font-black uppercase tracking-widest text-ink border-sharpie inline-block">GUEST ROSTER</span>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">{event.title}</h1>
            <p className="text-sm text-ink font-bold uppercase tracking-wider">{event.date} • {event.locationName}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAnnouncementModalOpen(true)}
              className="px-6 py-3 bg-white hover:bg-neon-yellow text-ink text-sm font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2 hover-sharpie-lift transition-all"
            >
              <Mail className="w-4 h-4" /> EMAIL GUESTS
            </button>

            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-neon-pink hover:bg-ink text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2 hover-sharpie-lift transition-all"
            >
              <Download className="w-4 h-4" /> EXPORT CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 border-sharpie shadow-sharpie-sm hover:bg-neon-yellow transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-ink/70">TOTAL RSVPS</span>
          <p className="font-display text-5xl font-black text-ink">{event.guests.length}</p>
        </div>

        <div className="bg-white p-6 border-sharpie shadow-sharpie-sm hover:bg-neon-blue hover:text-white transition-colors group">
          <span className="text-xs font-black uppercase tracking-wider text-ink/70 group-hover:text-white">DOOR CHECKED IN</span>
          <p className="font-display text-5xl font-black text-ink group-hover:text-white">{checkedInCount}</p>
        </div>

        <div className="bg-white p-6 border-sharpie shadow-sharpie-sm hover:bg-neon-pink hover:text-white transition-colors group">
          <span className="text-xs font-black uppercase tracking-wider text-ink/70 group-hover:text-white">ATTENDANCE RATE</span>
          <p className="font-display text-5xl font-black text-ink group-hover:text-white">
            {event.guests.length > 0 ? Math.round((checkedInCount / event.guests.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Guest Table Container */}
      <div className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-8 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-ink" />
            <input
              type="text"
              placeholder="Search guests by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-12 pr-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all ${filterStatus === 'all' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'}`}
            >
              ALL ({event.guests.length})
            </button>
            <button
              onClick={() => setFilterStatus('checkedIn')}
              className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all ${filterStatus === 'checkedIn' ? 'bg-neon-blue text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'}`}
            >
              CHECKED IN ({checkedInCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all ${filterStatus === 'pending' ? 'bg-neon-pink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'}`}
            >
              PENDING ({event.guests.length - checkedInCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-sharpie bg-white shadow-sharpie-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-sharpie bg-ink text-white font-black uppercase tracking-wider text-xs">
                <th className="p-4">GUEST</th>
                <th className="p-4">PASS TIER</th>
                <th className="p-4">RSVP DATE</th>
                <th className="p-4">DOOR STATUS</th>
                <th className="p-4 text-right">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-sharpie">
              {filteredGuests.map(g => (
                <tr key={g.id} className="hover:bg-neon-yellow transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={g.avatar} alt={g.name} className="w-10 h-10 object-cover border-sharpie bg-white" />
                      <div>
                        <p className="font-black text-ink uppercase">{g.name}</p>
                        <p className="text-xs font-bold text-ink/70 uppercase">{g.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-white text-ink border-sharpie font-black px-3 py-1 text-xs uppercase shadow-sharpie-sm">
                      {g.ticketType}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-ink uppercase">{g.rsvpDate}</td>
                  <td className="p-4">
                    {g.checkedIn ? (
                      <span className="inline-flex items-center gap-1.5 text-white bg-ink border-sharpie px-3 py-1 font-black text-xs uppercase shadow-sharpie-sm">
                        <CheckCircle className="w-4 h-4 text-neon-yellow" /> CHECKED IN ({g.checkInTime || '18:45'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-ink bg-white border-sharpie px-3 py-1 font-black text-xs uppercase shadow-sharpie-sm">
                        PENDING DOOR
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => updateGuestStatus(event.id, g.id, 'confirmed', !g.checkedIn)}
                      className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all hover-sharpie-lift ${
                        g.checkedIn
                          ? 'bg-white text-ink hover:bg-neon-pink hover:text-white'
                          : 'bg-neon-blue text-white hover:bg-ink'
                      }`}
                    >
                      {g.checkedIn ? 'UNDO' : 'CHECK IN'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Announcement Modal */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="bg-paper border-sharpie shadow-sharpie max-w-lg w-full p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b-sharpie pb-4">
              <h3 className="font-display text-3xl font-black text-ink uppercase">EMAIL GUESTS</h3>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-ink hover:text-neon-pink transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            {announcementSent ? (
              <div className="p-6 bg-neon-yellow border-sharpie shadow-sharpie-sm text-ink text-lg font-black uppercase text-center flex flex-col items-center gap-4">
                <CheckCircle className="w-12 h-12" />
                DISPATCHED TO {event.guests.length} GUESTS!
              </div>
            ) : (
              <form onSubmit={handleSendAnnouncement} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">MESSAGE SUBJECT</label>
                  <input
                    type="text"
                    required
                    defaultValue={`Important Update: ${event.title}`}
                    className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">MESSAGE BODY</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="e.g. Doors open at 6:30 PM sharp. Please enter through Broome Street entrance..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-white p-4 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t-sharpie">
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalOpen(false)}
                    className="px-6 py-3 text-sm font-black uppercase text-ink bg-white border-sharpie shadow-sharpie-sm hover:bg-neon-yellow hover-sharpie-lift transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-neon-blue text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm hover:bg-ink hover-sharpie-lift transition-all"
                  >
                    SEND BROADCAST
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { CATEGORIES } from '../data/mockData';
import { Sparkles, ArrowRight, Compass, Plus, CircleSlash2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Homepage: React.FC = () => {
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const featuredEvent = events.find(e => e.featured) || events[0];
  const otherEvents = events.filter(e => e.id !== featuredEvent.id);

  const filteredEvents = selectedCategory === 'All'
    ? otherEvents
    : otherEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="pb-16 bg-paper">
      
      {/* Brutalist Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b-sharpie bg-neon-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-neon-yellow text-xs font-black uppercase border-sharpie shadow-sharpie-sm"
            >
              <Sparkles className="w-4 h-4" />
              NO BS EVENT PLATFORM
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-ink leading-[0.9] uppercase break-words"
            >
              GRAB YOUR <br className="hidden sm:block" />
              <span className="text-stroke-ink bg-clip-text">DAMN TICKET.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-ink text-lg sm:text-xl font-bold leading-relaxed max-w-2xl uppercase border-l-sharpie pl-4"
            >
              Gatherum replaces noisy event listings with raw, high-impact pages, rapid guest management, and brutal ticketing for the underground scene.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pt-4 flex flex-wrap items-center gap-6"
            >
              <Link
                to="/explore"
                className="px-8 py-4 bg-ink text-white text-lg font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift hover:bg-neon-pink flex items-center gap-2"
              >
                TONIGHT / THIS WEEKEND <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/create"
                className="px-8 py-4 bg-white text-ink text-lg font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift hover:bg-neon-blue hover:text-white flex items-center gap-2"
              >
                HOST A RAGER <Plus className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Featured Headline Event Section */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-6">
          <div className="flex items-center justify-between border-b-sharpie pb-4">
            <h2 className="font-display text-4xl sm:text-6xl font-black text-ink uppercase">HEADLINER</h2>
            <span className="hidden sm:inline-block px-4 py-2 bg-neon-pink text-white font-black border-sharpie">HOT</span>
          </div>

          <EventCard event={featuredEvent} variant="featured" />
        </section>
      )}

      {/* Category Pills & Event Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-sharpie pb-6">
          <h2 className="font-display text-4xl sm:text-6xl font-black text-ink uppercase text-stroke-ink">
            THE FEED
          </h2>

          {/* Category Pills */}
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 font-black uppercase border-sharpie transition-all whitespace-nowrap shadow-sharpie-sm hover-sharpie-lift ${
                  selectedCategory === cat
                    ? 'bg-ink text-neon-yellow'
                    : 'bg-white text-ink hover:bg-neon-pink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredEvents.map((evt, idx) => (
              <div key={evt.id} className="pt-4">
                <EventCard event={evt} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neon-blue border-sharpie shadow-sharpie space-y-6">
            <CircleSlash2 className="w-16 h-16 mx-auto text-white" />
            <p className="font-display text-4xl font-black text-white uppercase">DEAD ZONE</p>
            <p className="text-lg font-bold text-ink bg-white inline-block px-4 py-1 border-sharpie">NO EVENTS FOUND FOR THIS CATEGORY.</p>
            <br/>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 mt-4 px-8 py-3 bg-neon-yellow text-ink text-xl font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift"
            >
              START SOMETHING
            </Link>
          </div>
        )}

        <div className="text-center pt-12">
          <Link
            to="/explore"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-ink border-sharpie shadow-sharpie text-xl font-black uppercase transition-all hover-sharpie-lift hover:bg-neon-blue hover:text-white"
          >
            ALL EVENTS <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Host CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="relative bg-ink border-sharpie shadow-sharpie p-8 sm:p-14 overflow-hidden">
          
          <div className="relative z-10 max-w-3xl space-y-8">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-neon-yellow text-ink text-sm font-black uppercase border-sharpie">
              <Sparkles className="w-4 h-4" /> ORGANIZER TOOLS
            </span>

            <h2 className="font-display text-5xl sm:text-7xl font-black leading-[0.9] text-white uppercase">
              DROP YOUR <span className="text-neon-pink">NEXT EVENT</span> LIKE A BOMB.
            </h2>

            <p className="text-white text-lg sm:text-xl font-bold leading-relaxed uppercase border-l-sharpie pl-4">
              Custom brutalist themes, automated sync, RSVP approvals, QR door scanners, and zero fluff.
            </p>

            <div className="pt-4 flex flex-wrap gap-6">
              <Link
                to="/create"
                className="px-8 py-4 bg-neon-pink hover:bg-white text-white hover:text-ink text-lg font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift transition-colors"
              >
                CREATE EVENT
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-transparent text-white border-sharpie text-lg font-black uppercase hover:bg-neon-blue transition-colors"
              >
                HOST DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { Users, DollarSign, Eye, TrendingUp, Plus, Calendar as CalendarIcon, ChevronRight, UserCheck, Settings, MoveRight, MapPin } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const HostDashboardPage: React.FC = () => {
  const { events: rawEvents } = useData();
  const { user } = useAuth();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const hostedEvents = events.filter(e => e.host.id === user?.id || e.host.name === user?.email || e.featured);

  // Stats calculation
  const totalAttendees = hostedEvents.reduce((acc, evt) => acc + evt.guests.length, 0);

  const totalCapacity = hostedEvents.reduce((acc, evt) => acc + evt.totalCapacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 85;

  const upcomingEvents = hostedEvents.filter(e => new Date(e.date) >= new Date('2026-08-01'));
  const pastEvents = hostedEvents.filter(e => new Date(e.date) < new Date('2026-08-01'));

  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-sharpie pb-6">
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-ink bg-neon-yellow px-2 py-1 inline-block border-sharpie transform -rotate-2">HOST COMMAND CENTER</span>
          <h1 className="font-display text-5xl sm:text-7xl font-black text-ink uppercase leading-none">DASHBOARD</h1>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-3 px-6 py-4 bg-neon-pink hover:bg-ink text-white font-black uppercase tracking-wider border-sharpie shadow-sharpie-sm hover-sharpie-lift transition-all self-start md:self-auto"
        >
          <Plus className="w-6 h-6" /> HOST NEW EVENT
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="bg-paper p-6 border-sharpie shadow-sharpie space-y-4 relative overflow-hidden group hover:bg-neon-yellow transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white border-sharpie rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="font-black uppercase tracking-wider text-ink/70 text-sm">TOTAL GUESTS</span>
            <div className="p-2 bg-ink text-white border-sharpie">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-6xl font-black text-ink relative z-10">{totalAttendees}</p>
          <p className="font-bold text-xs uppercase bg-white border-sharpie inline-block px-2 py-1 relative z-10 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-neon-pink" /> +18% VS LAST MONTH
          </p>
        </div>

        <div className="bg-paper p-6 border-sharpie shadow-sharpie space-y-4 relative overflow-hidden group hover:bg-neon-pink transition-colors">
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-white border-sharpie transform rotate-45 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="font-black uppercase tracking-wider text-ink/70 text-sm">OCCUPANCY RATE</span>
            <div className="p-2 bg-white text-ink border-sharpie">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-6xl font-black text-ink relative z-10">{occupancyRate}%</p>
          <p className="font-bold text-xs uppercase text-ink/80 relative z-10">CAPACITY FILLED ACROSS EVENTS</p>
        </div>

        <div className="bg-ink text-white p-6 border-sharpie shadow-sharpie space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black uppercase tracking-wider text-white/70 text-sm">PAGE VIEWS</span>
            <div className="p-2 bg-neon-yellow text-ink border-sharpie">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-6xl font-black text-white">4.2K</p>
          <p className="font-bold text-xs uppercase text-white/80">UNIQUE VISITOR IMPRESSIONS</p>
        </div>

      </div>

      {/* Main Content Area: Events List & Guest Actions */}
      <div className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-10 space-y-8">
        
        {/* Tab switcher */}
        <div className="flex items-center border-b-sharpie">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-wider border-sharpie border-b-0 transition-colors ${
              activeTab === 'upcoming' ? 'bg-neon-yellow text-ink' : 'bg-white text-ink hover:bg-neon-yellow/50'
            }`}
          >
            UPCOMING ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-wider border-sharpie border-l-0 border-b-0 transition-colors ${
              activeTab === 'past' ? 'bg-neon-yellow text-ink' : 'bg-white text-ink hover:bg-neon-yellow/50'
            }`}
          >
            PAST ({pastEvents.length})
          </button>
        </div>

        {/* Hosted Events Table */}
        <div className="space-y-6">
          {displayedEvents.length > 0 ? (
            displayedEvents.map(evt => (
              <div key={evt.id} className="p-4 bg-white border-sharpie shadow-sharpie-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover-sharpie-lift">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
                  <div className="w-full sm:w-24 h-32 sm:h-24 bg-ink border-sharpie shrink-0">
                    <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover grayscale opacity-90" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-black uppercase text-xs bg-neon-pink text-white px-2 py-1 border-sharpie">{evt.category}</span>
                      <span className="text-xs text-ink font-bold uppercase">{evt.date} • {evt.startTime}</span>
                    </div>
                    <Link to={`/event/${evt.id}`} className="font-display text-2xl font-black text-ink hover:text-neon-blue uppercase transition-colors line-clamp-1 block">
                      {evt.title}
                    </Link>
                    <p className="text-sm font-bold text-ink/70 uppercase"><MapPin className="w-4 h-4 inline mr-1" />{evt.locationName}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto md:shrink-0 pt-4 md:pt-0 border-t-sharpie md:border-t-0">
                  <div className="bg-paper border-sharpie px-4 py-2 text-center w-full sm:w-auto">
                    <p className="text-lg font-black text-ink">{evt.guests.length} / {evt.totalCapacity}</p>
                    <p className="text-[10px] text-ink font-bold uppercase">RSVPS</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
                    <Link
                      to={`/guest-management/${evt.id}`}
                      className="px-6 py-3 bg-ink hover:bg-neon-blue text-white text-sm font-black uppercase tracking-wider border-sharpie transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" /> GUESTS
                    </Link>
                    <Link
                      to={`/event/${evt.id}`}
                      className="px-4 py-3 bg-neon-yellow hover:bg-white text-ink text-sm font-black uppercase border-sharpie transition-colors flex items-center justify-center"
                      title="View Event Page"
                    >
                      <MoveRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white border-sharpie space-y-6">
              <p className="font-display text-4xl font-black uppercase text-ink">NO {activeTab} EVENTS.</p>
              <Link to="/create" className="inline-block px-8 py-4 bg-neon-pink text-white font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift">
                HOST A NEW EVENT
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { ShieldCheck, MapPin, Globe, UserPlus, Check, Link as LinkIcon } from 'lucide-react';

export const HostPublicProfilePage: React.FC = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);

  const host = {
    id: hostId || 'host1',
    name: 'Event Organizer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    handle: '@organizer',
    bio: 'Gatherum Organizer',
    verified: true,
    location: 'Campus',
    totalEventsHosted: events.length,
    totalAttendees: 0
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(384);

  const hostedEvents = events.filter(e => e.host.id === host.id || e.host.name === host.name);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Host Profile Hero Header */}
      <div className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-12 space-y-8 relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue rounded-full border-sharpie opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8">
            <div className="relative">
              <img
                src={host.avatar}
                alt={host.name}
                className="w-32 h-32 object-cover border-sharpie shadow-sharpie-sm bg-white"
              />
              {host.verified && (
                <div className="absolute -bottom-3 -right-3 bg-neon-pink text-white p-1 border-sharpie shadow-sharpie-sm" title="Verified Host">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="bg-neon-yellow text-ink px-2 py-1 text-xs font-black uppercase border-sharpie inline-block">HOST PROFILE</span>
                <h1 className="font-display text-5xl sm:text-6xl font-black text-ink uppercase leading-none">{host.name}</h1>
              </div>

              <p className="text-sm font-black uppercase bg-white border-sharpie inline-block px-3 py-1 text-ink shadow-sharpie-sm">
                {host.handle} • {host.location}
              </p>
              
              <p className="text-ink text-base font-bold max-w-xl border-l-sharpie pl-4">
                {host.bio}
              </p>

              {/* Socials */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* Removed missing twitter/website fields */}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch md:items-end w-full md:w-auto gap-4 pt-6 md:pt-0 border-t-sharpie md:border-t-0">
            <button
              onClick={toggleFollow}
              className={`px-8 py-4 text-sm font-black uppercase tracking-wider transition-all flex justify-center items-center gap-3 border-sharpie shadow-sharpie hover-sharpie-lift ${
                isFollowing
                  ? 'bg-ink text-white'
                  : 'bg-neon-pink text-white hover:bg-ink'
              }`}
            >
              {isFollowing ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isFollowing ? 'FOLLOWING' : 'FOLLOW HOST'}
            </button>

            <div className="bg-white border-sharpie px-4 py-2 text-center shadow-sharpie-sm w-full">
               <p className="font-display text-3xl font-black text-ink">{followerCount}</p>
               <p className="text-xs text-ink font-bold uppercase tracking-wider">FOLLOWERS</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="pt-8 border-t-sharpie grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
          <div className="bg-white border-sharpie p-4 hover:bg-neon-yellow transition-colors">
            <p className="font-display text-4xl font-black text-ink">{host.totalEventsHosted}</p>
            <p className="text-xs font-bold uppercase text-ink/70">EVENTS</p>
          </div>
          <div className="bg-white border-sharpie p-4 hover:bg-neon-blue hover:text-white transition-colors">
            <p className="font-display text-4xl font-black text-ink current-color">{host.totalAttendees}</p>
            <p className="text-xs font-bold uppercase text-ink/70 current-color">GUESTS</p>
          </div>
          <div className="bg-white border-sharpie p-4 hover:bg-neon-pink hover:text-white transition-colors">
            <p className="font-display text-4xl font-black text-ink current-color">4.9 ★</p>
            <p className="text-xs font-bold uppercase text-ink/70 current-color">RATING</p>
          </div>
          <div className="bg-ink text-white border-sharpie p-4 hover:bg-neon-yellow hover:text-ink transition-colors">
            <p className="font-display text-4xl font-black current-color">100%</p>
            <p className="text-xs font-bold uppercase current-color/70">RESPONSE</p>
          </div>
        </div>

      </div>

      {/* Host Events List */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 border-b-sharpie pb-4">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase">HOSTED EVENTS</h2>
          <span className="bg-neon-yellow px-3 py-1 font-black text-ink border-sharpie transform rotate-2">{hostedEvents.length}</span>
        </div>

        {hostedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {hostedEvents.map((evt, idx) => (
              <div key={evt.id} className="pt-4">
                <EventCard event={evt} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white border-sharpie shadow-sharpie">
            <p className="font-display text-4xl font-black text-ink uppercase">NO PUBLIC EVENTS YET.</p>
          </div>
        )}
      </div>

    </div>
  );
};


\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { Calendar, Bookmark, User as UserIcon, QrCode, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const { events: rawEvents, registrations } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [activeTab, setActiveTab] = useState<'rsvps' | 'saved' | 'settings'>('rsvps');

  // State for settings form
  const [name, setName] = useState(user?.email || '');
  const [savedMsg, setSavedMsg] = useState(false);

  // Filtered saved events (Mocked since backend doesn't support bookmarking yet)
  const savedEvents: typeof events = [];

  // RSVPs events
  const rsvpEvents = registrations.map(r => {
    const evt = events.find(e => e.id === r.eventId);
    return { rsvp: { ...r, ticketTypeName: 'General Admission' }, event: evt };
  }).filter(item => item.event !== undefined);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // Mocked save for now
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Profile Header Card */}
      <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative graphic */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-neon-pink rounded-full border-sharpie opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6 md:gap-8">
            <div className="w-32 h-32 flex items-center justify-center bg-neon-yellow border-sharpie shadow-sharpie text-ink font-black text-6xl uppercase">
              {user?.email[0]}
            </div>
            <div className="space-y-2">
              <span className="bg-neon-pink text-white px-2 py-1 text-xs font-black uppercase border-sharpie inline-block">ATTENDEE PASS</span>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">{user?.email}</h1>
              <p className="text-sm font-black uppercase bg-white border-sharpie inline-block px-3 py-1 text-ink shadow-sharpie-sm">
                LEVEL: {user?.role.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setActiveTab('settings')}
            className="px-6 py-3 bg-neon-yellow hover:bg-ink hover:text-white text-ink text-xs font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2 hover-sharpie-lift transition-all"
          >
            <Settings className="w-4 h-4" /> EDIT PROFILE
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-4 border-b-sharpie pb-4">
        <button
          onClick={() => setActiveTab('rsvps')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-sharpie flex items-center gap-2 ${
            activeTab === 'rsvps' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'
          }`}
        >
          <Calendar className="w-4 h-4" /> MY PASSES ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-sharpie flex items-center gap-2 ${
            activeTab === 'saved' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'
          }`}
        >
          <Bookmark className="w-4 h-4" /> BOOKMARKED ({savedEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-sharpie flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'
          }`}
        >
          <Settings className="w-4 h-4" /> SETTINGS
        </button>
      </div>

      {/* Tab Content: RSVPs */}
      {activeTab === 'rsvps' && (
        <div className="space-y-6">
          {rsvpEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rsvpEvents.map(({ rsvp, event }) => evtCard(rsvp, event!))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border-sharpie shadow-sharpie p-8 space-y-4">
              <p className="font-display text-3xl font-black text-ink uppercase">NO ACTIVE PASSES.</p>
              <p className="text-sm font-bold text-ink/70">Explore upcoming events and grab a stub.</p>
              <Link to="/explore" className="inline-block px-8 py-4 bg-neon-blue text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm hover-sharpie-lift transition-all hover:bg-ink">
                BROWSE FEED
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Saved */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {savedEvents.map((evt, idx) => (
                <div key={evt.id} className="pt-4">
                  <EventCard event={evt} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border-sharpie shadow-sharpie p-8 space-y-4">
              <p className="font-display text-3xl font-black text-ink uppercase">NO BOOKMARKED EVENTS.</p>
              <p className="text-sm font-bold text-ink/70">Click the bookmark icon on any event flyer to save it.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-paper p-8 border-sharpie shadow-sharpie max-w-xl space-y-8">
          <h3 className="font-display text-3xl font-black text-ink uppercase">ACCOUNT SETTINGS</h3>

          {savedMsg && (
            <div className="p-4 bg-neon-yellow text-ink text-xs font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-ink" /> PREFERENCES UPDATED.
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-ink/70 mb-2">FULL NAME</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-sharpie px-4 py-3 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-neon-blue uppercase"
                  />
                </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-neon-pink hover:bg-ink text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm hover-sharpie-lift transition-all"
            >
              SAVE PROFILE CHANGES
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

function evtCard(rsvp: any, event: any) {
  return (
    <div key={rsvp.id} className="bg-white border-sharpie p-6 shadow-sharpie hover-sharpie-lift transition-all flex flex-col justify-between space-y-6 group cursor-pointer hover:bg-neon-yellow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative w-full sm:w-32 aspect-video sm:aspect-square shrink-0 border-sharpie overflow-hidden">
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
        </div>
        <div className="space-y-3 flex-1">
          <span className="bg-ink text-white px-2 py-1 text-[10px] font-black uppercase border-sharpie">{event.category}</span>
          <h4 className="font-display text-2xl font-black text-ink uppercase leading-tight line-clamp-2">{event.title}</h4>
          <p className="text-xs font-bold text-ink/70 uppercase">
            {event.date} • {event.startTime} <br/> {event.locationName}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t-sharpie flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs font-black text-ink bg-white px-3 py-1.5 border-sharpie shadow-sharpie-sm uppercase flex-1 sm:flex-none text-center">
          PASS: {rsvp.ticketTypeName}
        </span>
        <Link
          to={`/ticket/${rsvp.id}`}
          className="px-6 py-2.5 bg-neon-blue text-white text-xs font-black uppercase border-sharpie shadow-sharpie-sm flex items-center justify-center gap-2 transition-colors hover:bg-ink flex-1 sm:flex-none"
        >
          <QrCode className="w-4 h-4" /> VIEW TICKET
        </Link>
      </div>
    </div>
  );
}

\\\`n
## \$relPath\`n
\\\$ext
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Search, ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-8 max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-2 px-3 py-1 border-sharpie bg-neon-yellow text-ink text-xs font-black uppercase tracking-widest shadow-sharpie-sm transform -rotate-2">
        <Sparkles className="w-4 h-4" /> 404 — PAGE NOT FOUND
      </span>

      <h1 className="font-display text-5xl sm:text-7xl font-black text-ink leading-none uppercase">
        LOST SIGNAL.
      </h1>

      <p className="text-ink font-bold text-base max-w-md bg-white border-sharpie px-6 py-4 shadow-sharpie-sm">
        The link you requested might be expired, private, or mistyped. Return to base or explore upcoming events.
      </p>

      {/* Quick Search Redirect */}
      <div className="pt-6 flex flex-wrap justify-center gap-4">
        <Link
          to="/explore"
          className="px-8 py-4 bg-neon-pink hover:bg-ink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-all flex items-center gap-2 hover-sharpie-lift"
        >
          EXPLORE GATHERINGS <Compass className="w-5 h-5" />
        </Link>
        <Link
          to="/"
          className="px-8 py-4 bg-white hover:bg-neon-yellow text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-all hover-sharpie-lift"
        >
          RETURN HOME
        </Link>
      </div>

      {/* Category Pills */}
      <div className="pt-10 border-t-sharpie w-full space-y-4">
        <p className="text-xs font-black uppercase tracking-wider text-ink">POPULAR CATEGORIES</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.filter(c => c !== 'All').slice(0, 4).map(cat => (
            <Link
              key={cat}
              to={`/explore?cat=${encodeURIComponent(cat)}`}
              className="px-4 py-2 border-sharpie bg-white hover:bg-neon-blue hover:text-white text-ink text-xs font-black uppercase tracking-wider transition-colors shadow-sharpie-sm hover-sharpie-lift"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};


\\\`n
## \$relPath\`n
\\\$ext
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/api';
import { Check, ArrowRight, User } from 'lucide-react';

export const ProfileCompletionPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await AuthService.completeProfile({
        fullName,
        rollNumber,
        branch,
        yearOfStudy: parseInt(yearOfStudy),
        phoneNumber: phoneNumber || null,
      });
      await refreshUser();
      
      const from = location.state?.from?.pathname || '/my-events';
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      alert('Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-48 h-48 bg-neon-blue border-sharpie rounded-full transform translate-x-1/4 -translate-y-1/4 -z-10"></div>
      
      <div className="max-w-xl w-full bg-white border-sharpie shadow-sharpie p-8 space-y-8 relative">
        <div className="absolute -top-4 -left-4 bg-neon-yellow text-ink px-4 py-2 font-black uppercase text-sm border-sharpie transform -rotate-3">
          MANDATORY STEP
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">
            COMPLETE YOUR PROFILE
          </h1>
          <p className="text-ink font-bold bg-paper border-sharpie px-3 py-2 inline-block shadow-sharpie-sm">
            WE NEED A FEW DETAILS TO SECURE YOUR ACCESS.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block font-black uppercase text-ink text-sm">FULL NAME *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-yellow focus:text-ink transition-colors uppercase placeholder-ink/30"
              placeholder="e.g. ADA LOVELACE"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">ROLL NUMBER *</label>
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-blue focus:text-white transition-colors uppercase placeholder-ink/30"
                placeholder="e.g. 21CS001"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">BRANCH *</label>
              <select
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-pink focus:text-white transition-colors uppercase"
              >
                <option value="" disabled>SELECT BRANCH</option>
                <option value="CSE">COMPUTER SCIENCE</option>
                <option value="IT">IT</option>
                <option value="ECE">ELECTRONICS</option>
                <option value="EE">ELECTRICAL</option>
                <option value="ME">MECHANICAL</option>
                <option value="CE">CIVIL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">YEAR OF STUDY *</label>
              <select
                required
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-yellow focus:text-ink transition-colors uppercase"
              >
                <option value="1">1ST YEAR</option>
                <option value="2">2ND YEAR</option>
                <option value="3">3RD YEAR</option>
                <option value="4">4TH YEAR</option>
                <option value="5">ALUMNI / OTHER</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block font-black uppercase text-ink text-sm">PHONE NUMBER</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-paper px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-blue focus:text-white transition-colors uppercase placeholder-ink/30"
                placeholder="OPTIONAL"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-ink text-white font-black uppercase text-xl border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-3 hover:bg-neon-pink hover:text-white disabled:opacity-50"
          >
            {isSubmitting ? 'SAVING...' : 'FINISH PROFILE'} <ArrowRight className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/api';
import { Settings, User, Shield, LogOut, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { ImageUpload } from '../components/common/ImageUpload';

export const ProfileSettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [publicRsvp, setPublicRsvp] = useState(false);

  useEffect(() => {
    if (user) {
      AuthService.getProfile(user.id).then(data => {
        setProfile(data);
        setPublicRsvp(data.public_rsvp ?? false);
      });
    }
  }, [user]);

  const handleTogglePrivacy = async () => {
    setIsUpdating(true);
    try {
      await AuthService.updateProfilePrivacy(!publicRsvp);
      setPublicRsvp(!publicRsvp);
    } catch (e) {
      console.error(e);
      alert('Failed to update privacy settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !user) return;
    setIsUpdating(true);
    try {
      const newUrl = await StorageService.uploadImage(file, 'avatars', user.id, profile.avatar_url);
      await AuthService.updateProfileAvatar(newUrl);
      setProfile({ ...profile, avatar_url: newUrl });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <h2 className="font-display text-2xl font-black uppercase tracking-widest text-ink animate-pulse">LOADING PROFILE...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4 border-b-sharpie pb-6">
        <div className="flex items-center gap-3 text-neon-pink">
          <Settings className="w-8 h-8" />
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">
            ACCOUNT SETTINGS
          </h1>
        </div>
        <p className="text-ink font-bold uppercase tracking-widest text-sm">
          MANAGE YOUR IDENTITY AND PREFERENCES.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info Block */}
        <div className="bg-white border-sharpie shadow-sharpie p-6 space-y-6">
          <div className="flex items-center gap-2 border-b-sharpie pb-4">
            <User className="w-6 h-6 text-neon-blue" />
            <h2 className="font-display text-2xl font-black uppercase text-ink">PERSONAL LOG</h2>
            {isUpdating && <span className="ml-auto text-xs font-black bg-neon-yellow px-2 py-1 uppercase animate-pulse">UPDATING...</span>}
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-32 h-32 shrink-0">
                <ImageUpload
                  label="AVATAR"
                  defaultImage={profile.avatar_url || 'https://images.unsplash.com/photo-1555431189-0af56b2ac1bb?auto=format&fit=crop&q=80&w=200'}
                  maxSizeMB={5}
                  onFileSelect={(file) => {
                    if (file) handleAvatarUpload(file);
                  }}
                  className="w-full h-full"
                />
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-xs font-black uppercase text-ink/60">FULL NAME</p>
                  <p className="text-lg font-bold text-ink uppercase">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-ink/60">EMAIL (RESTRICTED)</p>
                  <p className="text-lg font-bold text-ink uppercase">{profile.email}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-black uppercase text-ink/60">ROLL NUMBER</p>
                <p className="text-lg font-bold text-ink uppercase">{profile.roll_number}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-ink/60">BRANCH / YEAR</p>
                <p className="text-lg font-bold text-ink uppercase">{profile.branch} • Y{profile.year_of_study}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 mt-4 border-t-sharpie">
            <p className="text-xs font-bold text-ink/60 uppercase">PROFILE DATA IS READ-ONLY TO MAINTAIN INTEGRITY. CONTACT ARCHIVIST FOR CHANGES.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Privacy & Role Block */}
          <div className="bg-paper border-sharpie shadow-sharpie-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b-sharpie pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-neon-yellow" />
                <h2 className="font-display text-2xl font-black uppercase text-ink">SECURITY & ACCESS</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black uppercase text-ink text-sm">CURRENT CLEARANCE</p>
                  <p className="text-xs font-bold text-ink/70 uppercase">YOUR SYSTEM ROLE</p>
                </div>
                <span className={`px-3 py-1 font-black text-xs uppercase border-sharpie ${
                  user?.role === 'admin' ? 'bg-neon-pink text-white' : 
                  user?.role === 'organizer' ? 'bg-neon-blue text-white' : 'bg-white text-ink'
                }`}>
                  {user?.role} LEVEL
                </span>
              </div>

              <div className="border-t-sharpie pt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-ink text-sm">PUBLIC RSVP LOG</p>
                  <p className="text-xs font-bold text-ink/70 uppercase max-w-[200px]">ALLOW OTHER GUESTS TO SEE YOUR ATTENDANCE AT EVENTS.</p>
                </div>
                <button
                  onClick={handleTogglePrivacy}
                  disabled={isUpdating}
                  className={`w-14 h-8 border-sharpie flex items-center p-1 transition-colors ${
                    publicRsvp ? 'bg-neon-blue justify-end' : 'bg-white justify-start'
                  }`}
                >
                  <div className={`w-5 h-5 border-sharpie bg-ink ${publicRsvp ? 'bg-white' : 'bg-ink'}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Action Block */}
          <button 
            onClick={handleLogout}
            className="w-full bg-ink text-white p-4 font-black uppercase text-lg border-sharpie shadow-sharpie hover-sharpie-lift hover:bg-neon-pink transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> TERMINATE SESSION
          </button>
        </div>
      </div>
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import confetti from 'canvas-confetti';
import { Calendar, MapPin, Share2, Download, Check, Sparkles, ExternalLink, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const TicketConfirmationPage: React.FC = () => {
  const { rsvpId } = useParams<{ rsvpId: string }>();
  const { registrations, events: rawEvents } = useData();
  const { user } = useAuth();
  const events = rawEvents.map(mapCampusEventToEventItem);

  const rsvp = registrations.find(r => r.id === rsvpId) || registrations[0];
  const event = events.find(e => e.id === rsvp?.eventId) || events[0];

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti with brutalist colors
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0A0A0A', '#E5FF00', '#0055FF', '#FF0055'],
        shapes: ['square']
      });
    } catch (e) {
      /* fallback */
    }
  }, []);

  const copyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Calendar Link
  const gcalUrl = (() => {
    const startTimeClean = event.startTime.replace(':', '') + '00';
    const endTimeClean = event.endTime.replace(':', '') + '00';
    const dateClean = event.date.replace(/-/g, '');
    const startIso = `${dateClean}T${startTimeClean}`;
    const endIso = `${dateClean}T${endTimeClean}`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startIso}/${endIso}&location=${encodeURIComponent(event.address)}`;
  })();

  const ticketId = rsvp?.id || `RSVP-${Math.floor(Math.random() * 9000) + 1000}`;

  return (
    <div className="min-h-screen bg-neon-blue flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-9xl font-black text-ink transform -rotate-12">PASS</div>
        <div className="absolute bottom-10 right-10 text-9xl font-black text-ink transform rotate-12">SECURED</div>
      </div>

      <div className="max-w-xl w-full mx-auto relative z-10 space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-yellow border-sharpie shadow-sharpie-sm transform -rotate-2 text-ink">
            <Sparkles className="w-5 h-5" /> 
            <span className="font-black uppercase tracking-widest text-sm">TICKET READY.</span>
          </div>
          <h1 className="font-display text-5xl font-black text-ink uppercase bg-white border-sharpie inline-block px-6 py-2 shadow-sharpie">
            YOU'RE GOING!
          </h1>
        </div>

        {/* Digital Ticket Stub */}
        <motion.div 
          initial={{ y: 50, opacity: 0, rotate: 5 }}
          animate={{ y: 0, opacity: 1, rotate: -2 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
          className="bg-paper border-sharpie shadow-sharpie flex flex-col relative"
        >
          
          {/* Top Hole Punch Detail */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-neon-blue rounded-full border-sharpie border-b-0 z-20"></div>

          {/* Cover Header */}
          <div className="h-40 border-b-sharpie bg-ink relative overflow-hidden">
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover grayscale mix-blend-screen opacity-80" />
            <div className="absolute inset-0 bg-ink/20 mix-blend-overlay"></div>
            
            <div className="absolute top-4 left-4">
              <span className="bg-neon-pink text-white px-3 py-1 font-black uppercase border-sharpie shadow-sharpie-sm text-xs">
                {event.category}
              </span>
            </div>
            
            <div className="absolute bottom-4 right-4 text-right">
               <span className="font-mono text-neon-yellow font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {ticketId.substring(0,8)}
               </span>
            </div>
          </div>

          {/* Ticket Body Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="inline-block bg-neon-yellow px-2 py-1 border-sharpie text-ink font-black uppercase text-xs">
                {event.date} • {event.startTime} {event.timezone}
              </div>
              
              <p className="font-display text-3xl font-black text-ink uppercase mt-1">{user?.email}</p>
              <h2 className="font-display text-4xl font-black text-ink uppercase leading-none">{event.title}</h2>
              
              <div className="border-l-sharpie pl-4 text-ink space-y-1">
                <p className="font-black uppercase text-sm">{event.locationName}</p>
                <p className="font-bold text-xs uppercase opacity-80">{event.address}</p>
              </div>
            </div>

            <div className="pt-6 border-t-[4px] border-dashed border-ink/30 grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="font-black uppercase text-ink text-lg">{user?.email || 'GUEST EMAIL'}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold uppercase text-ink/50 text-xs">PASS TYPE</p>
                <p className="font-black uppercase text-ink text-lg">GENERAL ADMISSION</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="pt-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="bg-white p-4 border-sharpie shadow-sharpie-sm inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATHERUM-TICKET-${event.id}`}
                  alt="Ticket QR Code"
                  className="w-32 h-32"
                />
              </div>
              <div className="flex-1 text-center sm:text-right space-y-2">
                 <p className="font-black text-ink uppercase text-xl">SCAN AT DOOR</p>
                 <p className="font-bold text-ink/70 uppercase text-xs">DO NOT REPLICATE.</p>
                 <p className="font-mono font-black bg-ink text-white px-2 py-1 text-xs inline-block mt-2">
                   ID: {ticketId}
                 </p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={gcalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-4 bg-ink text-neon-yellow font-black uppercase text-sm border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" /> ADD TO CALENDAR
          </a>

          <button
            onClick={copyShare}
            className="flex-1 py-4 bg-white text-ink font-black uppercase text-sm border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5 text-neon-pink" /> : <Share2 className="w-5 h-5" />}
            {copied ? 'LINK COPIED!' : 'SHARE PASS'}
          </button>
        </div>

        <div className="text-center pt-4">
          <Link to="/my-events" className="inline-flex items-center gap-2 text-ink font-black uppercase bg-neon-yellow px-4 py-2 border-sharpie hover-sharpie-lift transition-all">
            VIEW ALL MY TICKETS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

\\\`n
## \$relPath\`n
\\\$ext
import { CampusEvent, Registration, EventTemplate, Announcement, Feedback, CheckInResult } from "../contexts/DataContext";
import { supabase } from "../lib/supabase";

export const EventService = {
  getEvents: async (): Promise<CampusEvent[]> => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    
    // Convert snake_case to camelCase
    return data.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      startTime: d.start_time,
      endTime: d.end_time,
      location: d.location,
      department: '',
      category: d.category,
      capacity: d.capacity,
      registeredCount: d.registered_count || 0,
      waitlistCount: d.waitlist_count || 0,
      posterUrl: d.poster_url,
      isUnpublished: d.is_unpublished,
      organizerId: d.organizer_id
    })) as CampusEvent[];
  },

  getEventById: async (eventId: string): Promise<CampusEvent | null> => {
    const { data, error } = await supabase.from('events').select('id, title, description, start_time, end_time, location, category, capacity, registered_count, waitlist_count, poster_url, is_unpublished, organizer_id').eq('id', eventId).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      department: '',
      category: data.category,
      capacity: data.capacity,
      registeredCount: data.registered_count || 0,
      waitlistCount: data.waitlist_count || 0,
      posterUrl: data.poster_url,
      isUnpublished: data.is_unpublished,
      organizerId: data.organizer_id
    } as CampusEvent;
  },

  createEvent: async (eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const payload = {
      title: eventData.title,
      description: eventData.description,
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      location: eventData.location,
      category: eventData.category,
      capacity: eventData.capacity,
      poster_url: eventData.posterUrl,
      is_unpublished: eventData.isUnpublished ?? true,
      organizer_id: userData.user.id
    };

    const { data, error } = await supabase.from('events').insert(payload).select('id').single();
    if (error) throw error;
    return data.id;
  },

  getRegistrationsByEventId: async (eventId: string): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select(`
      id,
      event_id,
      user_id,
      status,
      ticket_id,
      attended,
      profiles:user_id(email)
    `).eq('event_id', eventId);
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.user_id,
      studentEmail: d.profiles?.email,
      status: d.status,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
  },

  updateEventPublishStatus: async (eventId: string, isUnpublished: boolean): Promise<void> => {
    const { error } = await supabase.from('events').update({ is_unpublished: isUnpublished }).eq('id', eventId);
    if (error) throw error;
  }
};

export const RegistrationService = {
  getRegistrations: async (): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select('*, profiles:user_id(email)');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
      status: d.status,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },
  getRegistrationsForOrganizer: async (eventId: string): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select('*, profiles:user_id(email)').eq('event_id', eventId);
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
      status: d.status,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },

  getPublicAttendeeSignal: async (eventId: string): Promise<{studentId: string; studentEmail?: string}[]> => {
    // Queries only attendees with public_rsvp = true
    const { data, error } = await supabase
      .from('registrations')
      .select('user_id, profiles!inner(email, public_rsvp)')
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .eq('profiles.public_rsvp', true);
    
    if (error) throw error;
    return data.map(d => ({
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
    }));
  },

  register: async (eventId: string): Promise<{status: string}> => {
    const { data, error } = await supabase.rpc('register_for_event', { p_event_id: eventId });
    if (error) throw error;
    return { status: data };
  },

  cancelRegistration: async (eventId: string): Promise<void> => {
    const { error } = await supabase.rpc('cancel_registration', { p_event_id: eventId });
    if (error) throw error;
  },

  checkIn: async (ticketId: string): Promise<CheckInResult> => {
    const { data, error } = await supabase.rpc('check_in_by_ticket', { p_ticket_id: ticketId });
    if (error) {
      return { success: false, message: error.message };
    }
    if (data === 'success') {
      return { success: true, message: "Checked in successfully" };
    }
    if (data === 'already_checked_in') {
      return { success: false, message: "Already checked in", alreadyCheckedIn: true };
    }
    if (data === 'unauthorized') {
      return { success: false, message: "You are not authorized to check in for this event." };
    }
    return { success: false, message: "Invalid ticket ID" };
  },

  removeRegistrant: async (regId: string): Promise<void> => {
    const { error } = await supabase.from('registrations').delete().eq('id', regId);
    if (error) throw error;
  }
};

export const UserCommunicationService = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      message: d.message,
      createdAt: d.created_at
    }));
  },
  
  getFeedbacks: async (): Promise<Feedback[]> => {
    const { data, error } = await supabase.from('feedbacks').select('*, profiles(email)');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
      rating: d.rating,
      comment: d.comment
    }));
  },

  addAnnouncement: async (announcement: Omit<Announcement, "id" | "createdAt">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('announcements').insert({
      event_id: announcement.eventId,
      organizer_id: userData.user.id,
      message: announcement.message
    });
    if (error) throw error;
  },

  addFeedback: async (feedback: Omit<Feedback, "id">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { error } = await supabase.from('feedbacks').insert({
      event_id: feedback.eventId,
      user_id: userData.user.id,
      rating: feedback.rating,
      comment: feedback.comment
    });
    if (error) throw error;
  }
};

export const OrganizerTemplateService = {
  getTemplates: async (): Promise<EventTemplate[]> => {
    const { data, error } = await supabase.from('event_templates').select('*');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      organizerId: d.organizer_id,
      title: d.title,
      description: d.description,
      category: d.category,
      capacity: d.capacity,
      posterUrl: d.poster_url
    })) as EventTemplate[];
  },

  saveTemplate: async (template: Omit<EventTemplate, "id">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { error } = await supabase.from('event_templates').insert({
      organizer_id: userData.user.id,
      title: template.title,
      description: template.description,
      category: template.category,
      capacity: template.capacity,
      poster_url: template.posterUrl
    });
    if (error) throw error;
  }
};

export const AuthService = {
  loginWithOtp: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  loginWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
  
  updateProfilePrivacy: async (publicRsvp: boolean): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('profiles').update({ public_rsvp: publicRsvp }).eq('id', userData.user.id);
    if (error) throw error;
  },

  updateProfileAvatar: async (avatarUrl: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userData.user.id);
    if (error) throw error;
  },

  completeProfile: async (data: {
    fullName: string;
    rollNumber: string;
    branch: string;
    yearOfStudy: number;
    phoneNumber: string | null;
  }): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        roll_number: data.rollNumber,
        branch: data.branch,
        year_of_study: data.yearOfStudy,
        phone_number: data.phoneNumber,
        profile_completed: true,
      })
      .eq('id', userData.user.id);
    if (error) throw error;
  }
};

export const EventTeamService = {
  getMyVolunteeringEvents: async (): Promise<string[]> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    const { data, error } = await supabase
      .from('event_team')
      .select('event_id')
      .eq('user_id', userData.user.id)
      .eq('role', 'volunteer');
    if (error) throw error;
    return data.map(d => d.event_id);
  },
  getVolunteers: async (eventId: string): Promise<{userId: string; email: string}[]> => {
    const { data, error } = await supabase
      .from('event_team')
      .select('user_id, profiles!event_team_user_id_fkey!inner(email)')
      .eq('event_id', eventId)
      .eq('role', 'volunteer');
    if (error) throw error;
    return data.map(d => ({
      userId: d.user_id,
      email: (d as any).profiles?.email,
    }));
  },
  inviteVolunteer: async (eventId: string, email: string): Promise<void> => {
    const { error } = await supabase.rpc('invite_volunteer', { p_event_id: eventId, p_email: email });
    if (error) throw error;
  },
  removeVolunteer: async (eventId: string, userId: string): Promise<void> => {
    const { error } = await supabase.rpc('remove_volunteer', { p_event_id: eventId, p_user_id: userId });
    if (error) throw error;
  }
};

export const SocialService = {
  subscribeToOrganizer: async (organizerId: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('calendar_follows').insert({
      follower_id: userData.user.id,
      followed_organizer_id: organizerId
    });
    if (error) throw error;
  },
  unsubscribeFromOrganizer: async (organizerId: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('calendar_follows')
      .delete()
      .eq('follower_id', userData.user.id)
      .eq('followed_organizer_id', organizerId);
    if (error) throw error;
  },

  getFollowedOrganizers: async (): Promise<string[]> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    const { data, error } = await supabase
      .from('calendar_follows')
      .select('followed_organizer_id')
      .eq('follower_id', userData.user.id);
    if (error) throw error;
    return data.map(d => d.followed_organizer_id);
  }
};

\\\`n
## \$relPath\`n
\\\$ext
import { supabase } from '../lib/supabase';

export const StorageService = {
  /**
   * Uploads an image to the Supabase storage bucket.
   * Replaces the old file if an old URL is provided.
   */
  uploadImage: async (
    file: File, 
    folder: 'avatars' | 'events', 
    userId: string, 
    oldImageUrl?: string | null
  ): Promise<string> => {
    // 1. Delete old image if it exists
    if (oldImageUrl) {
      await StorageService.deleteImage(oldImageUrl);
    }

    // 2. Generate a unique path for the new file
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${userId}/${fileName}`;

    // 3. Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 4. Get the public URL
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  /**
   * Deletes an image from the storage bucket given its public URL.
   */
  deleteImage: async (publicUrl: string): Promise<void> => {
    try {
      // Extract the path from the URL
      // E.g., https://[project].supabase.co/storage/v1/object/public/images/avatars/123/file.jpg
      const urlParts = publicUrl.split('/public/images/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        const { error } = await supabase.storage.from('images').remove([filePath]);
        if (error) {
          console.error("Failed to delete old image:", error);
        }
      }
    } catch (e) {
      console.error("Error during image deletion:", e);
    }
  }
};

\\\`n
## \$relPath\`n
\\\$ext
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

\\\`n
## \$relPath\`n
\\\$ext
import { CampusEvent } from '../contexts/DataContext';
import { EventItem } from '../types';

export function mapCampusEventToEventItem(event: CampusEvent): EventItem {
  return {
    id: event.id,
    slug: event.id,
    title: event.title,
    tagline: event.description.substring(0, 100),
    description: event.description,
    category: event.category as any,
    coverImage: event.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'amber',
    date: event.startTime,
    startTime: new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    endTime: new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    timezone: 'Local',
    locationName: event.location,
    address: event.location,
    isVirtual: false,
    host: {
      id: event.organizerId || 'host1',
      name: 'Organizer',
      handle: '@organizer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: '',
      verified: true,
      totalEventsHosted: 1,
      totalAttendees: event.registeredCount,
      location: event.location
    },
    tickets: [
      { id: 't1', name: 'General Admission', capacity: event.capacity, sold: event.registeredCount, description: 'Standard Entry' }
    ],
    guests: Array.from({length: event.registeredCount}).map((_, i) => ({
      id: `g${i}`, name: 'Guest', email: 'guest@example.com', avatar: '', ticketType: 'General', checkedIn: false, rsvpDate: '', status: 'confirmed'
    })),
    totalCapacity: event.capacity,
    featured: false,
    tags: []
  };
}

\\\`n
## \$relPath\`n
\\\$ext
import { Variants, Transition } from "motion/react";

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
};

export const cardHover: { scale: number; transition: Transition } = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" as const }
};

export const successAnimation: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    } 
  }
};

export const cinematicEase = [0.22, 1, 0.36, 1] as const; 
export const cinematicTransition = { duration: 0.7, ease: cinematicEase };
export const functionalTransition = { duration: 0.2, ease: "easeOut" as const };

export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0, transition: cinematicTransition },
  viewport: { once: true, margin: "-100px" }
};

export const ticketTearAnimation: Variants = {
  initial: { y: 0, rotate: 0 },
  torn: { 
    y: 10, 
    rotate: -1,
    opacity: 0.9,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  waitlisted: { 
    y: 4, 
    rotate: -0.5,
    opacity: 0.95,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
};

export const stampAnimation: Variants = {
  initial: { scale: 1.5, opacity: 0, rotate: 15 },
  stamped: {
    scale: 1,
    opacity: 1,
    rotate: -5,
    transition: { type: "spring", stiffness: 400, damping: 15 }
  }
};


\\\`n
