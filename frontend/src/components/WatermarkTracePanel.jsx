import React, { useState } from 'react';
import axios from 'axios';

export default function WatermarkTracePanel() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleTrace = async () => {
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://localhost:5000/verify_watermark", { watermark: input });
      setResult(res.data);
    } catch (e) {
      setResult(null);
      setError("❌ No match found");
    }
  };

  const demoLeaked = "e7fcfe3349d2b32b46c86b01..."; // Replace with a real hash for demo

  return (
    <div className="p-4 border rounded shadow bg-white mt-6">
      <h2 className="text-xl font-semibold mb-2">🔍 Trace Forensic Watermark</h2>
      <input
        className="w-full p-2 mb-2 border rounded"
        placeholder="Paste leaked watermark hash here"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button onClick={handleTrace} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
        🔍 Trace Watermark
      </button>
      <button onClick={() => setInput(demoLeaked)} className="text-sm underline text-blue-600">
        Paste Sample Leak (Demo)
      </button>
      {result && result.culprit && (
        <div className="mt-4 text-green-700 font-semibold">
          ✅ Matched to: {result.culprit} <br />
          📅 Timestamp: {new Date(result.timestamp).toLocaleString()}<br />
          ⏱ Time (UTC): {new Date(result.timestamp).toUTCString()}
        </div>
      )}
      {error && <div className="mt-4 text-red-600 font-bold">{error}</div>}
    </div>
  );
} 