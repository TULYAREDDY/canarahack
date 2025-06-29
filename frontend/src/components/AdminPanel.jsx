import React, { useEffect, useState } from 'react';
import { getWithAuth, postWithAuth, getTrapLogs, getRestrictedPartners, getRiskScoreTraits, getPartnerTraits } from './api.js';
import UserAccessLogViewer from './UserAccessLogViewer.jsx';

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <h2 style={{ color: 'red' }}>Something went wrong in the admin panel.</h2>;
    }
    return this.props.children;
  }
}

function AdminPanel({ addLog }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restricting, setRestricting] = useState('');
  // Trap logs state
  const [trapLogs, setTrapLogs] = useState([]);
  const [trapLogsOpen, setTrapLogsOpen] = useState(false);
  const [trapLogsLoading, setTrapLogsLoading] = useState(false);
  // Restricted partners state
  const [restrictedPartners, setRestrictedPartners] = useState(null);
  const [restrictedOpen, setRestrictedOpen] = useState(false);
  const [restrictedLoading, setRestrictedLoading] = useState(false);
  const [riskPartnerId, setRiskPartnerId] = useState('partner1');
  const [risk, setRisk] = useState(null);
  const [traits, setTraits] = useState([]);
  const [riskLoading, setRiskLoading] = useState(false);
  const [traitsLoading, setTraitsLoading] = useState(false);
  const [riskError, setRiskError] = useState('');
  const [selectedUser, setSelectedUser] = useState('user1');
  const [userTrapLogs, setUserTrapLogs] = useState([]);
  const [userRestrictedPartners, setUserRestrictedPartners] = useState([]);

  // Move fetchAlerts out of useEffect
  const fetchAlerts = async () => {
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
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Fetch trap logs and restricted partners for selected user
  useEffect(() => {
    async function fetchUserData() {
      const [trapRes, restrictRes] = await Promise.all([
        getWithAuth(`/user_trap_logs/${selectedUser}`),
        getWithAuth(`/user_restricted_partners/${selectedUser}`)
      ]);
      setUserTrapLogs(trapRes.ok ? trapRes.data : []);
      setUserRestrictedPartners(restrictRes.ok ? restrictRes.data : []);
    }
    fetchUserData();
  }, [selectedUser]);

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

  // Trap logs handlers
  const handleViewTrapLogs = async () => {
    setTrapLogsOpen(!trapLogsOpen);
    if (!trapLogsOpen) {
      setTrapLogsLoading(true);
      const { ok, data } = await getTrapLogs();
      if (ok) setTrapLogs(data);
      setTrapLogsLoading(false);
    }
  };

  // Restricted partners handlers
  const handleViewRestricted = async () => {
    setRestrictedOpen(!restrictedOpen);
    if (!restrictedOpen) {
      setRestrictedLoading(true);
      const { ok, data } = await getRestrictedPartners();
      if (ok) setRestrictedPartners(data);
      setRestrictedLoading(false);
    }
  };

  const handleGetRisk = async () => {
    setRiskLoading(true);
    setRiskError('');
    try {
      const { ok, data } = await getRiskScoreTraits(riskPartnerId);
      if (ok) {
        setRisk(data.score);
        setTraits(data.traits || []);
      } else {
        setRiskError(data.error || 'Failed to fetch risk');
      }
    } catch {
      setRiskError('Network error');
    }
    setRiskLoading(false);
  };

  const handleGetTraits = async () => {
    setTraitsLoading(true);
    setRiskError('');
    try {
      const { ok, data } = await getPartnerTraits(riskPartnerId);
      if (ok) setTraits(data.traits || []);
      else setRiskError(data.error || 'Failed to fetch traits');
    } catch {
      setRiskError('Network error');
    }
    setTraitsLoading(false);
  };

  // Defensive defaults
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeTrapLogs = Array.isArray(trapLogs) ? trapLogs : [];
  const safeRestrictedPartners = Array.isArray(restrictedPartners) ? restrictedPartners : [];
  const safeUserTrapLogs = Array.isArray(userTrapLogs) ? userTrapLogs : [];
  const safeUserRestrictedPartners = Array.isArray(userRestrictedPartners) ? userRestrictedPartners : [];

  return (
    <div style={{ margin: '2em 0', background: '#f8fafc', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef' }}>
      <button onClick={fetchAlerts} style={{ marginBottom: 12, padding: '0.4em 1em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
        🔄 Refresh Alerts
      </button>
      <h3 style={{ color: '#be185d' }}>Admin Panel: Restriction Requests & Alerts</h3>
      {/* User selection for logs */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>View User Logs:</label>
        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} style={{ padding: '0.4em 1em', borderRadius: 6 }}>
          <option value="user1">user1</option>
          <option value="user2">user2</option>
          <option value="user3">user3</option>
        </select>
      </div>
      {/* Partner Risk Intelligence Section */}
      <div style={{ marginBottom: 32, background: '#f0f9ff', borderRadius: 8, padding: '1em' }}>
        <h4 style={{ color: '#2563eb' }}>🧠 Partner Risk Intelligence</h4>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontWeight: 600 }}>Partner:</label>
          <select value={riskPartnerId} onChange={e => setRiskPartnerId(e.target.value)} style={{ padding: '0.5em', borderRadius: 6, minWidth: 120 }}>
            <option value="partner1">Partner 1</option>
            <option value="partner2">Partner 2</option>
          </select>
          <button onClick={handleGetRisk} disabled={riskLoading} style={{ padding: '0.5em 1em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
            {riskLoading ? 'Loading...' : 'Get Risk Score'}
          </button>
        </div>
        {risk !== null && (
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            Risk Score: <span style={{ color: risk >= 85 ? '#dc2626' : risk >= 50 ? '#facc15' : '#16a34a' }}>{risk}</span>
            {risk >= 85 && <span style={{ color: '#dc2626', marginLeft: 8 }}>⚠ Partner exceeds risk threshold!</span>}
          </div>
        )}
        {traits.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            Traits: {traits.map((t, i) => (
              <span key={i} style={{ background: '#e0e7ef', color: '#2563eb', borderRadius: 6, padding: '0.2em 0.7em', marginRight: 6, fontWeight: 600, fontSize: '0.95em' }}>{t}</span>
            ))}
          </div>
        )}
        {riskError && <div style={{ color: 'red', marginTop: 8 }}>{riskError}</div>}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {safeAlerts.length === 0 && !loading && <div style={{ color: '#888' }}>No admin alerts or restriction requests.</div>}
      {safeAlerts.map((a, i) => {
        // Only show block button for escalation alerts and if not already restricted
        const isEscalation = a.type === 'user_escalation';
        const isRestricted = safeUserRestrictedPartners.includes(a.partner);
        return (
          <div key={i} style={{ background: isEscalation ? '#fef2f2' : '#f0fdf4', borderLeft: isEscalation ? '5px solid #be185d' : '5px solid #22c55e', borderRadius: 8, padding: '1em', margin: '1em 0', boxShadow: '0 1px 4px #e0e7ef' }}>
            <div style={{ fontWeight: 600 }}>{a.message}</div>
            <div style={{ color: '#888', fontSize: '0.95em' }}>Partner: {a.partner} {a.risk_score !== undefined ? `| Risk: ${a.risk_score}` : ''}</div>
            {isEscalation && !isRestricted && (
              <button
                onClick={async () => {
                  setRestricting(a.partner);
                  await postWithAuth('/restrict_access', { partner_id: a.partner, user_id: a.user, action: 'block' });
                  alert(`Partner ${a.partner} blocked for user ${a.user}`);
                  setRestricting('');
                  fetchAlerts();
                }}
                disabled={restricting === a.partner}
                style={{ marginTop: 8, padding: '0.4em 1em', background: '#be185d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}
              >
                {restricting === a.partner ? 'Blocking...' : 'Block/Restrict Partner'}
              </button>
            )}
            {isEscalation && isRestricted && (
              <div style={{ marginTop: 8, color: '#16a34a', fontWeight: 600 }}>Partner already restricted for this user.</div>
            )}
          </div>
        );
      })}
      {/* Trap Logs Section */}
      {safeUserTrapLogs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#be185d' }}>Trap Logs for {selectedUser}</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f0fdf4' }}>
                <th style={{ textAlign: 'left', padding: 6 }}>Partner</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {safeUserTrapLogs.map((log, i) => (
                <tr key={i}>
                  <td style={{ padding: 6 }}>{log.partner}</td>
                  <td style={{ padding: 6 }}>{log.timestamp}</td>
                  <td style={{ padding: 6 }}>{log.risk_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Restricted Partners Section */}
      {safeUserRestrictedPartners.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#dc2626' }}>Restricted Partners for {selectedUser}</h4>
          <ul style={{ paddingLeft: 20 }}>
            {safeUserRestrictedPartners.map((p, i) => (
              <li key={i} style={{ color: '#dc2626', fontWeight: 600 }}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Trap Logs Viewer */}
      <div style={{ marginTop: 32 }}>
        <button onClick={handleViewTrapLogs} style={{ padding: '0.5em 1.2em', background: '#facc15', color: '#333', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12 }}>
          {trapLogsOpen ? 'Hide Trap Logs' : 'View Trap Logs'}
        </button>
        {trapLogsOpen && (
          <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: '1em', boxShadow: '0 1px 4px #e0e7ef' }}>
            <h4 style={{ color: '#be185d' }}>Trap Logs</h4>
            {trapLogsLoading ? <div>Loading trap logs...</div> : safeTrapLogs.length === 0 ? <div style={{ color: '#888' }}>No trap logs found.</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr style={{ background: '#f0fdf4' }}>
                    <th style={{ textAlign: 'left', padding: 6 }}>Partner</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>User</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>IP</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Timestamp</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {safeTrapLogs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ padding: 6 }}>{log.partner}</td>
                      <td style={{ padding: 6 }}>{log.user}</td>
                      <td style={{ padding: 6 }}>{log.ip}</td>
                      <td style={{ padding: 6 }}>{log.timestamp}</td>
                      <td style={{ padding: 6 }}>{log.risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      {/* Restricted Partners Viewer */}
      <div style={{ marginTop: 24 }}>
        <button onClick={handleViewRestricted} style={{ padding: '0.5em 1.2em', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, marginRight: 12 }}>
          {restrictedOpen ? 'Hide Restricted Partners' : 'Restricted Partners'}
        </button>
        {restrictedOpen && (
          <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: '1em', boxShadow: '0 1px 4px #e0e7ef' }}>
            <h4 style={{ color: '#dc2626' }}>Restricted Partners</h4>
            {restrictedLoading ? <div>Loading restricted partners...</div> : !restrictedPartners || Object.keys(restrictedPartners).length === 0 ? <div style={{ color: '#888' }}>No restricted partners found.</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr style={{ background: '#fef2f2' }}>
                    <th style={{ textAlign: 'left', padding: 6 }}>Partner</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Blocked Users</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(restrictedPartners).map(([partner, users], i) => (
                    <tr key={i}>
                      <td style={{ padding: 6 }}>{partner}</td>
                      <td style={{ padding: 6 }}>{users.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      
      {/* User Access History Tracker */}
      <UserAccessLogViewer />
    </div>
  );
}

export default AdminPanel; 