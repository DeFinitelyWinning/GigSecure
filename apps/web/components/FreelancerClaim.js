"use client";
import React, { useState } from 'react';
import { finishGigEscrow } from '../lib/xrpl/escrow';
import useWalletManager from '../hooks/useWalletManager';

export default function FreelancerClaim() {
  const { wallet, client, seed } = useWalletManager();
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState({ sequence: '', owner: '', fulfillment: '' });

  const handleClaim = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Fetch the actual record from storage using the Sequence
      const storedGig = JSON.parse(localStorage.getItem(`gig_${claimData.sequence}`));
      if (!storedGig) {
        throw new Error("Escrow not found. Please check the Sequence Number.");
      }

      // 2. Execute the finish logic with full validation
      const result = await finishGigEscrow(client, seed, {
        ownerAddress: claimData.owner,        // The address the user just typed in
        storedOwnerAddress: storedGig.ownerAddress, // The address stored during creation
        sequence: parseInt(claimData.sequence),
        condition: storedGig.condition,
        fulfillment: claimData.fulfillment,
        isMock: storedGig.isMock
      });

      if (result.success) {
        alert("🎉 Success! Funds released to your wallet.");
        localStorage.removeItem(`gig_${claimData.sequence}`);
      }
    } catch (error) {
      // This will now catch "Identity Mismatch" or "Cryptographic Mismatch"
      alert(`Claim Denied: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-white max-w-md shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Claim Payment</h2>
      <form onSubmit={handleClaim} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase text-slate-500 font-bold">Escrow Sequence</label>
          <input type="text" placeholder="e.g. 10245" className="w-full bg-black border border-slate-700 p-2 rounded mt-1"
            onChange={(e) => setClaimData({...claimData, sequence: e.target.value})} required />
        </div>
        <div>
          <label className="text-[10px] uppercase text-slate-500 font-bold">Client (Owner) Address</label>
          <input type="text" placeholder="..." className="w-full bg-black border border-slate-700 p-2 rounded mt-1"
            onChange={(e) => setClaimData({...claimData, owner: e.target.value})} required />
        </div>
        <div>
          <label className="text-[10px] uppercase text-slate-500 font-bold">Fulfillment Key</label>
          <input type="text" placeholder="Hex string..." className="w-full bg-black border border-slate-700 p-2 rounded mt-1"
            onChange={(e) => setClaimData({...claimData, fulfillment: e.target.value})} required />
        </div>
        <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-bold transition-colors disabled:bg-slate-700"
          disabled={loading}>
          {loading ? "Verifying Ledger Object..." : "Claim XRP"}
        </button>
      </form>
    </div>
  );
}