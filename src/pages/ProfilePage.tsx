import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';
import SafeImage from '../components/SafeImage';
import { User, Save, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mustComplete = (location.state as any)?.mustComplete === true;
  const returnTo = (location.state as any)?.from?.pathname;

  const [form, setForm] = useState({
    full_name: '',
    roll_number: '',
    branch: '',
    year_of_study: '',
    phone_number: '',
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
        public_rsvp: profile.public_rsvp,
      });
    }
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    if (!form.full_name.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    if (!form.roll_number.trim()) {
      toast.error('Roll Number is required.');
      return;
    }
    if (!form.branch.trim()) {
      toast.error('Branch is required.');
      return;
    }
    if (!form.year_of_study) {
      toast.error('Year of Study is required.');
      return;
    }

    setSaving(true);
    const payload: Partial<Profile> = {
      full_name: form.full_name || null,
      roll_number: form.roll_number || null,
      branch: form.branch || null,
      year_of_study: form.year_of_study ? parseInt(form.year_of_study) : null,
      phone_number: form.phone_number || null,
      public_rsvp: form.public_rsvp,
      profile_completed: !!(form.full_name && form.roll_number && form.branch && form.year_of_study),
    };

    const { error } = await supabase.from('profiles').update(payload).eq('id', profile!.id);
    if (error) toast.error(error.message);
    else {
      toast.success('Profile saved!');
      await refreshProfile();
      // If user was redirected here to complete profile, send them back
      if (mustComplete && returnTo) {
        navigate(returnTo, { replace: true });
      } else if (mustComplete) {
        navigate('/', { replace: true });
      }
    }
    setSaving(false);
  }

  if (!profile) return <div className="page-loader"><div className="spinner" /></div>;

  const generatedAvatar = `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.id}`;
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
            <img
              src={generatedAvatar}
              alt="Avatar"
              className="avatar avatar-lg"
              style={{ background: 'var(--white)' }}
            />
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
              <label className="label">Full Name <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="input" placeholder="Rahul Sharma" value={form.full_name} required
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>

            <div className="resp-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="label">Roll Number <span style={{ color: 'var(--red)' }}>*</span></label>
                <input className="input" placeholder="2021BTECH001" value={form.roll_number} required
                  onChange={e => setForm(f => ({ ...f, roll_number: e.target.value }))} />
              </div>
              <div>
                <label className="label">Year of Study <span style={{ color: 'var(--red)' }}>*</span></label>
                <select className="select" value={form.year_of_study} required
                  onChange={e => setForm(f => ({ ...f, year_of_study: e.target.value }))}>
                  <option value="">Select year</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Branch <span style={{ color: 'var(--red)' }}>*</span></label>
              <input className="input" placeholder="Computer Science Engineering" value={form.branch} required
                onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="label">Phone Number</label>
              <input className="input" type="tel" placeholder="+91 9876543210" value={form.phone_number}
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
              {saving ? <Loader2 size={16} /> : <Save size={16} />}
              {isIncomplete ? 'Complete Profile' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
