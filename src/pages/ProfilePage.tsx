import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';
import { safeRedirect } from '../lib/auth';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BRANCHES = [
  'Computer Science',
  'Electronics & Communication',
  'Electrical',
  'Mechanical',
  'Civil',
  'Information Technology',
  'Other',
];

// Optional phone: 10-digit Indian mobile, optional +91 prefix/spacing.
function validPhone(v: string): boolean {
  if (!v.trim()) return true;
  return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/[\s-]/g, ''));
}

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mustComplete = (location.state as any)?.mustComplete === true;
  // Accepts the string paths new callers send, or the location objects
  // older guards send; always lands back with search + hash intact.
  const returnTo = safeRedirect((location.state as any)?.from ?? '/');

  // Google metadata, used ONLY to prefill/display until the user submits.
  const meta = (user?.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
  const metaName = meta.full_name ?? meta.name ?? '';

  const [form, setForm] = useState({
    full_name: '',
    roll_number: '',
    branch: '',
    year_of_study: '',
    phone_number: '',
    public_rsvp: false,
  });
  const [saving, setSaving] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? metaName,
        roll_number: profile.roll_number ?? '',
        branch: profile.branch ?? '',
        year_of_study: profile.year_of_study?.toString() ?? '',
        phone_number: profile.phone_number ?? '',
        public_rsvp: profile.public_rsvp,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    const fullName = form.full_name.trim();
    const roll = form.roll_number.trim().toUpperCase();
    const branch = form.branch.trim();
    const phone = form.phone_number.trim();

    if (!fullName) {
      toast.error('Full Name is required.');
      return;
    }
    if (!roll) {
      toast.error('Roll Number is required.');
      return;
    }
    if (!branch) {
      toast.error('Branch is required.');
      return;
    }
    if (!form.year_of_study) {
      toast.error('Year of Study is required.');
      return;
    }
    if (!validPhone(phone)) {
      toast.error('Enter a valid 10-digit mobile number (optional +91).');
      return;
    }

    setSaving(true);
    const payload: Partial<Profile> = {
      full_name: fullName,
      roll_number: roll,
      branch,
      year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null,
      phone_number: phone || null,
      public_rsvp: form.public_rsvp,
      profile_completed: true,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', profile!.id)
      .select('id');
    if (error) {
      toast.error(
        (error as { code?: string }).code === '23505'
          ? 'This roll number is already in use.'
          : error.message
      );
    } else if (!data || data.length === 0) {
      toast.error('Save failed: profile not found or not authorized.');
    } else {
      toast.success('Profile saved!');
      await refreshProfile();
      if (mustComplete) navigate(returnTo, { replace: true });
    }
    setSaving(false);
  }

  if (!profile) return <div className="page-loader"><div className="spinner" /></div>;

  const avatarSrc = !avatarBroken ? profile.avatar_url || meta.avatar_url || meta.picture || null : null;
  const initial = (form.full_name || profile.email || '?').trim().charAt(0).toUpperCase();
  const isIncomplete = !profile.profile_completed;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Incomplete Profile Banner */}
      {isIncomplete && (
        <div style={{
          background: 'var(--red)', color: 'var(--white)', padding: '0.875rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
          fontWeight: 700, fontSize: '0.9375rem',
        }}>
          <AlertTriangle size={18} />
          Please complete your profile to continue using Gatherum.
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="avatar avatar-lg"
                style={{ background: 'var(--white)' }}
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <div
                className="avatar avatar-lg"
                aria-hidden
                style={{ background: 'var(--yellow)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}
              >
                {initial}
              </div>
            )}
            <div>
              <div className="tag" style={{ background: profile.role === 'admin' ? 'var(--red)' : profile.role === 'organizer' ? 'var(--yellow)' : 'var(--white)', marginBottom: '0.375rem' }}>
                {profile.role}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{profile.full_name ?? 'Complete Your Profile'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{profile.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 600 }}>
        <form onSubmit={handleSave}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>
              {isIncomplete ? '👋 Welcome! Fill in your details' : 'Personal Information'}
            </h2>

            <div className="form-group">
              <label className="label" htmlFor="profile-name">Full Name <span style={{ color: 'var(--red)' }}>*</span></label>
              <input id="profile-name" className="input" placeholder="Rahul Sharma" value={form.full_name} required
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>

            <div className="resp-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label" htmlFor="profile-roll">Roll Number <span style={{ color: 'var(--red)' }}>*</span></label>
                <input id="profile-roll" className="input" placeholder="2021BTECH001" value={form.roll_number} required
                  onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} />
              </div>
              <div>
                <label className="label" htmlFor="profile-year">Year of Study <span style={{ color: 'var(--red)' }}>*</span></label>
                <select id="profile-year" className="select" value={form.year_of_study} required
                  onChange={e => setForm(f => ({ ...f, year_of_study: e.target.value }))}>
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="profile-branch">Branch <span style={{ color: 'var(--red)' }}>*</span></label>
              <select
                id="profile-branch"
                className="select"
                value={BRANCHES.includes(form.branch) ? form.branch : form.branch ? '__custom' : ''}
                required
                onChange={e => {
                  const v = e.target.value;
                  if (v !== '__custom') setForm(f => ({ ...f, branch: v }));
                }}
              >
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                {form.branch && !BRANCHES.includes(form.branch) && (
                  <option value="__custom">{form.branch} (current)</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="profile-phone">Phone Number</label>
              <input id="profile-phone" className="input" type="tel" placeholder="+91 9876543210" value={form.phone_number}
                onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.875rem', background: 'var(--off-white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <input id="rsvp" type="checkbox" checked={form.public_rsvp}
                onChange={e => setForm(f => ({ ...f, public_rsvp: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <label htmlFor="rsvp" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}>
                Show my RSVP publicly on events
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
              {isIncomplete ? 'Complete Profile' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
