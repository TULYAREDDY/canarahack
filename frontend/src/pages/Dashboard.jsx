import React, { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import WatermarkForm from '../components/WatermarkForm.jsx';
import HoneytokenViewer from '../components/HoneytokenViewer.jsx';
import PolicyBuilder from '../components/PolicyBuilder.jsx';

function Dashboard() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2em 1em' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2em', gap: '1em' }}>
        <h2 style={{ margin: 0 }}>Welcome to the Data Sentinel Platform</h2>
        <StatusBadge status={status} />
      </div>
      <WatermarkForm />
      <HoneytokenViewer />
      <PolicyBuilder />
    </div>
  );
}

export default Dashboard; 