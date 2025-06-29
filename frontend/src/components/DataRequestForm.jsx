import React, { useState } from 'react';
import { postWithAuth } from './api.js';

const userOptions = [
  { value: 'user1', label: 'user1' },
  { value: 'user2', label: 'user2' },
  { value: 'user3', label: 'user3' },
];

function DataRequestForm({ partnerId }) {
  const [purpose, setPurpose] = useState('');
  const [region, setRegion] = useState('IN');
  const [daysValid, setDaysValid] = useState(30);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUserChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedUsers(options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    
    if (!purpose || !region || !daysValid || selectedUsers.length === 0) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    
    try {
      const { ok, data } = await postWithAuth('/partner_request_data', {
        partner_id: partnerId,
        purpose,
        region,
        days_valid: parseInt(daysValid),
        requested_users: selectedUsers,
      });
      
      if (ok) {
        setResult(data);
      } else {
        setError(data.error || 'Request failed');
      }
    } catch (err) {
      console.error('Request error:', err);
      setError('Network error - check backend connection');
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: 32, background: '#f8fafc', borderRadius: 8, padding: '1.5em', boxShadow: '0 1px 4px #e0e7ef' }}>
      <h4 style={{ color: '#2563eb', marginBottom: 12 }}>Request User Data (Secure)</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontWeight: 600 }}>Partner:</label>
          <input type="text" value={partnerId} readOnly style={{ marginLeft: 8, padding: '0.4em', borderRadius: 4, border: '1px solid #cbd5e1', background: '#f1f5f9', minWidth: 120 }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Purpose:</label>
          <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Purpose" style={{ marginLeft: 8, padding: '0.4em', borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 180 }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Region:</label>
          <select value={region} onChange={e => setRegion(e.target.value)} style={{ marginLeft: 8, padding: '0.4em', borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 80 }}>
            <option value="IN">IN</option>
            <option value="US">US</option>
            <option value="EU">EU</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>Days Valid:</label>
          <input type="number" value={daysValid} onChange={e => setDaysValid(e.target.value)} min={1} style={{ marginLeft: 8, padding: '0.4em', borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 60 }} />
        </div>
        <div>
          <label style={{ fontWeight: 600 }}>User(s):</label>
          <select 
            multiple 
            value={selectedUsers} 
            onChange={handleUserChange} 
            style={{ marginLeft: 8, padding: '0.4em', borderRadius: 4, border: '1px solid #cbd5e1', minWidth: 120, minHeight: 60 }}
          >
            {userOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.8em', color: '#64748b', marginTop: 4 }}>
            Hold Ctrl/Cmd to select multiple users
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 8, padding: '0.6em 1.2em', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600 }}>
          {loading ? 'Requesting...' : 'Request Data'}
        </button>
      </form>
      
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      
      {result && (
        <div style={{ marginTop: 16, background: '#fff', borderRadius: 8, padding: '1em', boxShadow: '0 1px 4px #e0e7ef' }}>
          <h5 style={{ color: '#16a34a' }}>Request Results</h5>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ background: '#f0fdf4' }}>
                <th style={{ textAlign: 'left', padding: 6 }}>User</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
                <th style={{ textAlign: 'left', padding: 6 }}>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([user, info]) => (
                <tr key={user}>
                  <td style={{ padding: 6 }}>{user}</td>
                  <td style={{ padding: 6 }}>{info.status === 'granted' ? 'Granted' : 'Denied'}</td>
                  <td style={{ padding: 6 }}>{info.expiry || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataRequestForm; 