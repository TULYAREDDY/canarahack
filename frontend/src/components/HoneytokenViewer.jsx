import React, { useState } from 'react';
import { getWithAuth } from './api.js';

function HoneytokenViewer({ addLog, onResult }) {
  const [honeytoken, setHoneytoken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHoneytoken = async () => {
    setLoading(true);
    setError('');
    setHoneytoken(null);
    try {
      const { ok, data } = await getWithAuth('/generate_honeytoken');
      if (ok) {
        setHoneytoken(data);
        addLog('✔️ Honeytoken generated', 'success');
        if (onResult) onResult(data);
      } else {
        setError(data.error || 'Error fetching honeytoken');
        addLog(`❌ Honeytoken request failed (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog('❌ Honeytoken request failed (network error)', 'error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (honeytoken) {
      navigator.clipboard.writeText(JSON.stringify(honeytoken, null, 2));
      addLog('Copied honeytoken to clipboard', 'info');
    }
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3>Honeytoken Viewer</h3>
      <button onClick={fetchHoneytoken} disabled={loading} style={{ padding: '0.5em 1em' }}>
        {loading ? 'Loading...' : 'Generate Honeytoken'}
      </button>
      {honeytoken && (
        <div style={{ marginTop: '1em', background: '#f3f3f3', padding: '1em', borderRadius: 6 }}>
          <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(honeytoken, null, 2)}</pre>
          <button onClick={handleCopy} style={{ marginTop: 8, padding: '0.3em 0.8em', fontSize: '0.95em' }}>Copy Result</button>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default HoneytokenViewer; 