import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
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

  const published = events.filter(e => !e.is_unpublished && !e.is_archived);
  const drafts = events.filter(e => e.is_unpublished && !e.is_archived);
  const archived = events.filter(e => e.is_archived);
  
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
            <button className="btn btn-primary" onClick={() => navigate('/organizer/events/new')}>
              <Plus size={16} /> Create Event
            </button>
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
