# PART 3 - Frontend pages (fresh dump, read from disk)

Source: live working tree. Stale dumps (full_code.md, code_dump.md) were NOT reused.

## Table of contents

| File | Lines |
|---|---|
| src/pages/AdminDashboard.tsx | 357 |
| src/pages/ArchivesPage.tsx | 126 |
| src/pages/AuthPage.tsx | 190 |
| src/pages/CheckInPage.tsx | 125 |
| src/pages/EventDetailPage.tsx | 334 |
| src/pages/EventsPage.tsx | 149 |
| src/pages/HomePage.tsx | 824 |
| src/pages/OrganizerDashboard.tsx | 221 |
| src/pages/OrganizerEventWizard.tsx | 290 |
| src/pages/ProfilePage.tsx | 187 |
| src/pages/StudentDashboard.tsx | 215 |

## src/pages/AdminDashboard.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, PlatformSettings, Event } from '../types';
import { Users, Settings, Shield, Loader2, Search, BarChart2, Calendar, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { isEventAutoArchived } from '../lib/utils';
import { Link } from 'react-router-dom';

type AdminTab = 'overview' | 'users' | 'events' | 'settings' | 'audit';

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState({ regs: 0 });

  const [settingsForm, setSettingsForm] = useState({
    signups_enabled: true,
    allowed_email_domain: '@poornima.org',
    maintenance_mode: false,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [usersRes, eventsRes, settingsRes, auditRes, regsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*, registrations(count)').order('created_at', { ascending: false }),
        supabase.from('platform_settings').select('*').eq('id', 1).single(),
        supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('registrations').select('*', { count: 'exact', head: true })
      ]);

      if (usersRes.data) setUsers(usersRes.data as Profile[]);
      
      if (eventsRes.data) {
        setEvents(eventsRes.data.map((e: any) => ({
          ...e,
          registration_count: e.registrations?.[0]?.count ?? 0
        })));
      }

      if (settingsRes.data) {
        setSettings(settingsRes.data as PlatformSettings);
        setSettingsForm({
          signups_enabled: settingsRes.data.signups_enabled,
          allowed_email_domain: settingsRes.data.allowed_email_domain,
          maintenance_mode: settingsRes.data.maintenance_mode,
        });
      }

      if (auditRes.data) setAuditLog(auditRes.data);
      if (regsRes.count !== null) setStats({ regs: regsRes.count });

      setLoading(false);
    }
    load();
  }, []);

  async function updateRole(userId: string, role: 'student' | 'organizer' | 'admin') {
    const { error } = await supabase.rpc('admin_update_user_role', { p_user_id: userId, p_role: role });
    if (error) toast.error(error.message);
    else {
      toast.success('Role updated!');
      setUsers(us => us.map(u => u.id === userId ? { ...u, role } : u));
    }
  }

  async function toggleBan(userId: string, isBanned: boolean) {
    const res = await supabase.rpc('admin_toggle_user_ban', { p_user_id: userId, p_is_banned: !isBanned });
    if (res.error) toast.error(res.error.message);
    else {
      toast.success(isBanned ? 'User unbanned.' : 'User banned.');
      setUsers(us => us.map(u => u.id === userId ? { ...u, is_banned: !isBanned } : u));
    }
  }

  async function saveSettings() {
    setSavingSettings(true);
    const { error } = await supabase.rpc('admin_update_settings', {
      p_allow_global_signups: settingsForm.signups_enabled,
      p_allowed_email_domain: settingsForm.allowed_email_domain,
      p_maintenance_mode: settingsForm.maintenance_mode,
    });
    if (error) toast.error(error.message);
    else toast.success('Settings saved!');
    setSavingSettings(false);
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event as an admin? This cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Event deleted');
      setEvents(es => es.filter(e => e.id !== id));
    }
  }

  const filteredUsers = users.filter(u =>
    !search ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.roll_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    !search ||
    (e.title ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div className="tag" style={{ background: 'var(--red)', color: 'var(--white)', marginBottom: '0.75rem' }}>Admin</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
            Platform metrics, users, events, and settings
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            <BarChart2 size={14} style={{ display: 'inline', marginRight: 4 }} /> Overview
          </button>
          <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Users ({users.length})
          </button>
          <button className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
            <Calendar size={14} style={{ display: 'inline', marginRight: 4 }} /> Events ({events.length})
          </button>
          <button className={`tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            <Settings size={14} style={{ display: 'inline', marginRight: 4 }} /> Settings
          </button>
          <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>
            <Shield size={14} style={{ display: 'inline', marginRight: 4 }} /> Audit Log
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : tab === 'overview' ? (
          <div className="bento-grid">
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ color: 'var(--ink-muted)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>TOTAL USERS</div>
              <div style={{ fontSize: '3rem', fontWeight: 800 }}>{users.length}</div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--ink-muted)' }}>Students:</span> {users.filter(u => u.role === 'student').length}</div>
                <div><span style={{ color: 'var(--ink-muted)' }}>Organizers:</span> {users.filter(u => u.role === 'organizer').length}</div>
              </div>
            </div>
            
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ color: 'var(--ink-muted)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>TOTAL EVENTS</div>
              <div style={{ fontSize: '3rem', fontWeight: 800 }}>{events.length}</div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--ink-muted)' }}>Active:</span> {events.filter(e => !e.is_unpublished && !isEventAutoArchived(e)).length}</div>
                <div><span style={{ color: 'var(--ink-muted)' }}>Archived:</span> {events.filter(e => isEventAutoArchived(e)).length}</div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ color: 'var(--ink-muted)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>TOTAL REGISTRATIONS</div>
              <div style={{ fontSize: '3rem', fontWeight: 800 }}>{stats.regs}</div>
            </div>
          </div>
        ) : tab === 'users' ? (
          <div>
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: '1.5rem' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
              <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search users…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name / Email</th>
                    <th>Roll No.</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.full_name ?? '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{u.email}</div>
                      </td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{u.roll_number ?? '—'}</span></td>
                      <td>
                        <select
                          className="select"
                          style={{ width: 'auto', minWidth: 100, padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
                          value={u.role}
                          onChange={e => updateRole(u.id, e.target.value as any)}
                        >
                          <option value="student">student</option>
                          <option value="organizer">organizer</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.is_banned ? 'badge-red' : 'badge-ink'}`}>
                          {u.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${u.is_banned ? 'btn-secondary' : 'btn-ghost'}`}
                          style={{ color: u.is_banned ? 'var(--ink)' : 'var(--red)' }}
                          onClick={() => toggleBan(u.id, u.is_banned)}
                        >
                          {u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'events' ? (
          <div>
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: '1.5rem' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
              <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search events…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Registrations</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(ev => {
                    const isArchived = isEventAutoArchived(ev);
                    return (
                      <tr key={ev.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ev.title ?? '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>{ev.category}</div>
                        </td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          {ev.start_time ? new Date(ev.start_time).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{ev.registration_count}</span>
                          <span style={{ color: 'var(--ink-muted)', fontSize: '0.75rem' }}> / {ev.capacity}</span>
                        </td>
                        <td>
                          <span className={`badge ${ev.is_unpublished ? 'badge-yellow' : isArchived ? 'badge-ink' : 'badge-green'}`}>
                            {ev.is_unpublished ? 'Draft' : isArchived ? 'Archived' : 'Published'}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/events/${ev.id}`} className="btn btn-sm btn-ghost">View</Link>
                          <button className="btn btn-sm btn-ghost" style={{ color: 'var(--red)' }} onClick={() => deleteEvent(ev.id)}>
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'settings' ? (
          <div className="card resp-card-pad" style={{ maxWidth: 540 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Platform Settings</h2>

            <div className="form-group">
              <label className="label">Allowed Email Domain</label>
              <input className="input" value={settingsForm.allowed_email_domain}
                onChange={e => setSettingsForm(s => ({ ...s, allowed_email_domain: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {[
                { key: 'signups_enabled', label: 'Global Signups Enabled' },
                { key: 'maintenance_mode', label: 'Maintenance Mode' },
              ].map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', background: 'var(--off-white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  <input
                    type="checkbox"
                    id={key}
                    checked={(settingsForm as any)[key]}
                    onChange={e => setSettingsForm(s => ({ ...s, [key]: e.target.checked }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor={key} style={{ fontWeight: 600, cursor: 'pointer' }}>{label}</label>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveSettings} disabled={savingSettings}>
              {savingSettings ? <Loader2 size={16} /> : 'Save Settings'}
            </button>
          </div>
        ) : (
          /* Audit log */
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td><span className="badge badge-ink">{log.action}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>{log.target_table}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

````

## src/pages/ArchivesPage.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import { isEventAutoArchived } from '../lib/utils';
import { Search, X, ArrowLeft } from 'lucide-react';

export default function ArchivesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchArchives() {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('is_unpublished', false)
        .neq('registrations.status', 'cancelled')
        .or(`is_archived.eq.true,start_time.lt.${new Date().toISOString()}`)
        .order('start_time', { ascending: false });

      if (data) {
        const evts = data
          .map((e: any) => ({
            ...e,
            registration_count: e.registrations?.[0]?.count ?? 0,
          }))
          .filter((e: any) => isEventAutoArchived(e));
        setEvents(evts);
      }
      setLoading(false);
    }
    fetchArchives();
  }, []);

  const filtered = events.filter(e =>
    !search ||
    (e.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.location ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--ink)', color: 'var(--white)',
        borderBottom: '2px solid var(--border)',
        padding: '3rem 0',
      }}>
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--white)', marginBottom: '1rem' }} onClick={() => navigate('/events')}>
            <ArrowLeft size={16} /> Back to Active Events
          </button>
          <br />
          <div className="tag" style={{ background: 'var(--ink-muted)', marginBottom: '0.75rem', color: 'white' }}>Historical</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Event Archives</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem' }}>
            A library of completed Gatherum events.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{
          background: 'var(--white)', border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)',
          padding: '1rem 1.25rem', marginBottom: '2rem',
          display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search historical events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--white)', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗃️</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No archived events</h3>
            <p style={{ color: 'var(--ink-muted)' }}>Check back later once events are completed.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
              {filtered.length} archived event{filtered.length !== 1 ? 's' : ''} found
            </div>
            <div className="grid-3">
              {filtered.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

````

## src/pages/AuthPage.tsx

````tsx
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
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card resp-card-pad" style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
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
        <div className="card resp-card-pad">
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

````

## src/pages/CheckInPage.tsx

````tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { IDetectedBarcode, Scanner } from '@yudiel/react-qr-scanner';
import toast from 'react-hot-toast';

type ScanResult = { type: 'success' | 'error' | 'warn'; message: string; name?: string } | null;

export default function CheckInPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(true);
  const [manualId, setManualId] = useState('');
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');

  useEffect(() => {
    if (eventId) {
      supabase.from('events').select('title').eq('id', eventId).single()
        .then(({ data }) => { if (data) setEventTitle(data.title ?? ''); });
    }
  }, [eventId]);

  async function checkIn(ticketId: string) {
    setScanResult(null);
    setScanning(false);
    const { data, error } = await supabase.rpc('check_in_by_ticket', { p_ticket_id: ticketId });
    if (error) {
      setScanResult({ type: 'error', message: error.message });
    } else {
      if (data === 'success') setScanResult({ type: 'success', message: 'Check-in successful! ✓' });
      else if (data === 'already_checked_in') setScanResult({ type: 'warn', message: 'Already checked in.' });
      else if (data === 'not_found') setScanResult({ type: 'error', message: 'Ticket not found.' });
      else if (data === 'unauthorized') setScanResult({ type: 'error', message: 'Not authorized for this event.' });
      else setScanResult({ type: 'error', message: `Unexpected: ${data}` });
    }

    setTimeout(() => {
      setScanResult(null);
      setScanning(true);
    }, 3000);
  }

  function handleScan(results: IDetectedBarcode[]) {
    if (!scanning || !results.length) return;
    const raw = results[0].rawValue;
    if (raw) checkIn(raw.trim());
  }

  function handleManual() {
    if (!manualId.trim()) return;
    checkIn(manualId.trim());
    setManualId('');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--white)', marginBottom: '1rem' }} onClick={() => navigate('/organizer')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>Check-In</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>{eventTitle || 'Event Check-In'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>Scan QR codes or enter ticket IDs manually.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: 600 }}>
        {/* Mode tabs */}
        <div className="tabs">
          <button className={`tab ${mode === 'camera' ? 'active' : ''}`} onClick={() => setMode('camera')}>📷 Camera</button>
          <button className={`tab ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>⌨️ Manual</button>
        </div>

        {/* Scan result */}
        {scanResult && (
          <div className={`${scanResult.type === 'success' ? 'scan-success' : scanResult.type === 'warn' ? 'scan-warn' : 'scan-error'}`}
            style={{ marginBottom: '1.5rem' }}>
            {scanResult.type === 'success' && <CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} />}
            {scanResult.type === 'error' && <XCircle size={32} style={{ margin: '0 auto 0.5rem' }} />}
            {scanResult.type === 'warn' && <AlertCircle size={32} style={{ margin: '0 auto 0.5rem' }} />}
            <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{scanResult.message}</div>
          </div>
        )}

        {mode === 'camera' ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '2px solid var(--border)', background: 'var(--off-white)' }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', textAlign: 'center', color: 'var(--ink-muted)' }}>
                {scanning ? 'Point camera at QR code…' : 'Processing…'}
              </p>
            </div>
            <Scanner
              onScan={handleScan}
              onError={(err) => console.error(err)}
              styles={{ container: { height: 320 } }}
            />
          </div>
        ) : (
          <div className="card" style={{ padding: '2rem' }}>
            <div className="form-group">
              <label className="label">Ticket ID</label>
              <input
                className="input"
                placeholder="Paste or type ticket ID…"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManual()}
                autoFocus
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleManual} disabled={!manualId.trim()}>
              ✓ Check In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

````

## src/pages/EventDetailPage.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event, Registration, RegistrationStatus } from '../types';
import SafeImage from '../components/SafeImage';
import {
  Calendar, Clock, MapPin, Users, ArrowLeft,
  CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [myReg, setMyReg] = useState<Registration | null>(null);
  const [regCount, setRegCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchEvent() {
    if (!id) return;
    const { data, error } = await supabase
      .from('events')
      .select('*, organizer:profiles!events_organizer_id_fkey(full_name, avatar_url, email)')
      .eq('id', id)
      .single();
    if (error || !data) { setLoading(false); return; }
    setEvent(data as Event);

    const { count } = await supabase
      .from('registrations')
      .select('id', { count: 'exact' })
      .eq('event_id', id)
      .in('status', ['registered', 'attended']);
    setRegCount(count ?? 0);

    if (user) {
      const { data: reg } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setMyReg(reg as Registration | null);
    }
    setLoading(false);
  }

  useEffect(() => { fetchEvent(); }, [id, user]);

  async function handleRegister() {
    if (!user) { navigate('/auth'); return; }
    setActionLoading(true);
    const { data, error } = await supabase.rpc('register_for_event', { p_event_id: id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data === 'registered' ? '🎉 Registered!' : '⏳ Added to waitlist!');
      await fetchEvent();
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    if (!user || !myReg) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', myReg.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration cancelled.');
      await fetchEvent();
    }
    setActionLoading(false);
  }

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '4rem' }}>🔍</div>
      <h2 style={{ fontWeight: 700 }}>Event not found</h2>
      <button className="btn btn-ghost" onClick={() => navigate('/events')}><ArrowLeft size={16} /> Back to Events</button>
    </div>
  );

  const now = new Date();
  const endTime = event.end_time ? new Date(event.end_time) : new Date(event.start_time);
  const isPast = endTime < now;
  const isDeadlinePast = event.registration_deadline ? new Date(event.registration_deadline) < now : false;
  const isFull = regCount >= event.capacity;
  const activeStatus = myReg?.status;

  const fillPct = Math.min(100, (regCount / event.capacity) * 100);

  function RegistrationSection() {
    if (isPast) return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏁</div>
        <p style={{ fontWeight: 700 }}>This event has ended.</p>
      </div>
    );

    if (!activeStatus && isDeadlinePast) return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏰</div>
        <p style={{ fontWeight: 700 }}>Registration Closed</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>The deadline has passed.</p>
      </div>
    );

    if (activeStatus === 'registered' || activeStatus === 'attended') return (
      <div className="card card-yellow" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <CheckCircle size={24} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              {activeStatus === 'attended' ? 'Attended ✓' : 'You\'re Registered!'}
            </div>
            <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>Ticket ID: {myReg?.ticket_id?.slice(0, 8)}…</div>
          </div>
        </div>
        {activeStatus === 'registered' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCancel}
            disabled={actionLoading}
            style={{ width: '100%' }}
          >
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Cancel Registration
          </button>
        )}
      </div>
    );

    if (activeStatus === 'waitlisted') return (
      <div className="card" style={{ padding: '1.5rem', background: 'var(--cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <AlertCircle size={24} color="var(--red)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>You're on the Waitlist</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>We'll notify you if a spot opens up.</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={actionLoading} style={{ width: '100%' }}>
          {actionLoading ? <Loader2 size={14} /> : <XCircle size={14} />}
          Leave Waitlist
        </button>
      </div>
    );

    if (!user) return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--ink-muted)' }}>Sign in to register for this event.</p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/auth')}>
          Sign In to Register
        </button>
      </div>
    );

    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        {isFull && (
          <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>
            Event is full — you'll be added to the waitlist.
          </div>
        )}
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleRegister}
          disabled={actionLoading}
        >
          {actionLoading
            ? <Loader2 size={16} />
            : isFull
              ? '➕ Join Waitlist'
              : '🎟️ Register Now'
          }
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Back */}
      <div style={{ background: 'var(--ink)', padding: '1rem 0', borderBottom: '2px solid var(--border)' }}>
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--white)' }} onClick={() => navigate('/events')}>
            <ArrowLeft size={16} /> Back to Events
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div className="resp-event-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
          {/* ── Left column ── */}
          <div>
            {/* Poster */}
            <div style={{ marginBottom: '2rem', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <SafeImage
                src={event.poster_url}
                alt={event.title ?? 'Event'}
                style={{ width: '100%', height: 340, objectFit: 'cover' }}
                fallbackEmoji="🎭"
              />
            </div>

            {/* Tags + title */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              {event.category && <span className="tag">{event.category}</span>}
              {isPast && !event.is_archived && <span className="badge badge-ink">Ended</span>}
              {event.is_archived && <span className="badge badge-ink">🗃️ Archived</span>}
              {event.is_unpublished && <span className="badge badge-yellow">Draft</span>}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
              {event.title ?? 'Untitled Event'}
            </h1>

            {/* Organizer */}
            {(event as any).organizer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--cream)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <img
                  src={(event as any).organizer.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${event.organizer_id}`}
                  alt="Organizer"
                  className="avatar avatar-sm"
                  style={{ background: 'var(--white)' }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{(event as any).organizer.full_name ?? 'Organizer'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Event Organizer</div>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>About this Event</h2>
                <div style={{
                  background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem', lineHeight: 1.8, whiteSpace: 'pre-wrap',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {event.description}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div className="resp-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: <Calendar size={16} />, label: 'Date', value: fmt(event.start_time) },
                { icon: <Clock size={16} />, label: 'Time', value: `${fmtTime(event.start_time)}${event.end_time ? ' – ' + fmtTime(event.end_time) : ''}` },
                { icon: <MapPin size={16} />, label: 'Location', value: event.location ?? 'TBA' },
                { icon: <Users size={16} />, label: 'Capacity', value: `${regCount} / ${event.capacity} registered` },
                ...(event.registration_deadline ? [{ icon: <Clock size={16} />, label: 'Deadline', value: `${fmt(event.registration_deadline)} at ${fmtTime(event.registration_deadline)}` }] : []),
              ].map(d => (
                <div key={d.label} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red)', marginBottom: '0.375rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {d.icon} {d.label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Registration CTA */}
            <RegistrationSection />

            {/* Capacity bar */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 }}>
                <span>Spots Filled</span>
                <span>{Math.round(fillPct)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill${fillPct >= 100 ? '' : fillPct > 70 ? '' : ' green'}`}
                  style={{ width: `${fillPct}%`, background: fillPct >= 100 ? 'var(--red)' : fillPct > 70 ? 'var(--yellow-dark)' : '#22C55E' }}
                />
              </div>
              <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {event.capacity - regCount > 0 ? `${event.capacity - regCount} spots left` : 'No spots remaining'}
              </div>
            </div>

            {/* Go-to-tickets button for registered users */}
            {myReg && myReg.status === 'registered' && (
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/student/tickets')}>
                🎟️ View My Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile right-col becomes stacked */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

````

## src/pages/EventsPage.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import { isEventAutoArchived } from '../lib/utils';
import { Search, Filter, X } from 'lucide-react';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social', 'Other'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      let q = supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('is_unpublished', false)
        .eq('is_archived', false)
        .neq('registrations.status', 'cancelled')
        .order('start_time', { ascending: true })
        .gte('start_time', new Date(Date.now() - 86400000).toISOString());

      if (category !== 'All') q = q.eq('category', category);

      const { data } = await q;
      if (data) {
        const evts = data
          .map((e: any) => ({
            ...e,
            registration_count: e.registrations?.[0]?.count ?? 0,
          }))
          .filter((e: any) => !isEventAutoArchived(e));
        setEvents(evts);
      }
      setLoading(false);
    }
    fetchEvents();
  }, [category]);

  const filtered = events.filter(e =>
    !search ||
    (e.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.location ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--ink)', color: 'var(--white)',
        borderBottom: '2px solid var(--border)',
        padding: '3rem 0',
      }}>
        <div className="container">
          <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>Browse</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Campus Events</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem' }}>
            Discover what's happening around you.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{
          background: 'var(--white)', border: '2px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)',
          padding: '1rem 1.25rem', marginBottom: '2rem',
          display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-muted)' }} />
            <input
              className="input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setSearch('')}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category */}
          <select
            className="select"
            style={{ width: 'auto', minWidth: 140 }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Archives Link */}
          <div className="resp-ml-auto" style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              to="/archives"
              className="btn btn-ghost btn-sm"
              style={{ fontWeight: 600, color: 'var(--ink)' }}
            >
              📚 Past Events
            </Link>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--white)', border: '2px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No events found</h3>
            <p style={{ color: 'var(--ink-muted)' }}>Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
              {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
            </div>
            <div className="grid-3">
              {filtered.map(ev => <EventCard key={ev.id} event={ev} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

````

## src/pages/HomePage.tsx

````tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useSpring,
  useInView, useMotionValue, useAnimationFrame,
  AnimatePresence,
} from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import EventCard from '../components/EventCard';
import {
  ArrowRight, Sparkles, Calendar, Users, Zap,
  ChevronDown, Star, Trophy, Ticket,
} from 'lucide-react';

function FloatingImage({
  src,
  size,
  top,
  left,
  right,
  bottom,
  delay = 0,
  duration = 4,
  rotate = 0,
  blur = 0,
  opacity = 1,
}: {
  src: string;
  size: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  delay?: number;
  duration?: number;
  rotate?: number;
  blur?: number;
  opacity?: number;
}) {
  return (
    <motion.img
      src={src}
      initial={{ rotate }}
      style={{
        position: 'absolute',
        top, left, right, bottom,
        width: size,
        height: size,
        objectFit: 'contain',
        filter: `drop-shadow(0px 15px 25px rgba(0,0,0,0.15)) blur(${blur}px)`,
        opacity,
        zIndex: blur > 2 ? 0 : 1,
      }}
      animate={{
        y: ['-15px', '15px', '-15px'],
        rotate: [rotate - 8, rotate + 8, rotate - 8],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Magnetic Button
═══════════════════════════════════════════════════════ */
function MagneticBtn({
  children, className, onClick, style,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18 });
  const springY = useSpring(y, { stiffness: 200, damping: 18 });

  function onMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }
  function onMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      style={{ ...style, x: springX, y: springY }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════
   Reveal on scroll
═══════════════════════════════════════════════════════ */
function Reveal({
  children, delay = 0, y = 40, className, style,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Animated counter
═══════════════════════════════════════════════════════ */
function Counter({ to, label, color = 'var(--red)' }: { to: number; label: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1800;
    const step = to / (dur / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(Math.floor(start));
      if (start >= to) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return (
    <motion.div
      ref={ref}
      className="stat-block"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'backOut' }}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
    >
      <div className="stat-number" style={{ color }}>{count}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   Marquee ticker
═══════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  '🎭 Cultural Fest', '💻 Tech Talks', '⚽ Sports Meet',
  '🏆 Hackathon', '🎵 Music Night', '🔧 Workshop Series',
  '🎨 Art Exhibition', '🎤 Open Mic', '📚 Book Fair',
  '🚀 Startup Summit',
];

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{
      overflow: 'hidden', background: 'var(--yellow)', border: '2px solid var(--border)',
      borderLeft: 'none', borderRight: 'none', padding: '0.625rem 0', whiteSpace: 'nowrap',
    }}>
      <motion.div
        style={{ display: 'inline-flex', gap: '3rem' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem',
            letterSpacing: '0.05em', color: 'var(--ink)', textTransform: 'uppercase',
          }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Scroll progress bar
═══════════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 4,
        background: 'var(--red)', transformOrigin: '0%', scaleX,
        zIndex: 9999,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Cursor follower
═══════════════════════════════════════════════════════ */
function CursorGlow() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 80, damping: 15 });
  const springY = useSpring(y, { stiffness: 80, damping: 15 });

  useEffect(() => {
    function move(e: MouseEvent) { x.set(e.clientX); y.set(e.clientY); }
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <motion.div
      style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9998,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,20,60,0.08) 0%, transparent 70%)',
        translateX: '-50%', translateY: '-50%',
        left: springX, top: springY,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════
   Parallax image / decorative block
═══════════════════════════════════════════════════════ */
function ParallaxBlock({ speed = 0.3, style, children }: {
  speed?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-30%', '30%']);

  return (
    <div ref={ref} style={{ overflow: 'hidden', ...style }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main HomePage
═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ events: 0, students: 0, orgs: 0 });

  // Hero parallax
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.1]);

  useEffect(() => {
    supabase.from('events').select('*, registrations(count)')
      .eq('is_unpublished', false).neq('registrations.status', 'cancelled')
      .order('start_time', { ascending: true }).limit(6)
      .then(({ data }) => {
        if (data) {
          setFeaturedEvents(data.map((e: any) => ({ ...e, registration_count: e.registrations?.[0]?.count ?? 0 })));
          setStats(s => ({ ...s, events: data.length }));
        }
      });
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student')
      .then(({ count }) => setStats(s => ({ ...s, students: count ?? 0 })));
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'organizer')
      .then(({ count }) => setStats(s => ({ ...s, orgs: count ?? 0 })));
  }, []);

  return (
    <div style={{ overflowX: 'hidden' }}>
      <ScrollProgress />
      <CursorGlow />

      {/* ══════════════════════════════════════════════
          SECTION 1 — WELCOME / HERO
      ══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh', position: 'relative',
          display: 'flex', alignItems: 'center',
          background: 'var(--off-white)', overflow: 'hidden',
        }}
      >
        {/* 3D Emoji Floating Elements */}
        <motion.div
          className="hide-on-mobile"
          style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            y: heroY, scale: heroScale,
          }}
        >
          {/* BACKGROUND LAYER (Blurred) */}
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Calendar/3D/calendar_3d.png" size={140} top="12%" left="18%" delay={0} duration={6} rotate={-15} blur={4} opacity={0.6} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Admission%20tickets/3D/admission_tickets_3d.png" size={110} top="20%" right="5%" delay={0.8} duration={4} rotate={25} blur={3} opacity={0.7} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Basketball/3D/basketball_3d.png" size={90} bottom="15%" left="38%" delay={1.1} duration={5} rotate={10} blur={5} opacity={0.5} />
          
          {/* MIDGROUND LAYER */}
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Microphone/3D/microphone_3d.png" size={120} top="8%" right="42%" delay={1.5} duration={5.5} rotate={-20} blur={1} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Laptop/3D/laptop_3d.png" size={150} top="40%" right="18%" delay={0.3} duration={6} rotate={12} blur={1} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Artist%20palette/3D/artist_palette_3d.png" size={130} bottom="8%" left="52%" delay={0.7} duration={5.2} rotate={-10} blur={0.5} />
          
          {/* FOREGROUND LAYER */}
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Trophy/3D/trophy_3d.png" size={200} top="5%" right="15%" delay={0.2} duration={5} rotate={5} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Party%20popper/3D/party_popper_3d.png" size={160} bottom="35%" left="48%" delay={1.2} duration={4.5} rotate={-25} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Guitar/3D/guitar_3d.png" size={190} bottom="8%" right="10%" delay={0.9} duration={5.8} rotate={35} />
          <FloatingImage src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Pizza/3D/pizza_3d.png" size={100} top="3%" right="28%" delay={1.8} duration={4.2} rotate={15} />
        </motion.div>

        {/* Red wedge */}
        <div className="hide-on-mobile" style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '45%',
          background: 'var(--red)', clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)',
          opacity: 0.055, pointerEvents: 'none',
        }} />

        {/* Yellow circle decor */}
        <motion.div
          className="hide-on-mobile"
          style={{
            position: 'absolute', bottom: '-8%', right: '5%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'var(--yellow)', border: '2px solid var(--border)',
            opacity: 0.18, pointerEvents: 'none',
          }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(26,18,9,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Content */}
        <motion.div
          className="container"
          style={{ position: 'relative', zIndex: 2, opacity: heroOpacity, width: '100%' }}
        >
          <div style={{ maxWidth: 660 }}>
            {/* Pill label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--yellow)', border: '2px solid var(--border)',
                borderRadius: '4px', padding: '0.3rem 0.875rem',
                fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem',
                letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <Sparkles size={12} />
              </motion.span>
              Campus Events Platform
            </motion.div>

            {/* Headline — letters animate in */}
            <div style={{ overflow: 'hidden', marginBottom: '1.25rem' }}>
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  fontWeight: 700, lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                }}
              >
                Where Campus
              </motion.h1>
            </div>

            <div style={{ overflow: 'hidden', marginBottom: '1.75rem' }}>
              <motion.h1
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  fontWeight: 700, lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  color: 'var(--red)',
                  WebkitTextStroke: '2px var(--ink)',
                  textShadow: '5px 5px 0 var(--ink)',
                  display: 'inline-block',
                }}
              >
                Life Happens.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              style={{
                fontSize: '1.125rem', color: 'var(--ink-muted)',
                maxWidth: 460, marginBottom: '2.5rem', lineHeight: 1.75,
              }}
            >
              Discover events, register instantly, track your tickets — all in one
              brutally fast platform built for <strong>Poornima University</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            >
              <MagneticBtn className="btn btn-primary btn-lg" onClick={() => navigate('/events')}>
                Explore Events <ArrowRight size={18} />
              </MagneticBtn>
              {!profile && (
                <MagneticBtn className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>
                  Join Free
                </MagneticBtn>
              )}
              {profile?.role === 'organizer' && (
                <MagneticBtn className="btn btn-dark btn-lg" onClick={() => navigate('/organizer')}>
                  Dashboard
                </MagneticBtn>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: 'absolute', bottom: '2.5rem', left: '50%', translateX: '-50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase',
            letterSpacing: '0.15em', color: 'var(--ink-muted)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          <span>Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          >
            <ChevronDown size={20} color="var(--red)" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          MARQUEE TICKER
      ══════════════════════════════════════════════ */}
      <Marquee />

      {/* ══════════════════════════════════════════════
          SECTION 2 — STATS
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--ink)', borderTop: '2px solid var(--border)',
        borderBottom: '2px solid var(--border)', padding: '4rem 0', position: 'relative', overflow: 'hidden',
      }}>
        {/* Stripes decor */}
        <div className="stripes" style={{ position: 'absolute', inset: 0, opacity: 0.08 }} />

        <div className="container" style={{ position: 'relative' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>By the Numbers</div>
              <h2 style={{ color: 'var(--white)', fontSize: '2rem', fontWeight: 700 }}>Platform Stats</h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            <Counter to={stats.events} label="Live Events" color="var(--yellow)" />
            <Counter to={stats.students} label="Students" color="var(--red)" />
            <Counter to={stats.orgs} label="Organizers" color="#22C55E" />
            <Counter to={stats.events * 12 || 0} label="Registrations" color="var(--yellow)" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 — FEATURED EVENTS
      ══════════════════════════════════════════════ */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Parallax background blob */}
        <ParallaxBlock
          style={{
            position: 'absolute', top: '-10%', right: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'var(--red)', opacity: 0.04,
            pointerEvents: 'none', zIndex: 0,
          }}
          speed={0.2}
        >
          <div style={{ width: '100%', height: '100%' }} />
        </ParallaxBlock>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
            }}>
              <div>
                <div className="tag" style={{ marginBottom: '0.5rem' }}>Upcoming</div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Events</h2>
              </div>
              <motion.button
                className="btn btn-ghost"
                onClick={() => navigate('/events')}
                whileHover={{ x: 4 }}
              >
                View All <ArrowRight size={16} />
              </motion.button>
            </div>
          </Reveal>

          {featuredEvents.length === 0 ? (
            <Reveal>
              <div style={{
                textAlign: 'center', padding: '5rem 2rem',
                background: 'var(--white)', border: '2px solid var(--border)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
                <p style={{ fontWeight: 600, color: 'var(--ink-muted)' }}>No events yet. Check back soon!</p>
              </div>
            </Reveal>
          ) : (
            <div className="grid-3">
              {featuredEvents.map((ev, i) => (
                <Reveal key={ev.id} delay={i * 0.1}>
                  <EventCard event={ev} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS (sticky scroll)
      ══════════════════════════════════════════════ */}
      <section style={{
        background: 'var(--ink)', padding: '6rem 0',
        borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>Simple</div>
              <h2 style={{ color: 'var(--white)', fontSize: '2rem', fontWeight: 700 }}>How It Works</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: '0.5rem', fontSize: '1rem' }}>
                Four steps from zero to the front row.
              </p>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 720, margin: '0 auto' }}>
            {[
              { icon: <Users size={28} />, num: '01', title: 'Sign Up', desc: 'Create your account with your @poornima.org email. No waiting, no approvals.' },
              { icon: <Calendar size={28} />, num: '02', title: 'Discover', desc: 'Browse all upcoming campus events — filtered by category, date, or interest.' },
              { icon: <Zap size={28} />, num: '03', title: 'Register', desc: 'One click, instant confirmation. Waitlist automatically if the event is full.' },
              { icon: <Ticket size={28} />, num: '04', title: 'Attend', desc: 'Show your QR ticket at the door and walk in. Done.' },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.12} y={30}>
                <motion.div
                  whileHover={{ x: 8, boxShadow: 'var(--shadow-xl)' }}
                  className="card card-red noise resp-flex-wrap" 
                  style={{
                    background: i % 2 === 0 ? 'var(--red)' : 'var(--yellow)',
                    color: i % 2 === 0 ? 'var(--white)' : 'var(--ink)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.75rem',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'default',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700,
                    opacity: 0.25, flexShrink: 0, lineHeight: 1,
                  }}>
                    {step.num}
                  </div>
                  <div style={{ color: 'inherit', opacity: 0.85, flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.375rem' }}>{step.title}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — FEATURES BENTO
      ══════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="tag" style={{ marginBottom: '0.75rem' }}>Features</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Everything You Need</h2>
            </div>
          </Reveal>

          <div className="bento-grid">
            {/* Big card */}
            <Reveal delay={0} className="bento-span-2">
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card card-red noise"
                style={{ padding: '2rem', minHeight: 200, position: 'relative', overflow: 'hidden' }}
              >
                <Trophy size={40} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Smart Registration</h3>
                <p style={{ opacity: 0.85, fontSize: '0.9375rem', maxWidth: 380, lineHeight: 1.65 }}>
                  Automatic waitlisting, one-click cancellations, and real-time seat availability — all powered by rock-solid Postgres logic.
                </p>
                <motion.div
                  style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '7rem', opacity: 0.1 }}
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  🎟️
                </motion.div>
              </motion.div>
            </Reveal>

            <Reveal delay={0.1}>
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card card-yellow"
                style={{ padding: '2rem', minHeight: 200 }}
              >
                <Star size={32} style={{ marginBottom: '1rem', opacity: 0.75 }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>QR Check-in</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Organisers scan QR codes directly from their phone — zero hardware required.
                </p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.15}>
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card"
                style={{ padding: '2rem', minHeight: 200, background: 'var(--cream)' }}
              >
                <Sparkles size={32} style={{ marginBottom: '1rem', color: 'var(--red)', opacity: 0.85 }} />
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Role-Based Access</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Students, Organizers, Admins — each with the right tools and nothing more.
                </p>
              </motion.div>
            </Reveal>

            <Reveal delay={0.3} className="bento-span-2">
              <motion.div
                whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
                className="card card-ink resp-flex-wrap"
                style={{ padding: '2rem', minHeight: 180, display: 'flex', alignItems: 'center', gap: '2rem' }}
              >
                <div>
                  <Zap size={36} color="var(--yellow)" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--white)' }}>Instant Notifications</h3>
                  <p style={{ opacity: 0.7, fontSize: '0.9rem', color: 'var(--white)', lineHeight: 1.6 }}>
                    Waitlist promotions happen automatically — no manual intervention from organisers.
                  </p>
                </div>
                <motion.div
                  style={{ fontSize: '5rem', opacity: 0.15, flexShrink: 0 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ⚡
                </motion.div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — CTA BANNER
      ══════════════════════════════════════════════ */}
      {!profile && (
        <section style={{
          background: 'var(--red)', borderTop: '2px solid var(--border)',
          borderBottom: '2px solid var(--border)', padding: '6rem 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="stripes" style={{ position: 'absolute', inset: 0, opacity: 0.12 }} />

          {/* Floating emojis */}
          {['🎭', '🏆', '🎵', '💻', '⚽'].map((e, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', fontSize: '3rem', opacity: 0.12,
                top: `${10 + i * 16}%`,
                left: `${5 + i * 18}%`,
              }}
              animate={{ y: [-15, 15, -15], rotate: [-8, 8, -8] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
            >
              {e}
            </motion.div>
          ))}

          <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
            <Reveal>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, color: 'var(--white)', marginBottom: '1rem', lineHeight: 1.2 }}>
                Ready to join the action?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
                Sign up in seconds and never miss a campus event again.
              </p>
              <MagneticBtn className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>
                Get Started — It's Free <ArrowRight size={18} />
              </MagneticBtn>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer style={{
        background: 'var(--ink)', color: 'rgba(255,255,255,0.55)',
        borderTop: '2px solid var(--border)', padding: '3rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--red)', marginBottom: '0.25rem' }}>
                Gatherum
              </div>
              <div style={{ fontSize: '0.8125rem' }}>Campus Events Platform · Poornima University</div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Events', path: '/events' },
                { label: 'Sign In', path: '/auth' },
              ].map(l => (
                <motion.button
                  key={l.path}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'rgba(255,255,255,0.65)', border: '2px solid rgba(255,255,255,0.15)' }}
                  onClick={() => navigate(l.path)}
                  whileHover={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  {l.label}
                </motion.button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Gatherum. Built with ❤️ for campus life.
          </div>
        </div>
      </footer>
    </div>
  );
}

````

## src/pages/OrganizerDashboard.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import { isEventAutoArchived } from '../lib/utils';
import { Plus, QrCode, BarChart2, Users, Calendar, Download } from 'lucide-react';
import SafeImage from '../components/SafeImage';
import toast from 'react-hot-toast';

import { exportEventParticipants } from '../lib/exportExcel';

export default function OrganizerDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'published' | 'drafts' | 'archived'>('published');
  const [exportingId, setExportingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('organizer_id', profile!.id)
        .neq('registrations.status', 'cancelled')
        .order('created_at', { ascending: false });

      if (data) {
        setEvents(data.map((e: any) => ({
          ...e,
          registration_count: e.registrations?.[0]?.count ?? 0,
        })));
      }
      setLoading(false);
    }
    if (profile) load();
  }, [profile]);

  async function togglePublish(event: Event) {
    const { error } = await supabase
      .from('events')
      .update({ is_unpublished: !event.is_unpublished })
      .eq('id', event.id);

    if (error) toast.error(error.message);
    else {
      toast.success(event.is_unpublished ? 'Event published!' : 'Event unpublished.');
      setEvents(es => es.map(e => e.id === event.id ? { ...e, is_unpublished: !e.is_unpublished } : e));
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Event deleted.');
      setEvents(es => es.filter(e => e.id !== id));
    }
  }

  async function handleExport(ev: Event) {
    if (exportingId || !profile?.id) return;
    setExportingId(ev.id);
    const res = await exportEventParticipants(ev.id, ev.title || 'Event', profile.id);
    if (res.error) {
      toast.error(res.error);
    }
    setExportingId(null);
  }

  const published = events.filter(e => !e.is_unpublished && !isEventAutoArchived(e));
  const drafts = events.filter(e => e.is_unpublished && !isEventAutoArchived(e));
  const archived = events.filter(e => isEventAutoArchived(e));
  
  const shown = tab === 'published' ? published : tab === 'drafts' ? drafts : archived;

  const totalRegs = events.reduce((a, e) => a + (e.registration_count ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="tag" style={{ background: 'var(--red)', color: 'var(--white)', marginBottom: '0.75rem' }}>Organizer</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>My Events</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                {events.length} events · {totalRegs} total registrations
              </p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigate('/organizer/events/new')}>
              <Plus size={16} /> Create Event
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Published', value: published.length, icon: <Calendar size={20} />, color: 'var(--red)' },
            { label: 'Drafts', value: drafts.length, icon: <BarChart2 size={20} />, color: 'var(--yellow-dark)' },
            { label: 'Total Signups', value: totalRegs, icon: <Users size={20} />, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'published' ? 'active' : ''}`} onClick={() => setTab('published')}>
            Published ({published.length})
          </button>
          <button className={`tab ${tab === 'drafts' ? 'active' : ''}`} onClick={() => setTab('drafts')}>
            Drafts ({drafts.length})
          </button>
          <button className={`tab ${tab === 'archived' ? 'active' : ''}`} onClick={() => setTab('archived')}>
            Archived ({archived.length})
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No {tab} events</h3>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
              {tab === 'published' 
                ? 'Create and publish your first event.' 
                : tab === 'drafts' 
                  ? 'All your events are published!' 
                  : 'No archived events yet.'}
            </p>
            {tab !== 'archived' && (
              <button className="btn btn-primary" onClick={() => navigate('/organizer/events/new')}>
                <Plus size={16} /> Create Event
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {shown.map(ev => (
              <div key={ev.id} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Thumbnail */}
                <SafeImage
                  src={ev.poster_url}
                  alt={ev.title ?? ''}
                  style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', objectFit: 'cover', flexShrink: 0 }}
                  fallbackEmoji="🎭"
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem', cursor: 'pointer' }}
                    onClick={() => navigate(`/events/${ev.id}`)}>
                    {ev.title ?? 'Untitled'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
                    {new Date(ev.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {ev.location && ` · ${ev.location}`}
                  </div>
                </div>

                {/* Registrations */}
                <div style={{ textAlign: 'center', minWidth: 80 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--red)' }}>
                    {ev.registration_count ?? 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', fontWeight: 600 }}>/ {ev.capacity}</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/organizer/events/${ev.id}`)}>
                    Edit
                  </button>
                  <button className="btn btn-dark btn-sm" onClick={() => navigate(`/organizer/checkin/${ev.id}`)}>
                    <QrCode size={14} /> Check-in
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => handleExport(ev)}
                    disabled={exportingId === ev.id}
                  >
                    <Download size={14} /> 
                    {exportingId === ev.id ? 'Exporting...' : 'Export Excel ↓'}
                  </button>
                  <button
                    className={`btn btn-sm ${ev.is_unpublished ? 'btn-secondary' : 'btn-ghost'}`}
                    onClick={() => togglePublish(ev)}
                  >
                    {ev.is_unpublished ? 'Publish' : 'Unpublish'}
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteEvent(ev.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

````

## src/pages/OrganizerEventWizard.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function formatToLocalInput(isoString?: string | null | Date) {
  if (!isoString) return '';
  const d = new Date(isoString as any);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social', 'Other'];

interface EventForm {
  title: string;
  description: string;
  category: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: string;
  poster_url: string;
  is_unpublished: boolean;
  registration_deadline: string;
}

const EMPTY: EventForm = {
  title: '', description: '', category: 'Technical',
  start_time: '', end_time: '', location: '',
  capacity: '50', poster_url: '', is_unpublished: false,
  registration_deadline: ''
};

export default function OrganizerEventWizard() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [form, setForm] = useState<EventForm>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from('events').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            title: data.title ?? '',
            description: data.description ?? '',
            category: data.category ?? 'Technical',
            start_time: formatToLocalInput(data.start_time),
            end_time: formatToLocalInput(data.end_time),
            location: data.location ?? '',
            capacity: String(data.capacity),
            poster_url: data.poster_url ?? '',
            is_unpublished: data.is_unpublished,
            registration_deadline: formatToLocalInput(data.registration_deadline),
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  const [uploading, setUploading] = useState(false);

  function update(field: keyof EventForm, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 250 * 1024) {
      toast.error('Poster must be 250 KB or smaller.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WebP images are allowed.');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const path = `events/${profile!.id}/${filename}`;

    const { error } = await supabase.storage.from('images').upload(path, file);
    setUploading(false);

    if (error) {
      toast.error('Upload failed: ' + error.message);
    } else {
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      update('poster_url', data.publicUrl);
      toast.success('Poster uploaded!');
    }
  }

  async function handleSave(publish = false) {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.start_time) { toast.error('Start time is required'); return; }
    const cap = parseInt(form.capacity);
    if (isNaN(cap) || cap < 1) { toast.error('Capacity must be ≥ 1'); return; }

    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      start_time: new Date(form.start_time).toISOString(),
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      location: form.location || null,
      capacity: cap,
      poster_url: form.poster_url || null,
      is_unpublished: publish ? false : form.is_unpublished,
      organizer_id: profile!.id,
      registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null,
    };

    if (isNew) {
      const { error } = await supabase.from('events').insert(payload);
      if (error) toast.error(error.message);
      else { toast.success(publish ? 'Event published!' : 'Event saved as draft!'); navigate('/organizer'); }
    } else {
      const { error } = await supabase.from('events').update(payload).eq('id', id);
      if (error) toast.error(error.message);
      else { toast.success('Event updated!'); navigate('/organizer'); }
    }
    setSaving(false);
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--white)', marginBottom: '1rem' }} onClick={() => navigate('/organizer')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="tag" style={{ background: 'var(--red)', color: 'var(--white)', marginBottom: '0.75rem' }}>
            {isNew ? 'New Event' : 'Edit Event'}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>
            {isNew ? 'Create Event' : 'Edit Event'}
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 760 }}>
        <div className="card" style={{ padding: '2rem' }}>
          {/* Title */}
          <div className="form-group">
            <label className="label">Event Title *</label>
            <input className="input" placeholder="Annual Tech Fest 2025" value={form.title} onChange={e => update('title', e.target.value)} />
          </div>

          {/* Category + Capacity row */}
          <div className="resp-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Category</label>
              <select className="select" value={form.category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Capacity *</label>
              <input className="input" type="number" min="1" value={form.capacity} onChange={e => update('capacity', e.target.value)} />
            </div>
          </div>

          {/* Date/time row */}
          <div className="resp-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Start Time *</label>
              <DatePicker 
                selected={form.start_time ? new Date(form.start_time) : null}
                onChange={(d) => update('start_time', formatToLocalInput(d))}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="input"
                placeholderText="Select start time"
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <DatePicker 
                selected={form.end_time ? new Date(form.end_time) : null}
                onChange={(d) => update('end_time', formatToLocalInput(d))}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="input"
                placeholderText="Select end time"
              />
            </div>
          </div>

          {/* Location & Registration Deadline */}
          <div className="resp-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Location / Venue</label>
              <input className="input" placeholder="Seminar Hall, Block A" value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <DatePicker 
                selected={form.registration_deadline ? new Date(form.registration_deadline) : null}
                onChange={(d) => update('registration_deadline', formatToLocalInput(d))}
                showTimeSelect
                dateFormat="MMM d, yyyy h:mm aa"
                className="input"
                placeholderText="Select deadline"
              />
            </div>
          </div>

          {/* Poster Upload & URL */}
          <div className="form-group">
            <label className="label">Event Poster</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label className="btn" style={{ background: 'var(--ink)', color: 'var(--white)', cursor: 'pointer' }}>
                {uploading ? 'Uploading...' : '📁 Upload Image'}
                <input type="file" accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                Max 250 KB. JPG, PNG, WebP.
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-muted)' }}>OR PASTE URL</div>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            <input className="input" placeholder="Direct Image URL (Not a Canva share link)" value={form.poster_url} onChange={e => update('poster_url', e.target.value)} />
            
            {form.poster_url && (
              <img src={form.poster_url} alt="Poster preview" onError={e => (e.currentTarget.style.display = 'none')}
                style={{ marginTop: '1rem', maxHeight: 200, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', objectFit: 'cover', display: 'block' }} />
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="textarea" rows={5} placeholder="Tell students what this event is about…"
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>

          {/* Draft toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.875rem', background: 'var(--off-white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
            <input id="draft-toggle" type="checkbox" checked={form.is_unpublished}
              onChange={e => update('is_unpublished', e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="draft-toggle" style={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}>
              Save as draft (don't show to students yet)
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSave(false)} disabled={saving}>
              {saving ? <Loader2 size={16} /> : <Save size={16} />}
              Save
            </button>
            {form.is_unpublished && (
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleSave(true)} disabled={saving}>
                🚀 Save & Publish
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => navigate('/organizer')} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

````

## src/pages/ProfilePage.tsx

````tsx
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

````

## src/pages/StudentDashboard.tsx

````tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Registration, Event } from '../types';
import EventCard from '../components/EventCard';
import { Calendar, Ticket, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState<'overview' | 'tickets'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // My registrations with event data
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, event:events(*, organizer:profiles!events_organizer_id_fkey(full_name))')
        .eq('user_id', profile!.id)
        .in('status', ['registered', 'waitlisted', 'attended'])
        .order('created_at', { ascending: false });

      if (regs) setRegistrations(regs as Registration[]);

      // Upcoming published events
      const { data: evts } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('is_unpublished', false)
        .neq('registrations.status', 'cancelled')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4);

      if (evts) {
        setUpcomingEvents(evts.map((e: any) => ({
          ...e, registration_count: e.registrations?.[0]?.count ?? 0,
        })));
      }

      setLoading(false);
    }
    if (profile) load();
  }, [profile]);

  async function cancelReg(regId: string) {
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', regId);
    if (error) toast.error(error.message);
    else {
      toast.success('Registration cancelled.');
      setRegistrations(rs => rs.filter(r => r.id !== regId));
    }
  }

  const activeRegs = registrations.filter(r => r.status === 'registered' || r.status === 'attended');
  const waitlisted = registrations.filter(r => r.status === 'waitlisted');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>Student</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Hey, {profile?.full_name?.split(' ')[0] ?? 'Student'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {activeRegs.length} active registration{activeRegs.length !== 1 ? 's' : ''} · {waitlisted.length} waitlisted
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Registered', value: activeRegs.length, icon: <Ticket size={20} />, color: 'var(--red)' },
            { label: 'Waitlisted', value: waitlisted.length, icon: <Bell size={20} />, color: 'var(--yellow-dark)' },
            { label: 'Attended', value: registrations.filter(r => r.status === 'attended').length, icon: <Calendar size={20} />, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>My Registrations</button>
          <button className={`tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => setTab('tickets')}>
            <Ticket size={14} style={{ display: 'inline', marginRight: 4 }} />
            Tickets
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : tab === 'overview' ? (
          <div>
            {registrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎟️</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No registrations yet</h3>
                <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>Browse upcoming events and register for free.</p>
                <button className="btn btn-primary" onClick={() => navigate('/events')}>Explore Events</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {registrations.map(reg => {
                  const ev = reg.event as unknown as Event;
                  if (!ev) return null;
                  return (
                    <div key={reg.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', cursor: 'pointer' }} onClick={() => navigate(`/events/${ev.id}`)}>
                          {ev.title ?? 'Untitled Event'}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
                          {new Date(ev.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {ev.location && ` · ${ev.location}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${reg.status === 'registered' ? 'badge-yellow' : reg.status === 'attended' ? 'badge-ink' : 'badge-white'}`}>
                          {reg.status}
                        </span>
                        {reg.status === 'registered' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => cancelReg(reg.id)} style={{ color: 'var(--red)' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming events section */}
            {upcomingEvents.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.25rem' }}>Discover More Events</h2>
                <div className="grid-2">
                  {upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tickets tab */
          <div>
            {activeRegs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
                <p style={{ fontWeight: 600 }}>No active tickets.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeRegs.map(reg => {
                  const ev = reg.event as unknown as Event;
                  if (!ev) return null;
                  return (
                    <div key={reg.id} className="ticket">
                      <div className="ticket-header">
                        <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{ev.title ?? 'Event'}</div>
                        <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          {new Date(ev.start_time).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {ev.location && ` · ${ev.location}`}
                        </div>
                      </div>
                      <div className="ticket-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--border)' }}>
                              <QRCode value={reg.ticket_id} size={80} />
                            </div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>TICKET ID</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.05em', wordBreak: 'break-all' }}>{reg.ticket_id}</div>
                            </div>
                          </div>
                          <span className={`badge ${reg.status === 'attended' ? 'badge-ink' : 'badge-yellow'}`}>
                            {reg.status === 'attended' ? '✓ Attended' : '● Registered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

````

