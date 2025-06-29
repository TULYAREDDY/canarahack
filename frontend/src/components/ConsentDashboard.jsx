import React, { useEffect, useState } from 'react';
import { getWithAuth, postWithAuth, getConsent, updateConsent, requestAdminAction } from './api.js';

function ConsentDashboard() {
  const [selectedUser, setSelectedUser] = useState('user1');
  const [consent, setConsent] = useState(null);
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restricting, setRestricting] = useState(false);
  const [trapLogs, setTrapLogs] = useState([]);
  const [restrictedPartners, setRestrictedPartners] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [notRes, alertRes, trapRes, restrictRes] = await Promise.all([
          getWithAuth(`/user_notifications?user_id=${selectedUser}`),
          getWithAuth(`/alerts/${selectedUser}`),
          getWithAuth(`/user_trap_logs/${selectedUser}`),
          getWithAuth(`/user_restricted_partners/${selectedUser}`)
        ]);
        setNotifications(notRes.ok ? notRes.data : []);
        setAlerts(alertRes.ok ? alertRes.data : []);
        setTrapLogs(trapRes.ok ? trapRes.data : []);
        setRestrictedPartners(restrictRes.ok ? restrictRes.data : []);
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    }
    fetchData();
  }, [selectedUser]);

  useEffect(() => {
    async function fetchConsent() {
      setConsentLoading(true);
      setConsentError('');
      const { ok, data } = await getConsent(selectedUser);
      if (ok) setConsent(data);
      else setConsentError(data.error || 'Error fetching consent');
      setConsentLoading(false);
    }
    fetchConsent();
  }, [selectedUser]);

  const handleConsentChange = (field) => (e) => {
    setConsent({ ...consent, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const handleConsentSave = async () => {
    setConsentLoading(true);
    setConsentError('');
    const { ok, data } = await updateConsent(selectedUser, consent);
    if (ok) setConsent(data);
    else setConsentError(data.error || 'Error updating consent');
    setConsentLoading(false);
  };

  const handleRestrict = async (partner_id) => {
    setRestricting(true);
    try {
      await postWithAuth('/request_restriction', { partner_id, user_id: selectedUser });
      alert('Restriction request sent to admin!');
    } catch (err) {
      alert('Failed to send restriction request.');
    }
    setRestricting(false);
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <h3 style={{ color: '#2563eb' }}>User Consent Dashboard</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>Select User:</label>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ padding: '0.4em 1em', borderRadius: 6 }}>
          <option value="user1">user1</option>
          <option value="user2">user2</option>
          <option value="user3">user3</option>
        </select>
      </div>
      {consentLoading ? (
        <div>Loading consent...</div>
      ) : consentError ? (
        <div style={{ color: 'red' }}>{consentError}</div>
      ) : consent ? (
        <div style={{ background: '#f3f3f3', borderRadius: 8, padding: '1em', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 8 }}>
            <label><input type="checkbox" checked={!!consent.watermark} onChange={handleConsentChange('watermark')} /> Watermark</label>
            <label><input type="checkbox" checked={!!consent.policy} onChange={handleConsentChange('policy')} /> Policy</label>
            <label><input type="checkbox" checked={!!consent.honeytoken} onChange={handleConsentChange('honeytoken')} /> Honeytoken</label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Policy Expiry: <input type="date" value={consent.expiry_date || ''} onChange={handleConsentChange('expiry_date')} style={{ padding: '0.3em 0.7em', borderRadius: 4, border: '1px solid #ccc' }} /></label>
          </div>
          <button onClick={handleConsentSave} disabled={consentLoading} style={{ padding: '0.4em 1.2em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
            {consentLoading ? 'Saving...' : 'Save Consent'}
          </button>
        </div>
      ) : null}
      {/* Alerts and notifications below */}
      {loading && <div>Loading notifications...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#be185d' }}>Alerts</h4>
          {alerts.map((a, i) => (
            <div key={i} style={{ background: '#fef2f2', borderLeft: '5px solid #be185d', borderRadius: 8, padding: '1em', margin: '1em 0', boxShadow: '0 1px 4px #e0e7ef' }}>
              <div style={{ fontWeight: 600 }}>{a.message}</div>
              <div style={{ color: '#888', fontSize: '0.95em' }}>Partner: {a.partner} | Risk: {a.risk_score || a.risk}</div>
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
        <div key={i} style={{ background: (n.type === 'high_risk' || n.type === 'trap_hit') ? '#fef2f2' : '#f0fdf4', borderLeft: (n.type === 'high_risk' || n.type === 'trap_hit') ? '5px solid #be185d' : '5px solid #22c55e', borderRadius: 8, padding: '1em', margin: '1em 0', boxShadow: '0 1px 4px #e0e7ef' }}>
          <div style={{ fontWeight: 600 }}>{n.message}</div>
          <div style={{ color: '#888', fontSize: '0.95em' }}>{n.timestamp}</div>
          {(n.type === 'high_risk' || n.type === 'trap_hit') && (
            <button
              onClick={async () => {
                await requestAdminAction(selectedUser, n.partner, n.type === 'trap_hit' ? 'Trap triggered' : 'High risk access');
                alert('Request sent to admin!');
              }}
              style={{ marginTop: 8, padding: '0.4em 1em', background: '#be185d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}
            >
              Request Admin Action
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ConsentDashboard; 