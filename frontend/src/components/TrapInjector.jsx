import React, { useState } from 'react';
import { trapInject } from './api.js';

function TrapInjector() {
  const [originalDoc, setOriginalDoc] = useState('');
  const [trapType, setTrapType] = useState('email');
  const [redactedDoc, setRedactedDoc] = useState('');
  const [trapValue, setTrapValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInjectTrap = async () => {
    if (!originalDoc.trim()) {
      setError('Please enter a document to process');
      return;
    }
    setLoading(true);
    setError('');
    setRedactedDoc('');
    setTrapValue('');
    try {
      const { ok, data } = await trapInject(originalDoc, trapType);
      if (ok) {
        setRedactedDoc(data.redacted_document);
        setTrapValue(data.trap_value);
      } else {
        setError(data.error || 'Failed to inject trap');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleCopy = async () => {
    if (redactedDoc) {
      try {
        await navigator.clipboard.writeText(redactedDoc);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError('Failed to copy to clipboard');
      }
    }
  };

  const handleDemo = () => {
    setOriginalDoc(`Dear Partner,

We are sharing sensitive user data for your analysis:

User: John Smith
Email: john.smith@company.com
Phone: +1-555-123-4567
ID: 12345

Please handle this data securely.

Best regards,
Data Team`);
    setTrapType('email');
  };

  return (
    <div style={{ margin: '2em 0', background: '#f0f9ff', borderRadius: 10, padding: '2em', boxShadow: '0 2px 8px #e0e7ef' }}>
      <h3 style={{ color: '#2563eb' }}>Document Trap Injector</h3>
      <p style={{ color: '#64748b', marginBottom: 16 }}>
        Paste sensitive documents to automatically inject honeytokens and create safe versions for sharing.
      </p>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Trap Type:</label>
        <select 
          value={trapType} 
          onChange={e => setTrapType(e.target.value)}
          style={{ padding: '0.5em', borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 120 }}
        >
          <option value="email">Email Address</option>
          <option value="phone">Phone Number</option>
          <option value="name">Full Name</option>
          <option value="id">ID Number</option>
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Original Document:</label>
        <textarea
          value={originalDoc}
          onChange={e => setOriginalDoc(e.target.value)}
          placeholder="Paste your sensitive document here..."
          style={{ 
            width: '100%', 
            minHeight: 120, 
            padding: '0.8em', 
            borderRadius: 6, 
            border: '1px solid #cbd5e1',
            fontFamily: 'monospace',
            fontSize: '0.9em'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button 
          onClick={handleInjectTrap} 
          disabled={loading}
          style={{ 
            padding: '0.6em 1.2em', 
            background: '#be185d', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 6, 
            fontWeight: 600 
          }}
        >
          {loading ? 'Injecting...' : 'Inject Trap'}
        </button>
        <button 
          onClick={handleDemo}
          style={{ 
            padding: '0.6em 1.2em', 
            background: '#e0e7ef', 
            color: '#333', 
            border: 'none', 
            borderRadius: 6, 
            fontWeight: 600 
          }}
        >
          Load Demo
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}

      {trapValue && (
        <div style={{ marginBottom: 16, background: '#fef3c7', borderRadius: 6, padding: '0.8em' }}>
          <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 4 }}>⚠️ Trap Value (Admin Only):</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.9em', color: '#92400e' }}>{trapValue}</div>
        </div>
      )}

      {redactedDoc && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontWeight: 600 }}>Redacted Document (Safe to Share):</label>
            <button 
              onClick={handleCopy}
              style={{ 
                padding: '0.4em 0.8em', 
                background: copied ? '#16a34a' : '#2563eb', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 4, 
                fontWeight: 600,
                fontSize: '0.9em'
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            value={redactedDoc}
            readOnly
            style={{ 
              width: '100%', 
              minHeight: 120, 
              padding: '0.8em', 
              borderRadius: 6, 
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default TrapInjector; 