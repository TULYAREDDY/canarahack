import React, { useState } from 'react';
import { postWithAuth } from './api.js';

function WatermarkForm({ addLog, onResult }) {
  const [partnerId, setPartnerId] = useState('');
  const [userId, setUserId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const demoTimestamp = new Date().toISOString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    try {
      const { ok, data } = await postWithAuth('/generate_watermark', {
        partner_id: partnerId,
        user_id: userId,
        timestamp: timestamp
      });
      if (ok) {
        setResult(data.watermark);
        addLog && addLog(`✔️ Watermark generated for ${partnerId}|${timestamp}|${userId}`, 'success');
        onResult && onResult(data.watermark);
      } else {
        setError(data.error || 'Error generating watermark');
        addLog && addLog(`❌ Watermark generation failed (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog && addLog('❌ Watermark generation failed (network error)', 'error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      addLog && addLog('Copied watermark to clipboard', 'info');
    }
  };

  const handleDemo = () => {
    setPartnerId('partner1');
    setUserId('user2');
    setTimestamp(demoTimestamp);
    addLog && addLog('Demo input filled for watermark', 'info');
  };

  return (
    <div style={{ margin: '2em 0', background: '#f8fafc', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef' }}>
      <h3 style={{ color: '#2563eb' }}>Watermark Generator</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1em' }}>
        <input type="text" value={partnerId} onChange={e => setPartnerId(e.target.value)} placeholder="Partner ID" style={{ padding: '0.5em', minWidth: 100 }} required />
        <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" style={{ padding: '0.5em', minWidth: 100 }} required />
        <input type="text" value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="Timestamp (ISO)" style={{ padding: '0.5em', minWidth: 200 }} required />
        <button type="submit" disabled={loading} style={{ padding: '0.5em 1.5em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
        <button type="button" onClick={handleDemo} style={{ padding: '0.5em 1.5em', background: '#e5e7eb', color: '#222', border: 'none', borderRadius: 6, fontWeight: 600, marginLeft: 8 }}>
          Demo Input
        </button>
      </form>
      {result && (
        <div style={{ background: '#f3f4f6', borderRadius: 8, padding: '1em', marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <b>Watermark:</b> <span style={{ fontFamily: 'monospace', fontSize: '1em', wordBreak: 'break-all' }}>{result}</span>
          <button onClick={handleCopy} style={{ fontSize: '0.95em', padding: '0.2em 0.7em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}>
            Copy Result
          </button>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default WatermarkForm; 