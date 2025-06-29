import React, { useState } from 'react';
import { simulateTrapHit } from './api.js';

function PartnerTestPanel({ partnerId }) {
  const [userId, setUserId] = useState('user1');
  const [trapResult, setTrapResult] = useState(null);
  const [trapLoading, setTrapLoading] = useState(false);
  const [error, setError] = useState('');
  const [testTrapValue, setTestTrapValue] = useState('');
  const [trapTestResult, setTrapTestResult] = useState('');
  const [trapTestLoading, setTrapTestLoading] = useState(false);

  const handleSimulateTrap = async () => {
    setTrapLoading(true);
    setError('');
    setTrapResult(null);
    try {
      const { ok, data } = await simulateTrapHit(partnerId, userId);
      if (ok) setTrapResult(data);
      else setError(data.error || 'Trap simulation failed');
    } catch {
      setError('Network error');
    }
    setTrapLoading(false);
  };

  const handleTestTrapValue = async () => {
    setTrapTestLoading(true);
    setTrapTestResult('');
    try {
      const res = await fetch('http://localhost:5000/test_trap_value', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'SECRET123',
        },
        body: JSON.stringify({ partner_id: partnerId, value: testTrapValue })
      });
      const data = await res.json();
      if (res.ok) setTrapTestResult(data.result || 'Trap checked');
      else setTrapTestResult(data.error || 'Error testing trap');
    } catch (err) {
      setTrapTestResult('Network error');
    }
    setTrapTestLoading(false);
  };

  return (
    <div style={{ margin: '2em 0', background: '#f0f9ff', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef', maxWidth: 500 }}>
      <h3 style={{ color: '#2563eb' }}>Trap Test Panel</h3>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <input type="text" value={partnerId} disabled style={{ padding: '0.5em', minWidth: 100, background: '#f1f5f9', color: '#2563eb', fontWeight: 600 }} />
        <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="User ID" style={{ padding: '0.5em', minWidth: 100 }} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button onClick={handleSimulateTrap} disabled={trapLoading} style={{ padding: '0.5em 1em', background: '#be185d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {trapLoading ? 'Simulating...' : 'Simulate Trap Hit'}
        </button>
      </div>
      {trapResult && (
        <div style={{ marginBottom: 12, color: trapResult.trap_hit ? '#be185d' : '#16a34a', fontWeight: 600 }}>
          Trap Hit: {trapResult.trap_hit ? '✅' : '❌'} | Risk Score: {trapResult.risk_score}
        </div>
      )}
      <div style={{ marginTop: 24, background: '#fef2f2', borderRadius: 8, padding: '1em' }}>
        <h4 style={{ color: '#be185d' }}>Test Trap Value</h4>
        <input
          type="text"
          value={testTrapValue}
          onChange={e => setTestTrapValue(e.target.value)}
          placeholder="Paste trap token here"
          style={{ padding: '0.4em', minWidth: 220, marginRight: 8 }}
        />
        <button onClick={handleTestTrapValue} disabled={trapTestLoading} style={{ padding: '0.4em 1em', background: '#be185d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {trapTestLoading ? 'Testing...' : 'Test Trap Usage'}
        </button>
        {trapTestResult && <div style={{ marginTop: 8, color: trapTestResult.includes('hit') ? '#be185d' : '#2563eb' }}>{trapTestResult}</div>}
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

export default PartnerTestPanel; 