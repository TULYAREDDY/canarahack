import React, { useState } from 'react';
import DataRequestForm from './DataRequestForm.jsx';
import PartnerTestPanel from './PartnerTestPanel.jsx';

function PartnerDashboard() {
  const [partnerId, setPartnerId] = useState('partner1');

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      {/* Partner Selector */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <label style={{ fontWeight: 600, fontSize: '1.1em', color: '#2563eb' }}>Select Partner:</label>
        <select value={partnerId} onChange={e => setPartnerId(e.target.value)} style={{ padding: '0.5em 1em', borderRadius: 6, border: '1px solid #cbd5e1', fontWeight: 500 }}>
          <option value="partner1">Partner 1</option>
          <option value="partner2">Partner 2</option>
        </select>
      </div>
      {/* Data Request Form */}
      <DataRequestForm partnerId={partnerId} />
      {/* Trap Test Panel */}
      <PartnerTestPanel partnerId={partnerId} />
    </div>
  );
}

export default PartnerDashboard; 