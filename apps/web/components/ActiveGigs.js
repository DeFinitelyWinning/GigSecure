"use client";
import React, { useState, useEffect } from 'react';
import { cancelGigEscrow } from '../lib/xrpl/escrow';
import { useWalletManager } from '../hooks/useWalletManager';

export default function ActiveGigs() {
  const { wallet, client } = useWalletManager();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleCancel = async (gig) => {
    const confirmCancel = confirm("Are you sure you want to dispute and cancel this gig? Funds will be returned to the client.");
    if (!confirmCancel) return;

    setLoading(true);
    try {
      const result = await cancelGigEscrow(client, wallet || { address: 'rMock...' }, {
        ownerAddress: wallet?.address || 'rMockWalletAddress12345Demo',
        sequence: gig.sequence,
        isMock: gig.isMock
      });

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        alert("Escrow Cancelled. Funds refunded to Client.");
        localStorage.removeItem(`gig_${gig.sequence}`);
        setGigs(gigs.filter(g => g.sequence !== gig.sequence));
      }
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Cancellation failed. On the live network, you must wait for the CancelAfter time to pass.");
    } finally {
      setLoading(false);
    }
  };

  if (gigs.length === 0) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Active Gig Contracts</h2>
      <div className="space-y-4">
        {gigs.map((gig) => (
          <div key={gig.sequence} className="p-4 bg-white shadow-sm rounded border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="font-mono text-sm text-blue-600">Sequence: {gig.sequence}</p>
              <p className="text-gray-700">Amount: <strong>{gig.amount} XRP</strong></p>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {gig.isMock ? "MOCK TRANSACTION" : "ON-CHAIN"}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert(`Release Key: ${gig.fulfillment}`)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
              >
                Get Key
              </button>
              <button 
                onClick={() => handleCancel(gig)}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 disabled:bg-gray-400"
              >
                {loading ? "Processing..." : "Dispute/Cancel"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}