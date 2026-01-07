"use client";
import React, { useState, useEffect } from 'react';

export default function ActiveGigs() {
  const [gigs, setGigs] = useState([]);

  // Load all gigs from localStorage on component mount
  useEffect(() => {
    const savedGigs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('gig_')) {
        savedGigs.push(JSON.parse(localStorage.getItem(key)));
      }
    }
    setGigs(savedGigs);
  }, []);

  if (gigs.length === 0) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Active Gig Contracts (Simulated)</h2>
      <div className="space-y-4">
        {gigs.map((gig) => (
          <div key={gig.sequence} className="p-4 bg-white shadow-sm rounded border flex justify-between items-center">
            <div>
              <p className="font-mono text-sm text-blue-600">Sequence: {gig.sequence}</p>
              <p className="text-gray-700">Amount: <strong>{gig.amount} XRP</strong></p>
              <p className="text-xs text-gray-400 italic mt-1">Condition: {gig.condition.substring(0, 30)}...</p>
            </div>
            <button 
              onClick={() => alert(`Release Key (Fulfillment):\n${gig.fulfillment}`)}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >
              Reveal Release Key
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}