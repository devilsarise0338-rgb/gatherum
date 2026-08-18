import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, PlatformSettings } from '../types';
import { Users, Settings, Shield, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

type AdminTab = 'users' | 'settings' | 'audit';

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    signups_enabled: true,
    allowed_email_domain: '@poornima.org',
    maintenance_mode: false,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Use the admin_fetch_users RPC or just select from profiles (admin RLS allows it)
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) setUsers(usersData as Profile[]);

      const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (settingsData) {
        setSettings(settingsData as PlatformSettings);
        setSettingsForm({
          signups_enabled: settingsData.signups_enabled,
          allowed_email_domain: settingsData.allowed_email_domain,
          maintenance_mode: settingsData.maintenance_mode,
        });
      }

      const { data: audit } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (audit) setAuditLog(audit);
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
    const { error } = await supabase.rpc('admin_toggle_user_ban', { p_user_id: userId, p_is_banned: !isBanned });
    if (error) toast.error(error.message);
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

  const filtered = users.filter(u =>
    !search ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.roll_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div className="tag" style={{ background: 'var(--red)', color: 'var(--white)', marginBottom: '0.75rem' }}>Admin</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
            {users.length} users · Platform Control
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={14} style={{ display: 'inline', marginRight: 4 }} /> Users
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
        ) : tab === 'users' ? (
          <div>
            {/* Search */}
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
                  {filtered.map(u => (
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
