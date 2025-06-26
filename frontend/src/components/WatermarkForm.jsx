import React, { useState } from 'react';
import { postWithAuth } from './api.js';

function WatermarkForm({ addLog, onResult }) {
  const [content, setContent] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');
    try {
      const { ok, data } = await postWithAuth('/generate_watermark', { content, partner_id: partnerId });
      if (ok) {
        setResult(data.watermark);
        addLog(`✔️ Watermark generated for ${partnerId}`, 'success');
        if (onResult) onResult(data.watermark);
      } else {
        setError(data.error || 'Error generating watermark');
        addLog(`❌ Watermark generation failed (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog('❌ Watermark generation failed (network error)', 'error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      addLog('Copied watermark to clipboard', 'info');
    }
  };

  const handleDemo = () => {
    setContent('file.txt');
    setPartnerId('PartnerA');
    addLog('Demo input filled for watermark', 'info');
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3>Watermark Generator</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1em', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          style={{ padding: '0.5em', minWidth: '150px' }}
        />
        <input
          type="text"
          placeholder="Partner ID"
          value={partnerId}
          onChange={e => setPartnerId(e.target.value)}
          required
          style={{ padding: '0.5em', minWidth: '120px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5em 1em' }}>
          {loading ? 'Generating...' : 'Generate'}
        </button>
        <button type="button" onClick={handleDemo} style={{ padding: '0.5em 1em', background: '#e0e7ef' }}>
          Demo Input
        </button>
      </form>
      {result && (
        <div style={{ marginTop: '1em', wordBreak: 'break-all', background: '#f3f3f3', padding: '1em', borderRadius: 6 }}>
          <b>Watermark:</b> {result}
          <button onClick={handleCopy} style={{ marginLeft: 12, padding: '0.3em 0.8em', fontSize: '0.95em' }}>Copy Result</button>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default WatermarkForm; 