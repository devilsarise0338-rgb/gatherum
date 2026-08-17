import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
            start_time: data.start_time?.slice(0, 16) ?? '',
            end_time: data.end_time?.slice(0, 16) ?? '',
            location: data.location ?? '',
            capacity: String(data.capacity),
            poster_url: data.poster_url ?? '',
            is_unpublished: data.is_unpublished,
            registration_deadline: data.registration_deadline?.slice(0, 16) ?? '',
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  function update(field: keyof EventForm, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Start Time *</label>
              <input className="input" type="datetime-local" value={form.start_time} onChange={e => update('start_time', e.target.value)} />
            </div>
            <div>
              <label className="label">End Time</label>
              <input className="input" type="datetime-local" value={form.end_time} onChange={e => update('end_time', e.target.value)} />
            </div>
          </div>

          {/* Location & Registration Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="label">Location / Venue</label>
              <input className="input" placeholder="Seminar Hall, Block A" value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <input className="input" type="datetime-local" value={form.registration_deadline} onChange={e => update('registration_deadline', e.target.value)} />
            </div>
          </div>

          {/* Poster URL */}
          <div className="form-group">
            <label className="label">Poster URL</label>
            <input className="input" placeholder="https://..." value={form.poster_url} onChange={e => update('poster_url', e.target.value)} />
            {form.poster_url && (
              <img src={form.poster_url} alt="Poster preview" onError={e => (e.currentTarget.style.display = 'none')}
                style={{ marginTop: '0.75rem', maxHeight: 160, borderRadius: 'var(--radius-sm)', border: '2px solid var(--border)', objectFit: 'cover', display: 'block' }} />
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
