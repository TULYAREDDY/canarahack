import React, { useState } from 'react';

function PolicyBuilder() {
  const [purpose, setPurpose] = useState('');
  const [daysValid, setDaysValid] = useState('');
  const [region, setRegion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('http://localhost:5000/generate_policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, days_valid: daysValid, region })
      });
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || 'Error generating policy');
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3>Policy Metadata Builder</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1em', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Purpose"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          required
          style={{ padding: '0.5em', minWidth: '120px' }}
        />
        <input
          type="number"
          placeholder="Days Valid"
          value={daysValid}
          onChange={e => setDaysValid(e.target.value)}
          required
          style={{ padding: '0.5em', minWidth: '100px' }}
        />
        <input
          type="text"
          placeholder="Region"
          value={region}
          onChange={e => setRegion(e.target.value)}
          required
          style={{ padding: '0.5em', minWidth: '100px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5em 1em' }}>
          {loading ? 'Building...' : 'Build'}
        </button>
      </form>
      {result && (
        <pre style={{ marginTop: '1em', background: '#f3f3f3', padding: '1em', borderRadius: '6px', overflowX: 'auto' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default PolicyBuilder; 