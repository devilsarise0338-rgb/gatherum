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
