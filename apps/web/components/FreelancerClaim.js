"use client";
import React, { useState } from "react";
import { finishGigEscrow } from "../lib/xrpl/escrow";
import useWalletManager from "../hooks/useWalletManager";

export default function FreelancerClaim() {
  const { wallet, client } = useWalletManager();
  const [loading, setLoading] = useState(false);
  const [claimData, setClaimData] = useState({
    sequence: "",
    owner: "",
    fulfillment: "",
  });

  const handleClaim = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If no wallet is connected, we force mock mode for the demo
      const isMockMode = !wallet;

      const result = await finishGigEscrow(client, wallet || { address: "rMock..." }, {
        ownerAddress: claimData.owner,
        sequence: parseInt(claimData.sequence),
        condition: "", // In a real app, you'd fetch this from the ledger using the sequence
        fulfillment: claimData.fulfillment,
        isMock: isMockMode,
      });

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        alert("Success! Funds have been released to your wallet.");
        // Clear local storage for this gig to show it's "completed"
        localStorage.removeItem(`gig_${claimData.sequence}`);
      }
    } catch (error) {
      console.error("Claim failed:", error);
      alert("Claim failed. Ensure the Fulfillment Key and Sequence are correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-green-800">Freelancer: Claim Payment</h2>
      <form onSubmit={handleClaim} className="space-y-3">
        <input
          type="text"
          placeholder="Gig Sequence (e.g. 54099)"
          className="w-full p-2 border rounded"
          onChange={(e) => setClaimData({ ...claimData, sequence: e.target.value })}
        />
        <input
          type="text"
          placeholder="Client Wallet Address"
          className="w-full p-2 border rounded"
          onChange={(e) => setClaimData({ ...claimData, owner: e.target.value })}
        />
        <input
          type="text"
          placeholder="Paste Fulfillment Key"
          className="w-full p-2 border rounded bg-white"
          onChange={(e) => setClaimData({ ...claimData, fulfillment: e.target.value })}
        />
        <button
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Verifying Secret..." : "Submit Key & Claim XRP"}
        </button>
        <p className="text-[10px] text-gray-500 italic text-center">
          Demo Key: DEMO_RELEASE_KEY_2026
        </p>
      </form>
    </div>
  );
}
