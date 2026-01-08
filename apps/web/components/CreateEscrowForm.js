"use client";
import { useState } from "react";
import { createGigEscrow, generateEscrowKeys } from "../lib/xrpl/escrow";
import useWalletManager from "../hooks/useWalletManager";

export function CreateEscrowForm() {
  const { wallet, isConnected } = useWalletManager();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form inputs
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [amount, setAmount] = useState("");

  const handleCreate = async () => {
    if (!isConnected || !wallet) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Generate Lock & Key
      const { condition, fulfillment } = generateEscrowKeys();

      // 2. Submit to Ledger using the logged-in wallet's seed
      const tx = await createGigEscrow(wallet.seed, {
        amount,
        destination: freelancerAddress,
        condition,
        deadlineInSeconds: 3600, // 1 Hour
      });

      const saveKey = `escrow_key_${tx.sequence}`;
      localStorage.setItem(saveKey, fulfillment);

      setResult({
        ...tx,
        fulfillment // We must show this to the user!
      });

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
        <div className="p-4 bg-slate-900 rounded border border-slate-800 text-center text-sm text-slate-400">
            Please connect your wallet above to create a gig.
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Freelancer Address</label>
        <input
          type="text"
          placeholder="r..."
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
          value={freelancerAddress}
          onChange={(e) => setFreelancerAddress(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Amount (XRP)</label>
        <input
          type="number"
          placeholder="10"
          className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white text-sm"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm font-medium"
      >
        {loading ? "Creating on Ledger..." : "Create Escrow"}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded text-sm">
          <p className="text-emerald-400 font-bold text-xs uppercase mb-2">Escrow Created Successfully</p>
          <div className="space-y-2 text-xs font-mono text-slate-300 break-all">
            <p><span className="text-slate-500">Sequence:</span> {result.sequence}</p>
            <p><span className="text-slate-500">Key:</span> {result.fulfillment}</p>
            <p className="text-[10px] text-slate-500 mt-2">Tx: {result.txHash}</p>
          </div>
          <p className="text-xs text-emerald-400 mt-3 font-sans">
            ⚠️ Copy the <strong>Key</strong> and <strong>Sequence</strong>. Send them to the freelancer.
          </p>
        </div>
      )}
    </div>
  );
}