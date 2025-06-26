import React from 'react';

function ActivityLog({ logs }) {
  return (
    <div style={{
      margin: '2em 0',
      maxHeight: 180,
      overflowY: 'auto',
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      padding: '1em',
      fontSize: '0.95em',
      minHeight: 80
    }}>
      <h3 style={{ marginTop: 0 }}>Activity Log</h3>
      {logs.length === 0 && <div style={{ color: '#888' }}>No activity yet.</div>}
      {logs.slice(-5).reverse().map((log, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ marginRight: 8 }}>
            {log.type === 'success' ? '✔️' : log.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span style={{ flex: 1 }}>{log.message}</span>
          <span style={{ color: '#999', fontSize: '0.85em', marginLeft: 8 }}>
            {log.timestamp}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ActivityLog; 