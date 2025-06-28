import React, { useEffect, useState } from 'react';
import { getWithAuth, postWithAuth } from './api.js';

function AdminPanel({ addLog }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restricting, setRestricting] = useState('');

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      setError('');
      try {
        const { ok, data } = await getWithAuth('/alerts/admin');
        if (ok) setAlerts(data);
        else setError('Failed to fetch admin alerts');
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    }
    fetchAlerts();
  }, []);

  const handleRestrict = async (partner_id) => {
    setRestricting(partner_id);
    try {
      const { ok, data } = await postWithAuth('/restrict_partner_access', { partner_id });
      if (ok) {
        addLog(`✔️ Admin restricted access for ${partner_id}`, 'success');
        alert(`Access for ${partner_id} restricted!`);
      } else {
        addLog(`❌ Failed to restrict ${partner_id}`, 'error');
      }
    } catch (err) {
      addLog('❌ Restriction request failed (network error)', 'error');
    }
    setRestricting('');
  };

  return (
    <div style={{ margin: '2em 0', background: '#f8fafc', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef' }}>
      <h3 style={{ color: '#be185d' }}>Admin Panel: Restriction Requests & Alerts</h3>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {alerts.length === 0 && !loading && <div style={{ color: '#888' }}>No admin alerts or restriction requests.</div>}
      {alerts.map((a, i) => (
        <div key={i} style={{ background: '#fff', borderLeft: '5px solid #be185d', borderRadius: 8, padding: '1em', margin: '1em 0', boxShadow: '0 1px 4px #e0e7ef' }}>
          <div style={{ fontWeight: 600 }}>{a.message}</div>
          <div style={{ color: '#888', fontSize: '0.95em' }}>Partner: {a.partner} | Risk: {a.risk}</div>
          {a.message.includes('User requested restriction') && (
            <button
              onClick={() => handleRestrict(a.partner)}
              disabled={restricting === a.partner}
              style={{ marginTop: 8, padding: '0.4em 1em', background: '#be185d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}
            >
              {restricting === a.partner ? 'Restricting...' : 'Restrict Access'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminPanel; 