import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function WatermarkDecodeLogTable() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/decode_log').then(res => setLogs(res.data));
  }, []);

  const minHash = (hash) => {
    if (!hash) return '';
    if (hash.length <= 12) return hash;
    return hash.slice(0, 8) + '...' + hash.slice(-4);
  };

  return (
    <div className="mt-6 border rounded p-4 shadow bg-white" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 className="text-lg font-bold mb-3">📜 Watermark Decode Attempts</h2>
      <table className="w-full border text-sm" style={{ width: '100%' }}>
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Leaked Hash</th>
            <th className="p-2">Culprit</th>
            <th className="p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan={3} className="p-2 text-gray-500">No admin alerts or restriction requests.</td></tr>
          ) : logs.map((log, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2 text-xs break-all">{minHash(log.leaked)}</td>
              <td className="p-2">{log.culprit}</td>
              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 