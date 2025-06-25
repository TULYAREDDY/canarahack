import React from 'react';

function StatusBadge({ status }) {
  const isHealthy = status === 'running';
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.5em 1em',
      borderRadius: '1em',
      background: isHealthy ? '#22c55e' : '#ef4444',
      color: '#fff',
      fontWeight: 600,
      fontSize: '1em',
      marginLeft: '1em'
    }}>
      {isHealthy ? 'Healthy' : 'Unhealthy'}
    </span>
  );
}

export default StatusBadge; 