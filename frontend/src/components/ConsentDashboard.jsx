import React, { useEffect, useState } from 'react';
import { getWithAuth, postWithAuth } from './api.js';

function ConsentDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restricting, setRestricting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [notRes, alertRes] = await Promise.all([
          getWithAuth('/user_notifications'),
          getWithAuth('/alerts/user1')
        ]);
        setNotifications(notRes.ok ? notRes.data : []);
        setAlerts(alertRes.ok ? alertRes.data : []);
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleRestrict = async (partner_id) => {
    setRestricting(true);
    try {
      await postWithAuth('/request_restriction', { partner_id, user_id: 'user1' });
      alert('Restriction request sent to admin!');
    } catch (err) {
      alert('Failed to send restriction request.');
    }
    setRestricting(false);
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3 style={{ color: '#2563eb' }}>User Consent Dashboard</h3>
      {loading && <div>Loading notifications...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#be185d' }}>Alerts</h4>
          {alerts.map((a, i) => (
            <div key={i} style={{ background: '#fef2f2', borderLeft: '5px solid #be185d', borderRadius: 8, padding: '1em', margin: '1em 0', boxShadow: '0 1px 4px #e0e7ef' }}>
              <div style={{ fontWeight: 600 }}>{a.message}</div>
              <div style={{ color: '#888', fontSize: '0.95em' }}>Partner: {a.partner} | Risk: {a.risk}</div>
              <button
                onClick={() => handleRestrict(a.partner)}
                disabled={restricting}
                style={{ marginTop: 8, padding: '0.4em 1em', background: '#be185d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}
              >
                {restricting ? 'Requesting...' : 'Request Admin to Restrict Access'}
              </button>
            </div>
          ))}
        </div>
      )}
      {notifications.length === 0 && !loading && <div style={{ color: '#888' }}>No notifications yet.</div>}
      {notifications.map((n, i) => (
        <div key={i} style={{ background: '#f0fdf4', borderLeft: '5px solid #22c55e', borderRadius: 8, padding: '1em', margin: '1em 0', boxShadow: '0 1px 4px #e0e7ef' }}>
          <div style={{ fontWeight: 600 }}>{n.message}</div>
          <div style={{ color: '#888', fontSize: '0.95em' }}>{n.timestamp}</div>
        </div>
      ))}
    </div>
  );
}

export default ConsentDashboard; 