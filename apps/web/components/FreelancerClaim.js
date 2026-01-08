"use client";
import { useState } from "react";
// We use the relative path (..) and the correct function name
import { finishGigEscrow } from "../lib/xrpl/escrow"; 

export default function FreelancerClaim() {
  const [loading, setLoading] = useState(false);

  // Form State
  const [freelancerSecret, setFreelancerSecret] = useState(""); 
  const [escrowSeq, setEscrowSeq] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [fulfillment, setFulfillment] = useState("");

  const handleClaim = async () => {
    // 1. Basic Validation
    if (!freelancerSecret) { alert("Missing Wallet Secret"); return; }
    if (!escrowSeq) { alert("Missing Sequence Number"); return; }
    if (!ownerAddress) { alert("Missing Owner Address"); return; }
    if (!fulfillment) { alert("Missing Fulfillment Key"); return; }

    setLoading(true);

    try {
      // 2. Data Preparation & Logging
      const sequenceNumber = parseInt(escrowSeq, 10);
      
      console.log("Submitting Claim with Data:", {
        secret: "HIDDEN",
        owner: ownerAddress,
        seq: sequenceNumber,
        key: fulfillment
      });

      // 3. Send to Library
      const result = await finishGigEscrow(freelancerSecret, {
        ownerAddress: ownerAddress.trim(), // Remove accidental spaces
        sequence: sequenceNumber, 
        fulfillment: fulfillment.trim()    // Remove accidental spaces
      });
      
      alert("Success! Funds claimed. Tx: " + result.txHash);
    } catch (error) {
      console.error("Claim Error Details:", error);
      alert("Claim Failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("DEBUG ESCROW DATA:", { 
  freelancerSecret, 
  escrowSeq,     // <--- I bet this is undefined
  ownerAddress, 
  fulfillment 
});

  return (
    <div className="bg-slate-900 text-white p-6 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Claim Payment</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase">Your Wallet Secret (Freelancer)</label>
          <input
            type="password"
            placeholder="sEd..."
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
            value={freelancerSecret}
            onChange={(e) => setFreelancerSecret(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase">Escrow Sequence</label>
          <input
            type="number"
            placeholder="e.g. 10245"
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
            value={escrowSeq}
            onChange={(e) => setEscrowSeq(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase">Client (Owner) Address</label>
          <input
            type="text"
            placeholder="r..."
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase">Fulfillment Key</label>
          <input
            type="text"
            placeholder="Hex string..."
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded text-white"
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value)}
          />
        </div>

        <button
          onClick={handleClaim}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying & Claiming..." : "Claim XRP"}
        </button>
      </div>
    </div>
  );
}