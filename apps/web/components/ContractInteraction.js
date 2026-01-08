"use client";
import React, { useState } from 'react';
import { generateEscrowKeys, createGigEscrow } from '../lib/xrpl/escrow';
import useWalletManager from '../hooks/useWalletManager';

export function ContractInteraction() {
  const { wallet, client } = useWalletManager(); // Accesses connected wallet from your provider
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    freelancer: '',
    amount: '',
  });

  const handleCreateGig = async (e) => {
    e.preventDefault();
    
    let activeWallet = wallet; 
    let isMock = false;

    // --- MOCK MODE TRIGGER ---
    if (!wallet) {
      const useMock = confirm("No wallet connected. Use a dummy wallet for testing?");
      if (!useMock) return;
      
      activeWallet = { address: "rMockWalletAddress12345Demo" };
      isMock = true;
    }
    // -------------------------

    setLoading(true);
    try {
      // 1. Logic still generates real crypto conditions
      const { condition, fulfillment } = generateEscrowKeys(); 

      const details = {
        amount: formData.amount,
        destination: formData.freelancer,
        condition: condition,
        finishAfterSeconds: 300,
      };

      let sequence;
      
      if (isMock) {
        // Mock branch: Just generate a fake sequence
        sequence = Math.floor(Math.random() * 100000);
        await new Promise(res => setTimeout(res, 800)); 
      } else {
        // Real branch: Only runs if 'wallet' and 'client' exist
        if (!client) throw new Error("XRPL Client not connected");
        const result = await createGigEscrow(client, activeWallet, details);
        sequence = result.result.tx_json.Sequence;
      }
      
      // 2. Save to simulated database
      const gigData = { 
        condition, 
        fulfillment, 
        sequence, 
        amount: formData.amount, 
        isMock,
        status: "Created" 
      };
      localStorage.setItem(`gig_${sequence}`, JSON.stringify(gigData));

      alert(`Gig Created! Sequence: ${sequence} ${isMock ? "(Mock Mode)" : ""}`);
    } catch (error) {
      console.error("Escrow failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Create a Secure Gig</h2>
      <form onSubmit={handleCreateGig} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Freelancer Wallet Address</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded" 
            placeholder="rPj..." 
            value={formData.freelancer}
            onChange={(e) => setFormData({...formData, freelancer: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">XRP Amount</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded" 
            placeholder="1.0" 
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Processing Transaction..." : "Lock Funds & Start Gig"}
        </button>
      </form>
    </div>
  );
}