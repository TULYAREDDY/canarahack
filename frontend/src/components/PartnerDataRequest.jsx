import React, { useState } from 'react';
import { postWithAuth } from './api.js';

function PartnerDataRequest({ addLog }) {
  const [partnerId, setPartnerId] = useState('Partner1');
  const [purpose, setPurpose] = useState('Demo Access');
  const [daysValid, setDaysValid] = useState('30');
  const [region, setRegion] = useState('IN');
  const [userIds, setUserIds] = useState('user1,user2');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const requested_users = userIds.split(',').map(u => u.trim()).filter(Boolean);
      const { ok, data } = await postWithAuth('/partner_request_data', {
        partner_id: partnerId,
        region,
        requested_users,
        purpose
      });
      if (ok) {
        setResult(data);
        addLog(`\u2714\ufe0f Partner accessed user data (secure)`, 'success');
      } else {
        setError(data.error || 'Access Denied');
        addLog(`\u274c Partner access denied (${data.error || 'error'})`, 'error');
      }
    } catch (err) {
      setError('Network error');
      addLog('\u274c Partner data request failed (network error)', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ margin: '2em 0', background: '#f0f9ff', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef' }}>
      <h3 style={{ color: '#2563eb' }}>Request User Data (Secure)</h3>
      <form onSubmit={handleRequest} style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1em' }}>
        <input type="text" value={partnerId} onChange={e => setPartnerId(e.target.value)} placeholder="Partner ID" style={{ padding: '0.5em', minWidth: 100 }} required />
        <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Purpose" style={{ padding: '0.5em', minWidth: 120 }} required />
        <input type="number" value={daysValid} onChange={e => setDaysValid(e.target.value)} placeholder="Days Valid" style={{ padding: '0.5em', minWidth: 80 }} required />
        <input type="text" value={region} onChange={e => setRegion(e.target.value)} placeholder="Region" style={{ padding: '0.5em', minWidth: 80 }} required />
        <input type="text" value={userIds} onChange={e => setUserIds(e.target.value)} placeholder="User IDs (comma separated)" style={{ padding: '0.5em', minWidth: 160 }} required />
        <button type="submit" disabled={loading} style={{ padding: '0.5em 1.5em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {loading ? 'Requesting...' : 'Request Data'}
        </button>
      </form>
      {result && (
        <div style={{ background: '#fff', borderRadius: 8, padding: '1em', boxShadow: '0 1px 4px #e0e7ef', marginTop: 16 }}>
          <h4 style={{ color: '#16a34a' }}>User Data Access Results</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f0fdf4' }}>
                <th style={{ textAlign: 'left', padding: 6 }}>User</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Expiry</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([user, info]) => (
                <tr key={user}>
                  <td style={{ padding: 6 }}>{user}</td>
                  <td style={{ padding: 6 }}>{info.status}</td>
                  <td style={{ padding: 6 }}>{info.expiry || '-'}</td>
                  <td style={{ padding: 6 }}>{info.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
    </div>
  );
}

export default PartnerDataRequest; 