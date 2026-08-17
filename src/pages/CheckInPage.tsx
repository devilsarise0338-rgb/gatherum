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
