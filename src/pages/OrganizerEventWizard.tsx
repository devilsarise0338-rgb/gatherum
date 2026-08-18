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
