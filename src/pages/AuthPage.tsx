import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  safeRedirect,
  normalizeEmail,
  PASSWORD_RE,
  passwordChecklist,
  getSignupOutcome,
  mapAuthError,
  domainHint,
  POST_LOGIN_PATH_KEY,
} from '../lib/auth';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

type Mode = 'signin' | 'signup';
const RESEND_COOLDOWN_S = 30;

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ?? '@poornima.org';
  const from = safeRedirect((location.state as { from?: unknown } | null)?.from);

  // OAuth errors land here from /auth/callback (shown once, then cleared).
  const [callbackError, setCallbackError] = useState<string | null>(null);
  useEffect(() => {
    const err = (location.state as { authError?: unknown } | null)?.authError;
    if (typeof err === 'string' && err) {
      setCallbackError(err);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resend/forgot cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInlineError(null);
    setLoading(true);

    const cleanEmail = normalizeEmail(email);
    // Domain is enforced on sign-up only (client UX + DB trigger).
    // Sign-in has no domain check: existing users must never be locked out
    // if the allowed domain ever changes.
    if (mode === 'signup' && !cleanEmail.endsWith(allowedDomain.toLowerCase())) {
      setInlineError(`Only ${allowedDomain} emails can sign up.`);
      setLoading(false);
      return;
    }
    if (mode === 'signup' && !PASSWORD_RE.test(password)) {
      setInlineError('Password needs 8+ characters with upper, lower case and a number.');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setInlineError(mapAuthError(error.message, allowedDomain));
      } else {
        const outcome = getSignupOutcome(data);
        if (outcome.kind === 'signed-in') {
          navigate(from, { replace: true });
        } else if (outcome.kind === 'already-registered') {
          setEmail(cleanEmail);
          setMode('signin');
          setInlineError('An account with this email already exists. Try signing in.');
        } else {
          setEmail(cleanEmail);
          setSent(true);
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (error) setInlineError(mapAuthError(error.message, allowedDomain));
      else navigate(from, { replace: true });
    }
    setLoading(false);
  }

  async function handleResend() {
    if (cooldown > 0) return;
    const { error } = await supabase.auth.resend({ type: 'signup', email: normalizeEmail(email) });
    if (error) toast.error(mapAuthError(error.message, allowedDomain));
    else {
      toast.success('Confirmation email resent.');
      setCooldown(RESEND_COOLDOWN_S);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    // Neutral either way: never reveal whether the email has an account.
    if (error) toast.error(mapAuthError(error.message, allowedDomain));
    else {
      toast.success("If an account exists for that email, we've sent a reset link.");
      setCooldown(RESEND_COOLDOWN_S);
      setShowForgot(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    sessionStorage.setItem(POST_LOGIN_PATH_KEY, from);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // `hd` only hints Google which account picker to show;
        // the DB trigger enforces the domain for real.
        queryParams: { hd: domainHint(allowedDomain), prompt: 'select_account' },
      },
    });
    if (error) {
      console.error('Google sign-in failed:', error);
      toast.error("Google sign-in isn't available right now. Please use email.");
      setGoogleLoading(false);
      sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
    }
    // On success the browser leaves for Google; loading state stays until then.
  }

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card resp-card-pad" style={{ width: 'min(100%, 420px)', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📬</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Check Your Inbox</h2>
          <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
            We sent a confirmation email to <strong>{email}</strong>. Click the link to activate your account.
          </p>
          <button
            className="btn btn-ghost"
            style={{ width: '100%', marginBottom: '0.75rem' }}
            onClick={handleResend}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Resend email (${cooldown}s)` : 'Resend email'}
          </button>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSent(false); setMode('signin'); }}>
            Go to Sign In
          </button>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSent(false)}>Wrong email?</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--off-white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      {/* Background decor */}
      <div className="hide-on-mobile" style={{
        position: 'fixed', top: 0, right: 0, width: '40%', height: '100vh',
        background: 'var(--red)', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
        opacity: 0.07, pointerEvents: 'none',
      }} />
      <div className="hide-on-mobile" style={{
        position: 'fixed', bottom: '-10%', left: '-5%', width: 300, height: 300,
        background: 'var(--yellow)', borderRadius: '50%', opacity: 0.15,
        pointerEvents: 'none', border: '2px solid var(--border)',
      }} />

      <div style={{ width: 'min(100%, 420px)', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700,
            color: 'var(--red)', marginBottom: '0.25rem',
          }}>
            Gatherum
          </div>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
            {mode === 'signin' ? 'Welcome back! Sign in to continue.' : 'Join your campus community.'}
          </p>
        </div>

        {/* Card */}
        <div className="card resp-card-pad">
          {/* Tabs */}
          <div className="tabs" role="tablist" aria-label="Sign in or sign up">
            <button
              role="tab"
              aria-selected={mode === 'signin'}
              className={`tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => { setMode('signin'); setShowForgot(false); setInlineError(null); }}
            >
              Sign In
            </button>
            <button
              role="tab"
              aria-selected={mode === 'signup'}
              className={`tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setShowForgot(false); setInlineError(null); }}
            >
              Sign Up
            </button>
          </div>

          {callbackError && (
            <div role="alert" className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {callbackError}
            </div>
          )}

          {showForgot ? (
            <form onSubmit={handleForgot}>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
                Enter your account email and we'll send a reset link.
              </p>
              <div className="form-group">
                <label className="label" htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  className="input"
                  type="email"
                  placeholder={`your.name${allowedDomain}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={loading || cooldown > 0}>
                {cooldown > 0 ? `Send reset link (${cooldown}s)` : 'Send reset link'}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setShowForgot(false)}>
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="label" htmlFor="auth-email">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                  <input
                    id="auth-email"
                    className="input"
                    type="email"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder={`your.name${allowedDomain}`}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {mode === 'signup' && (
                  <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                    Only {allowedDomain} emails can sign up.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="label" htmlFor="auth-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
                  <input
                    id="auth-password"
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    placeholder={mode === 'signin' ? 'Enter your password' : 'Create a password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    aria-pressed={showPass}
                    style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
                    onClick={() => setShowPass(p => !p)}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {passwordChecklist(password).map(c => (
                      <div key={c.label} style={{ fontSize: '0.75rem', color: c.ok ? '#22C55E' : 'var(--ink-muted)' }}>
                        {c.ok ? '✓' : '○'} {c.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {inlineError && (
                <div role="alert" className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  {inlineError}
                  {inlineError === 'Please confirm your email first.' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={handleResend} disabled={cooldown > 0}>
                        {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend confirmation'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.875rem' }}
                disabled={loading}
              >
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> {mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
                  : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>

              {mode === 'signin' && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  onClick={() => { setShowForgot(true); setInlineError(null); }}
                >
                  Forgot password?
                </button>
              )}
            </form>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Or continue with</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', padding: '0.875rem', border: '2px solid var(--border)' }}
            onClick={handleGoogle}
            disabled={googleLoading}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? 'Connecting...' : mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
          {mode === 'signin'
            ? <>Don't have an account?{' '}<button className="btn btn-ghost btn-sm" onClick={() => { setMode('signup'); setInlineError(null); }}>Sign Up</button></>
            : <>Already have an account?{' '}<button className="btn btn-ghost btn-sm" onClick={() => { setMode('signin'); setInlineError(null); }}>Sign In</button></>
          }
        </p>
      </div>
    </div>
  );
}
