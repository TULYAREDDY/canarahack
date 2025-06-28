import React, { useState } from 'react';
import { postWithAuth } from './api.js';

function PolicyBuilder({ addLog, onResult }) {
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
      const { ok, data } = await postWithAuth('/generate_policy', { purpose, days_valid: daysValid, region });
      if (ok) {
        setResult(data);
        addLog(`✔️ Policy metadata created (${daysValid} days)`, 'success');
        if (onResult) onResult(data);
      } else {
        setError(data.error || 'Error generating policy');
        addLog(`❌ Policy generation failed (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog('❌ Policy generation failed (network error)', 'error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      addLog('Copied policy metadata to clipboard', 'info');
    }
  };

  const handleDemo = () => {
    setPurpose('Data Sharing');
    setDaysValid('30');
    setRegion('IN');
    addLog('Demo input filled for policy', 'info');
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
        <button type="button" onClick={handleDemo} style={{ padding: '0.5em 1em', background: '#e0e7ef' }}>
          Demo Input
        </button>
      </form>
      {result && (
        <div style={{ marginTop: '1em', background: '#f3f3f3', padding: '1em', borderRadius: 6 }}>
          <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
          <button onClick={handleCopy} style={{ marginTop: 8, padding: '0.3em 0.8em', fontSize: '0.95em' }}>Copy Result</button>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default PolicyBuilder; 