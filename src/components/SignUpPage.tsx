import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, AuthError } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

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

export default function SignUpPage() {
  const [screen, setScreen] = useState<Screen>("choose");
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading]   = useState(false);

  const { login, loginWithGoogle, user, authError, clearAuthError, settings } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error_description");
    if (urlError) {
      setError("Sign-up failed: " + decodeURIComponent(urlError.replace(/\+/g, " ")));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location.search]);

  useEffect(() => {
    if (authError) {
      setError(ERROR_MESSAGES[authError]);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  useEffect(() => {
    if (user) {
      if (!user.profileCompleted) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setError(ERROR_MESSAGES[result.error]);
      setGoogleLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
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

  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-3xl shadow-xl relative overflow-hidden"
        >
          {/* Subtle top glare */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Join Gatherum
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Create your account to discover and register for campus events.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {screen === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? <Spinner /> : <GoogleIcon />}
                  Sign up with Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white/80 px-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Or</span></div>
                </div>

                <button
                  onClick={() => { setError(null); setScreen("magic_link"); }}
                  className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-sm"
                >
                  Sign up with Magic Link
                </button>
              </motion.div>
            )}

            {screen === "magic_link" && (
              <motion.form
                key="magic_link"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleMagicLinkSubmit}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                  </div>
                )}
                
                {settings?.allowedEmailDomain && (
                  <div className="text-xs font-bold text-gray-500 mb-2 px-1">
                    Use your <span className="text-primary">{settings.allowedEmailDomain}</span> email
                  </div>
                )}
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student${settings?.allowedEmailDomain ? settings.allowedEmailDomain : '@college.edu'}`}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 font-medium"
                  required
                />
                
                <button
                  type="submit"
                  disabled={magicLoading || !email.trim()}
                  className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {magicLoading ? <Spinner /> : "Send Magic Link"}
                </button>

                <button
                  type="button"
                  onClick={() => { setError(null); setScreen("choose"); }}
                  className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
              </motion.form>
            )}

            {screen === "magic_sent" && (
              <motion.div
                key="magic_sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  We've sent a magic link to <strong className="text-gray-900">{email}</strong>. Click it to create your account and sign in.
                </p>
                <button
                  onClick={() => setScreen("choose")}
                  className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Try another email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Link back to login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
