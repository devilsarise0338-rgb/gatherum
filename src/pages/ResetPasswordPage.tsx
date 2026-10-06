import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PASSWORD_RE, passwordChecklist } from '../lib/auth';
import { Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

// Public password-reset page (linked from reset emails via /auth/reset).
// Supabase emits PASSWORD_RECOVERY when the link's session is established.
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(event => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // Link may already be established (e.g. after reload with stored session).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!PASSWORD_RE.test(password)) {
      toast.error('Password needs 8+ characters with upper, lower case and a number.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Password updated. Signed in!');
      navigate('/', { replace: true });
    }
  }

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🔑</div>
        <h2 style={{ fontWeight: 700 }}>This link is invalid or expired</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)' }}>
          Request a fresh reset link from the sign-in page.
        </p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth', { replace: true })}>
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card resp-card-pad" style={{ width: 'min(100%, 420px)' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Set a new password</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: '1.25rem' }}>
          Choose something strong — 8+ characters with upper, lower case and a number.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="reset-password">New password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
              <input
                id="reset-password"
                className="input"
                type="password"
                style={{ paddingLeft: '2.25rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {passwordChecklist(password).map(c => (
                <div key={c.label} style={{ fontSize: '0.75rem', color: c.ok ? '#22C55E' : 'var(--ink-muted)' }}>
                  {c.ok ? '✓' : '○'} {c.label}
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="reset-confirm">Confirm password</label>
            <input
              id="reset-confirm"
              className="input"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
