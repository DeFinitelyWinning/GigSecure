"use client";

import { useState, useEffect } from "react";
// Ensure we import from the correct relative path
import { finishGigEscrow } from "../lib/xrpl/escrow";

export default function FreelancerDetailPanel({ escrow, wallet }) {
  const [fulfillment, setFulfillment] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when a different escrow is selected
  useEffect(() => {
    setFulfillment("");
  }, [escrow]);

  if (!escrow) {
    return (
      <div className="text-slate-500 text-sm py-8 text-center">
        Select a gig from the list to view details
      </div>
    );
  }

  const handleClaim = async () => {
    if (!wallet) {
      alert("Please connect your wallet first (in the sidebar)");
      return;
    }
    if (!fulfillment) {
      alert("Please enter the Fulfillment Key provided by the client");
      return;
    }

    setLoading(true);

    // DEBUG: Log the data we are about to use
    console.log("Attempting Claim with:", {
      owner: escrow.owner,
      sequence: escrow.sequence, // Check if this is undefined in your console
      fulfillment: fulfillment
    });

    try {
      const result = await finishGigEscrow(wallet.seed, {
        ownerAddress: escrow.owner, 
        // FIX: Ensure sequence is passed correctly. 
        // Some versions of the object might use 'Sequence' (cap) or 'sequence' (lower).
        sequence: parseInt(escrow.sequence || escrow.Sequence),  
        fulfillment: fulfillment.trim()
      });

      alert(`Success! Funds Claimed.\nTx Hash: ${result.txHash}`);
      // Optional: reload the page or trigger a refresh here
      window.location.reload(); 
    } catch (error) {
      console.error("Panel Claim Error:", error);
      alert("Claim Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-100">Gig #{escrow.sequence}</h3>
        <p className="text-slate-400 text-sm">Escrow Details</p>
      </div>

      <div className="space-y-4 text-sm">
        <div className="p-3 bg-slate-900 rounded border border-slate-800">
           <span className="block text-xs text-slate-500 uppercase">Amount</span>
           <span className="text-xl font-semibold text-emerald-400">{escrow.amount} XRP</span>
        </div>

        <div>
           <span className="block text-xs text-slate-500 uppercase mb-1">Client Address</span>
           <div className="font-mono text-xs text-slate-300 break-all bg-slate-900 p-2 rounded">
             {escrow.owner}
           </div>
        </div>

        <div>
           <span className="block text-xs text-slate-500 uppercase mb-1">Fulfillment Key</span>
           <input
             type="text"
             placeholder="Paste the key from the client..."
             className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded font-mono text-xs focus:border-emerald-500 outline-none"
             value={fulfillment}
             onChange={(e) => setFulfillment(e.target.value)}
           />
           <p className="text-xs text-slate-500 mt-1">
             This key proves you completed the work.
           </p>
        </div>

        <button
          onClick={handleClaim}
          disabled={loading || !wallet}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-3 rounded transition-colors"
        >
          {loading ? "Verifying..." : wallet ? "Claim Payment" : "Connect Wallet to Claim"}
        </button>
      </div>
    </div>
  );
}