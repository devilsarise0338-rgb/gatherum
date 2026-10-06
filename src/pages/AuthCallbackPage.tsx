import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mapOAuthError, safeRedirect, POST_LOGIN_PATH_KEY } from '../lib/auth';

// Handles OAuth + email-confirmation redirects (Supabase lands here).
// No Navbar: RootRoutes hides it on /auth/* paths.
function readParam(search: URLSearchParams, hash: URLSearchParams, key: string): string | null {
  return search.get(key) ?? hash.get(key);
}

export default function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const errCode = readParam(search, hash, 'error_code') ?? readParam(search, hash, 'error');
    const errDesc = readParam(search, hash, 'error_description') ?? '';

    if (errCode) {
      sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
      navigate('/auth', {
        replace: true,
        state: { authError: mapOAuthError(`${errCode} ${errDesc}`) },
      });
      return;
    }

    let done = false;
    const stored = sessionStorage.getItem(POST_LOGIN_PATH_KEY);
    const allowedDomain =
      (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN as string | undefined) ?? '@poornima.org';

    async function finish() {
      // Wait for the session the redirect just established (PKCE code exchange).
      const deadline = Date.now() + 10_000;
      let session = (await supabase.auth.getSession()).data.session;
      while (!session && Date.now() < deadline && !done) {
        await new Promise(r => setTimeout(r, 300));
        session = (await supabase.auth.getSession()).data.session;
      }
      if (done) return;
      if (!session?.user) {
        setTimedOut(true);
        return;
      }
      // Wait for the profile row (created by the signup trigger).
      const profileDeadline = Date.now() + 10_000;
      let profile: { email?: string | null } | null = null;
      while (!profile && Date.now() < profileDeadline && !done) {
        const { data } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', session.user.id)
          .maybeSingle();
        profile = (data as { email?: string | null } | null) ?? null;
        if (!profile) await new Promise(r => setTimeout(r, 500));
      }
      if (done) return;
      // Defense in depth: the DB trigger is the real domain gate, but a
      // non-college OAuth account must never land inside the app.
      const email = (profile?.email ?? session.user.email ?? '').toLowerCase();
      if (!email.endsWith(allowedDomain.toLowerCase())) {
        await supabase.auth.signOut();
        sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
        navigate('/auth', {
          replace: true,
          state: { authError: mapOAuthError('domain_not_allowed') },
        });
        return;
      }
      sessionStorage.removeItem(POST_LOGIN_PATH_KEY);
      navigate(safeRedirect(stored), { replace: true });
    }

    finish();
    return () => {
      done = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '1rem', textAlign: 'center' }}>
      <div className="spinner" />
      <h2 style={{ fontWeight: 700 }}>Signing you in...</h2>
      {timedOut && (
        <>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
            This is taking too long. The link may have expired.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth', { replace: true })}>
            Back to sign in
          </button>
        </>
      )}
    </div>
  );
}
