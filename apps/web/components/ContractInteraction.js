"use client";
import React, { useState } from 'react';
import { generateEscrowKeys, createGigEscrow } from '../lib/xrpl/escrow';
import useWalletManager from '../hooks/useWalletManager';

export function ContractInteraction() {
  const { wallet, client, seed } = useWalletManager(); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ freelancer: '', amount: '' });

  const handleCreateGig = async (e) => {
    e.preventDefault();
    const isMock = !wallet;
    setLoading(true);

    try {
      const { condition, fulfillment } = generateEscrowKeys(); 
      let sequence;
      let ownerAddress = wallet?.address || "rMockClientAddress123";

      if (isMock) {
        sequence = Math.floor(Math.random() * 100000);
        await new Promise(res => setTimeout(res, 800)); 
      } else {
        const result = await createGigEscrow(client, seed, {
          amount: formData.amount,
          destination: formData.freelancer,
          condition: condition,
        });
        sequence = result.sequence; // Captured from tx_json.Sequence
      }
      
      const gigData = { 
        condition, // CRITICAL: Must be saved for finishGigEscrow
        fulfillment, 
        sequence, 
        ownerAddress, 
        amount: formData.amount, 
        isMock 
      };
      localStorage.setItem(`gig_${sequence}`, JSON.stringify(gigData));
      alert(`Gig Created! Sequence: ${sequence}`);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Create a Secure Gig</h2>
      <form onSubmit={handleCreateGig} className="space-y-4">
        <input className="w-full p-2 border rounded" placeholder="Freelancer Address" 
          onChange={(e) => setFormData({...formData, freelancer: e.target.value})} required />
        <input className="w-full p-2 border rounded" type="number" placeholder="XRP Amount" 
          onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? "Processing..." : "Lock Funds & Start Gig"}
        </button>
      </form>
    </div>
  );
}