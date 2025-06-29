import React, { useState } from 'react';
import { getWithAuth, simulateTrapHit, getKnownHoneytokens } from './api.js';

function HoneytokenViewer({ addLog, onResult }) {
  const [honeytoken, setHoneytoken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Trap simulation state
  const [trapPartnerId, setTrapPartnerId] = useState('partner1');
  const [trapUserId, setTrapUserId] = useState('user1');
  const [trapResult, setTrapResult] = useState(null);
  const [trapLoading, setTrapLoading] = useState(false);
  const [trapError, setTrapError] = useState('');
  // Known honeytokens state
  const [knownTokens, setKnownTokens] = useState({});
  const [tokensLoading, setTokensLoading] = useState(false);

  const fetchHoneytoken = async () => {
    setLoading(true);
    setError('');
    setHoneytoken(null);
    try {
      const { ok, data } = await getWithAuth('/generate_honeytoken');
      if (ok) {
        setHoneytoken(data);
        addLog('\u2714\ufe0f Honeytoken generated', 'success');
        if (onResult) onResult(data);
      } else {
        setError(data.error || 'Error fetching honeytoken');
        addLog(`\u274c Honeytoken request failed (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog('\u274c Honeytoken request failed (network error)', 'error');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (honeytoken) {
      navigator.clipboard.writeText(JSON.stringify(honeytoken, null, 2));
      addLog('Copied honeytoken to clipboard', 'info');
    }
  };

  // Trap simulation handler
  const handleSimulateTrap = async () => {
    setTrapLoading(true);
    setTrapError('');
    setTrapResult(null);
    try {
      const { ok, data } = await simulateTrapHit(trapPartnerId, trapUserId);
      if (ok) {
        setTrapResult(data);
        addLog(`Trap simulation: trap_hit=${data.trap_hit}, risk_score=${data.risk_score}`, 'info');
      } else {
        setTrapError(data.error || 'Error simulating trap');
      }
    } catch (err) {
      setTrapError('Network error');
    }
    setTrapLoading(false);
  };

  // Known honeytokens handler
  const handleViewKnownTokens = async () => {
    setTokensLoading(true);
    try {
      const { ok, data } = await getKnownHoneytokens();
      if (ok) setKnownTokens(data);
    } catch (err) {
      console.error('Failed to fetch known honeytokens');
    }
    setTokensLoading(false);
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
      {/* Trap simulation UI */}
      <div style={{ marginTop: 32, background: '#fef9c3', borderRadius: 8, padding: '1em' }}>
        <h4 style={{ color: '#b45309' }}>Simulate Trap Hit</h4>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <input type="text" value={trapPartnerId} onChange={e => setTrapPartnerId(e.target.value)} placeholder="Partner ID" style={{ padding: '0.4em', minWidth: 100 }} />
          <input type="text" value={trapUserId} onChange={e => setTrapUserId(e.target.value)} placeholder="User ID" style={{ padding: '0.4em', minWidth: 100 }} />
          <button onClick={handleSimulateTrap} disabled={trapLoading} style={{ padding: '0.4em 1em', background: '#b45309', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
            {trapLoading ? 'Simulating...' : 'Simulate Trap'}
          </button>
        </div>
        {trapResult && (
          <div style={{ marginTop: 8, color: trapResult.trap_hit ? '#be185d' : '#16a34a', fontWeight: 600 }}>
            Trap Hit: {trapResult.trap_hit ? 'Yes' : 'No'} | Risk Score: {trapResult.risk_score}
          </div>
        )}
        {trapError && <div style={{ color: 'red', marginTop: 8 }}>{trapError}</div>}
      </div>
      {/* Known honeytokens viewer */}
      <div style={{ marginTop: 32, background: '#f0f9ff', borderRadius: 8, padding: '1em' }}>
        <h4 style={{ color: '#2563eb' }}>Known Honeytokens</h4>
        <button onClick={handleViewKnownTokens} disabled={tokensLoading} style={{ marginBottom: 12, padding: '0.4em 1em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {tokensLoading ? 'Loading...' : 'View Known Tokens'}
        </button>
        {Object.keys(knownTokens).length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#e0f2fe' }}>
                <th style={{ textAlign: 'left', padding: 6 }}>Token</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Type</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Created</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Used By</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(knownTokens).map(([token, info], i) => (
                <tr key={i}>
                  <td style={{ padding: 6, fontFamily: 'monospace', fontSize: '0.9em' }}>{token}</td>
                  <td style={{ padding: 6 }}>{info.type}</td>
                  <td style={{ padding: 6 }}>{info.created_at}</td>
                  <td style={{ padding: 6, color: info.partner_id ? '#be185d' : '#16a34a' }}>
                    {info.partner_id || 'Unused'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default HoneytokenViewer; 