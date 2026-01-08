"use client";
import React, { useState, useEffect } from 'react';

export default function TransactionLog({ lastResponse }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (lastResponse) {
      setLogs(prev => [lastResponse, ...prev].slice(0, 5));
    }
  }, [lastResponse]);

  return (
    <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700 font-mono text-[10px] text-emerald-400 overflow-auto max-h-64">
      <h3 className="text-white mb-2 uppercase">XRPL Live Feed</h3>
      {logs.length === 0 && <p className="text-slate-500 italic">Waiting for transactions...</p>}
      {logs.map((log, i) => (
        <div key={i} className="mb-2 border-b border-slate-800 pb-2">
          <p className="text-blue-400">[{new Date().toLocaleTimeString()}] Result: {log.result?.meta?.TransactionResult || "UNKNOWN"}</p>
          <pre>{JSON.stringify(log.result?.tx_json || log, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}