import React, { useState } from 'react';

export default function DataResponseSection({ data }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.watermark);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <code style={{ fontSize: '0.9em', wordBreak: 'break-all' }}>{data.watermark}</code>
      <button onClick={copyToClipboard} style={{ fontSize: '0.9em', padding: '2px 8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, marginLeft: 4 }}>
        📋 Copy
      </button>
      {copied && <span style={{ color: '#16a34a', fontSize: '0.9em', marginLeft: 4 }}>Copied!</span>}
    </div>
  );
} 