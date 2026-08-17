import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ?? '@poornima.org';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (mode === 'signup') {
      if (!email.endsWith(allowedDomain)) {
        toast.error(`Only ${allowedDomain} emails are allowed.`);
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) toast.error(error.message);
      else { setSent(true); toast.success('Check your email to confirm your account!'); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else navigate('/');
    }
    setLoading(false);
  }

  if (sent) return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '2.5rem', maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📬</div>
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '0.5rem' }}>Check Your Inbox</h2>
        <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
          We sent a confirmation email to <strong>{email}</strong>. Click the link to activate your account.
        </p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { setSent(false); setMode('signin'); }}>
          Go to Sign In
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--off-white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Background decor */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '40%', height: '100vh',
        background: 'var(--red)', clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
        opacity: 0.07, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', left: '-5%', width: 300, height: 300,
        background: 'var(--yellow)', borderRadius: '50%', opacity: 0.15,
        pointerEvents: 'none', border: '2px solid var(--border)',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
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
        <div className="card" style={{ padding: '2rem' }}>
          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => setMode('signin')}>Sign In</button>
            <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
          </div>

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
                  autoComplete="email"
                />
              </div>
              {mode === 'signup' && (
                <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                  Only {allowedDomain} emails allowed.
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
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
                  onClick={() => setShowPass(p => !p)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Or continue with</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ width: '100%', padding: '0.875rem', border: '2px solid var(--border)' }}
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
              if (error) toast.error(error.message);
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
          {mode === 'signin'
            ? <>Don't have an account?{' '}<button className="btn btn-ghost btn-sm" onClick={() => setMode('signup')}>Sign Up</button></>
            : <>Already have an account?{' '}<button className="btn btn-ghost btn-sm" onClick={() => setMode('signin')}>Sign In</button></>
          }
        </p>
      </div>
    </div>
  );
}
