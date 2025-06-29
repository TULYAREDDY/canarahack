import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import WatermarkForm from '../components/WatermarkForm.jsx';
import HoneytokenViewer from '../components/HoneytokenViewer.jsx';
import PolicyBuilder from '../components/PolicyBuilder.jsx';
import ActivityLog from '../components/ActivityLog.jsx';
import ConsentDashboard from '../components/ConsentDashboard.jsx';
import PartnerDataRequest from '../components/PartnerDataRequest.jsx';
import AdminPanel from '../components/AdminPanel.jsx';
import PartnerTestPanel from '../components/PartnerTestPanel.jsx';
import TrapInjector from '../components/TrapInjector.jsx';
import PartnerDashboard from '../components/PartnerDashboard.jsx';
import { AdminErrorBoundary } from '../components/AdminPanel.jsx';

function Dashboard() {
  const [role, setRole] = useState('user');
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);
  const [latestWatermark, setLatestWatermark] = useState('');
  const [latestPolicy, setLatestPolicy] = useState(null);
  const [latestHoneytoken, setLatestHoneytoken] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('error'));
  }, []);

  const addLog = (message, type = 'info') => {
    setLogs(logs => [
      ...logs,
      {
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Capture latest results for partner view
  const handleWatermark = (value) => setLatestWatermark(value);
  const handlePolicy = (value) => setLatestPolicy(value);
  const handleHoneytoken = (value) => setLatestHoneytoken(value);

  const downloadLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/access_log');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'access_log.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      addLog('Failed to download logs', 'error');
    }
  };

  // Admin login handler
  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') setAdminAuth(true);
    else alert('Incorrect password');
  };

  // Reset admin auth on role change
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setAdminAuth(false);
    setAdminPassword('');
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2em 1em', background: '#f8fafc', borderRadius: 12, boxShadow: '0 2px 16px #e0e7ef' }}>
      {/* Role Selector */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: '1.1em', color: '#2563eb' }}>Select Role:</span>
        <select value={role} onChange={handleRoleChange} style={{ padding: '0.5em 1em', borderRadius: 6, border: '1px solid #cbd5e1', fontWeight: 500 }}>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="partner">Partner</option>
        </select>
      </div>

      {/* Admin Login */}
      {role === 'admin' && !adminAuth && (
        <div style={{ marginBottom: 20 }}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={adminPassword}
            onChange={e => setAdminPassword(e.target.value)}
            style={{ padding: '0.5em 1em', borderRadius: 6, border: '1px solid #cbd5e1', marginRight: 8 }}
          />
          <button onClick={handleAdminLogin} style={{ padding: '0.5em 1.2em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>Login</button>
        </div>
      )}

      {/* Admin View */}
      {role === 'admin' && adminAuth && (
        <AdminErrorBoundary>
          <AdminPanel addLog={addLog} />
          <TrapInjector />
          <button onClick={downloadLogs} style={{ marginBottom: 16, padding: '0.5em 1em', background: '#e0e7ef', border: 'none', borderRadius: 6, fontWeight: 500 }}>
            Download Logs
          </button>
          <ActivityLog logs={logs} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2em', gap: '1em' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Welcome to the Data Sentinel Platform</h2>
            <StatusBadge status={status} />
          </div>
          <WatermarkForm addLog={addLog} onResult={handleWatermark} />
          <HoneytokenViewer addLog={addLog} onResult={handleHoneytoken} />
        </AdminErrorBoundary>
      )}

      {/* User View */}
      {role === 'user' && <ConsentDashboard />}

      {/* Partner View */}
      {role === 'partner' && <PartnerDashboard />}
    </div>
  );
}

export default Dashboard; 