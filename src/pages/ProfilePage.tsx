import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';
import SafeImage from '../components/SafeImage';
import { User, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    roll_number: '',
    branch: '',
    year_of_study: '',
    phone_number: '',
    avatar_url: '',
    public_rsvp: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        roll_number: profile.roll_number ?? '',
        branch: profile.branch ?? '',
        year_of_study: profile.year_of_study?.toString() ?? '',
        phone_number: profile.phone_number ?? '',
        avatar_url: profile.avatar_url ?? '',
        public_rsvp: profile.public_rsvp,
      });
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Partial<Profile> = {
      full_name: form.full_name || null,
      roll_number: form.roll_number || null,
      branch: form.branch || null,
      year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null,
      phone_number: form.phone_number || null,
      avatar_url: form.avatar_url || null,
      public_rsvp: form.public_rsvp,
      profile_completed: !!(form.full_name && form.roll_number),
    };

    const { error } = await supabase.from('profiles').update(payload).eq('id', profile!.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Profile updated!');
      await refreshProfile();
    }
    setSaving(false);
  }

  if (!profile) return <div className="page-loader"><div className="spinner" /></div>;

  const initials = (profile.full_name ?? profile.email ?? 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {form.avatar_url ? (
              <img
                src={form.avatar_url}
                alt="Avatar"
                className="avatar avatar-lg"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="avatar avatar-lg" style={{ background: 'var(--red)', color: 'var(--white)', fontSize: '1.5rem' }}>
                {initials}
              </div>
            )}
            <div>
              <div className="tag" style={{ background: profile.role === 'admin' ? 'var(--red)' : profile.role === 'organizer' ? 'var(--yellow)' : 'var(--white)', marginBottom: '0.375rem' }}>
                {profile.role}
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{profile.full_name ?? 'Your Profile'}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{profile.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 600 }}>
        <form onSubmit={handleSave}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>Personal Information</h2>

            <div className="form-group">
              <label className="label">Full Name</label>
              <input className="input" placeholder="Rahul Sharma" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label">Roll Number</label>
                <input className="input" placeholder="2021BTECH001" value={form.roll_number}
                  onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} />
              </div>
              <div>
                <label className="label">Year of Study</label>
                <select className="select" value={form.year_of_study}
                  onChange={e => setForm(f => ({ ...f, year_of_study: e.target.value }))}>
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Branch</label>
              <input className="input" placeholder="Computer Science Engineering" value={form.branch}
                onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="label">Phone Number</label>
              <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone_number}
                onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="label">Avatar URL</label>
              <input className="input" placeholder="https://…/avatar.jpg" value={form.avatar_url}
                onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} />
              {form.avatar_url && (
                <img src={form.avatar_url} alt="Avatar preview" className="avatar avatar-md"
                  style={{ marginTop: '0.75rem' }}
                  onError={e => (e.currentTarget.style.display = 'none')} />
              )}
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
              {saving ? <Loader2 size={16} /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
