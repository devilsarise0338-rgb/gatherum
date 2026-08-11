import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, AuthError } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { cinematicTransition } from "../utils/motion";

// ─── Error messages ───────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<AuthError, string> = {
  invalid_email: "Please enter a valid email address.",
  domain_restricted: "Sign-ups are restricted to your university email domain.",
  signups_disabled: "New sign-ups are temporarily disabled. Please try again later.",
  user_banned: "Your account has been suspended. Contact support.",
  unknown: "Something went wrong. Please try again.",
};

// ─── Google Icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

// ─── Decorative background blobs ─────────────────────────────────────────────
function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg-light">
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Screen = "choose" | "magic_link" | "magic_sent";

export default function LoginPage() {
  const [screen, setScreen] = useState<Screen>("choose");
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading]   = useState(false);

  const { login, loginWithGoogle, user, authError, clearAuthError, settings } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Handle OAuth callback errors in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error_description");
    if (urlError) {
      setError("Sign-in failed: " + decodeURIComponent(urlError.replace(/\+/g, " ")));
      // Clean the URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location.search]);

  // Auth context-level errors (e.g. banned user)
  useEffect(() => {
    if (authError) {
      setError(ERROR_MESSAGES[authError]);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  // Redirect when logged in
  useEffect(() => {
    if (user) {
      if (!user.profileCompleted) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setError(ERROR_MESSAGES[result.error]);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects — no need to setLoading(false)
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMagicLoading(true);
    const result = await login(email);
    setMagicLoading(false);
    if (result.success) {
      setScreen("magic_sent");
    } else if (result.error) {
      setError(ERROR_MESSAGES[result.error]);
    }
  };

  const domainHint = settings?.allowedEmailDomain
    ? `Use your ${settings.allowedEmailDomain} email`
    : "Enter your email address";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Background />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cinematicTransition}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-primary/20 mb-4 border border-gray-100"
          >
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </motion.div>
          <h1 className="text-[var(--text-display-medium)] leading-[var(--text-display-medium--line-height)] tracking-[var(--text-display-medium--letter-spacing)] font-[var(--text-display-medium--font-weight)] text-gray-900">Gatherum</h1>
          <p className="text-[var(--text-body-relaxed)] text-gray-500 mt-1">Your campus event hub</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
          <AnimatePresence mode="wait">

            {/* ── CHOOSE screen ─────────────────────────── */}
            {screen === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-6">Sign in to manage your campus life.</p>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Button */}
                <motion.button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-sm group"
                >
                  {googleLoading ? <Spinner /> : <GoogleIcon />}
                  <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center mb-4">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-4 text-gray-400 text-xs uppercase tracking-widest font-medium">or</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>

                {/* Magic Link CTA */}
                <motion.button
                  id="magic-link-btn"
                  onClick={() => { setError(null); setScreen("magic_link"); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors duration-200 shadow-md shadow-primary/20"
                >
                  Sign in with Email Link
                </motion.button>

                <p className="text-center text-gray-500 text-sm mt-6 font-medium">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary-hover font-bold transition-colors">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── MAGIC LINK form ───────────────────────── */}
            {screen === "magic_link" && (
              <motion.div
                key="magic_link"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => { setError(null); setScreen("choose"); }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-medium text-sm mb-6 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in with email</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We'll send a magic link to your inbox — no password needed.
                </p>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="ml-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={domainHint}
                      required
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                    {settings?.allowedEmailDomain && (
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Only <span className="text-primary">{settings.allowedEmailDomain}</span> addresses are allowed.
                      </p>
                    )}
                  </div>

                  <motion.button
                    id="send-magic-link-btn"
                    type="submit"
                    disabled={magicLoading || !email.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 transition-colors duration-200 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {magicLoading && <Spinner />}
                    {magicLoading ? "Sending…" : "Send Magic Link"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── MAGIC SENT confirmation ───────────────── */}
            {screen === "magic_sent" && (
              <motion.div
                key="magic_sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox!</h2>
                <p className="text-gray-500 text-sm mb-1">
                  We sent a magic link to
                </p>
                <p className="text-primary font-semibold text-sm mb-6">{email}</p>
                <p className="text-gray-500 text-xs">
                  Click the link in the email to sign in. It expires in 1 hour.
                </p>
                <button
                  onClick={() => { setScreen("magic_link"); setError(null); }}
                  className="mt-6 text-sm text-gray-500 font-medium hover:text-primary underline-offset-2 hover:underline transition-colors"
                >
                  Use a different email
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
