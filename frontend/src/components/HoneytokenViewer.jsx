import React, { useState } from 'react';

function HoneytokenViewer() {
  const [honeytoken, setHoneytoken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHoneytoken = async () => {
    setLoading(true);
    setError('');
    setHoneytoken(null);
    try {
      const res = await fetch('http://localhost:5000/generate_honeytoken');
      const data = await res.json();
      if (res.ok) setHoneytoken(data);
      else setError(data.error || 'Error fetching honeytoken');
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3>Honeytoken Viewer</h3>
      <button onClick={fetchHoneytoken} disabled={loading} style={{ padding: '0.5em 1em' }}>
        {loading ? 'Loading...' : 'Generate Honeytoken'}
      </button>
      {honeytoken && (
        <pre style={{ marginTop: '1em', background: '#f3f3f3', padding: '1em', borderRadius: '6px', overflowX: 'auto' }}>
          {JSON.stringify(honeytoken, null, 2)}
        </pre>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default HoneytokenViewer; 