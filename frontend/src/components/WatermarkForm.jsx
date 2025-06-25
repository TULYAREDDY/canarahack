import React, { useState } from 'react';

function WatermarkForm() {
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
      const res = await fetch('http://localhost:5000/generate_watermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, partner_id: partnerId })
      });
      const data = await res.json();
      if (res.ok) setResult(data.watermark);
      else setError(data.error || 'Error generating watermark');
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
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
      </form>
      {result && <div style={{ marginTop: '1em', wordBreak: 'break-all' }}><b>Watermark:</b> {result}</div>}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default WatermarkForm; 