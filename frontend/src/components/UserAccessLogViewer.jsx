import React, { useState, useEffect } from 'react';
import { getUserAccessHistory } from './api.js';

function UserAccessLogViewer() {
  const [userId, setUserId] = useState('user1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userOptions = [
    { value: 'user1', label: 'User 1' },
    { value: 'user2', label: 'User 2' },
    { value: 'user3', label: 'User 3' },
  ];

  // Fetch access history when user changes
  useEffect(() => {
    fetchAccessHistory();
  }, [userId]);

  // Filter logs when dates or logs change
  useEffect(() => {
    filterLogs();
  }, [logs, startDate, endDate]);

  const fetchAccessHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await getUserAccessHistory(userId);
      if (ok) {
        setLogs(data);
      } else {
        setError(data.error || 'Failed to fetch access history');
      }
    } catch (err) {
      setError('Network error - check backend connection');
    }
    setLoading(false);
  };

  const filterLogs = () => {
    let filtered = [...logs];
    
    if (startDate) {
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= new Date(startDate);
      });
    }
    
    if (endDate) {
      filtered = filtered.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime <= new Date(endDate + 'T23:59:59');
      });
    }
    
    setFilteredLogs(filtered);
  };

  const downloadCSV = () => {
    const headers = ["Partner", "Timestamp", "IP", "Trap Triggered", "Purpose", "Region"];
    const rows = filteredLogs.map(log => [
      log.partner,
      new Date(log.timestamp).toLocaleString(),
      log.ip,
      log.trap_triggered ? "YES" : "NO",
      log.purpose || "N/A",
      log.region || "N/A"
    ]);
    
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${userId}_access_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hasTrapTriggered = filteredLogs.some(log => log.trap_triggered);

  return (
    <div style={{ margin: '2em 0', background: '#f8fafc', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef' }}>
      <h3 style={{ color: '#2563eb', marginBottom: 20 }}>📋 User Access History Tracker</h3>
      
      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20, alignItems: 'center' }}>
        <div>
          <label style={{ fontWeight: 600, marginRight: 8 }}>User:</label>
          <select 
            value={userId} 
            onChange={e => setUserId(e.target.value)}
            style={{ padding: '0.5em', borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 120 }}
          >
            {userOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ fontWeight: 600, marginRight: 8 }}>From:</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            style={{ padding: '0.5em', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, marginRight: 8 }}>To:</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            style={{ padding: '0.5em', borderRadius: 6, border: '1px solid #cbd5e1' }}
          />
        </div>
        
        <button 
          onClick={downloadCSV} 
          disabled={filteredLogs.length === 0}
          style={{ 
            padding: '0.5em 1em', 
            background: '#16a34a', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 6, 
            fontWeight: 600,
            cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer',
            opacity: filteredLogs.length === 0 ? 0.5 : 1
          }}
        >
          📥 Export CSV ({filteredLogs.length} records)
        </button>
      </div>

      {/* Trap Alert */}
      {hasTrapTriggered && (
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: 8, 
          padding: '1em', 
          marginBottom: 16,
          color: '#dc2626',
          fontWeight: 600
        }}>
          🚨 Alert: Trap triggered in this user's access history!
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2em', color: '#64748b' }}>
          Loading access history...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          Error: {error}
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && (
        <div style={{ marginBottom: 16, color: '#64748b' }}>
          Showing {filteredLogs.length} of {logs.length} total records
          {hasTrapTriggered && (
            <span style={{ color: '#dc2626', marginLeft: 8 }}>
              • {filteredLogs.filter(log => log.trap_triggered).length} trap(s) detected
            </span>
          )}
        </div>
      )}

      {/* Access Logs Table */}
      {!loading && !error && filteredLogs.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px #e0e7ef' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Partner</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Timestamp</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>IP Address</th>
                <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Trap</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Purpose</th>
                <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Region</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr 
                  key={index} 
                  style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    background: log.trap_triggered ? '#fef2f2' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 500 }}>{log.partner}</td>
                  <td style={{ padding: '12px', color: '#64748b' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.9em' }}>
                    {log.ip}
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px' }}>
                    {log.trap_triggered ? (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>✅</span>
                    ) : (
                      <span style={{ color: '#16a34a' }}>❌</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#64748b' }}>
                    {log.purpose || 'N/A'}
                  </td>
                  <td style={{ padding: '12px', color: '#64748b' }}>
                    {log.region || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredLogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2em', color: '#64748b', background: '#fff', borderRadius: 8 }}>
          No access records found for {userId}
          {(startDate || endDate) && ' in the selected date range'}
        </div>
      )}
    </div>
  );
}

export default UserAccessLogViewer; 