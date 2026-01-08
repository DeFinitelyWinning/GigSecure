"use client";
import React, { useState } from 'react';
import { finishGigEscrow, verifyFulfillmentLocal } from '../lib/xrpl/escrow';
import useWalletManager from '../hooks/useWalletManager';

export default function FreelancerClaim() {
  const { wallet, client, seed } = useWalletManager();
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState({ sequence: '', owner: '', fulfillment: '' });

  const handleClaim = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedGig = JSON.parse(localStorage.getItem(`gig_${claimData.sequence}`));
      if (!storedGig) throw new Error("Gig not found.");

      // CRITICAL LOGIC: Stop the process if the key is wrong
      const isCorrectKey = verifyFulfillmentLocal(storedGig.condition, claimData.fulfillment);
      
      if (!isCorrectKey) {
        throw new Error("Invalid Fulfillment Key. The hash does not match the on-chain condition.");
      }

      const result = await finishGigEscrow(client, seed, {
        ownerAddress: claimData.owner,
        sequence: parseInt(claimData.sequence),
        condition: storedGig.condition,
        fulfillment: claimData.fulfillment,
        isMock: storedGig.isMock
      });

      if (result.success) {
        alert("Success! Payment released.");
        localStorage.removeItem(`gig_${claimData.sequence}`);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-black">
      <h2 className="text-xl font-bold mb-4">Claim Payment</h2>
      <form onSubmit={handleClaim} className="space-y-3">
        <input type="text" placeholder="Sequence" className="w-full p-2 border"
          onChange={(e) => setClaimData({...claimData, sequence: e.target.value})} />
        <input type="text" placeholder="Client Address" className="w-full p-2 border"
          onChange={(e) => setClaimData({...claimData, owner: e.target.value})} />
        <input type="text" placeholder="Fulfillment Key" className="w-full p-2 border"
          onChange={(e) => setClaimData({...claimData, fulfillment: e.target.value})} />
        <button className="w-full bg-green-600 text-white py-2 rounded" disabled={loading}>
          {loading ? "Validating Cryptography..." : "Claim XRP"}
        </button>
      </form>
    </div>
  );
}