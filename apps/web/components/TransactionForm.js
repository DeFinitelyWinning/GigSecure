"use client";

import { useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import { generateEscrowKeys, createGigEscrow } from "../lib/xrpl/escrow";

export function TransactionForm({ onClose }) {
  // Get wallet and client directly from the global context
  const { wallet, client, isConnected } = useWallet();

  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // SUCCESS STATE: Stores the data we need to show the user
  const [successData, setSuccessData] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!isConnected || !client || !wallet) {
        throw new Error("Wallet not connected. Please log in first.");
      }

      // 1. Generate the Secret Key (Preimage) and Lock (Condition)
      // This happens LOCALLY. The secret never leaves this browser yet.
      const keys = generateEscrowKeys();

      console.log("Generated Lock:", keys.condition);

      // 2. Submit the Escrow Transaction to XRPL
      // Default expiry is 1 hour (3600s) for the hackathon demo
      const result = await createGigEscrow(client, wallet, {
        amount,
        destination,
        condition: keys.condition,
        finishAfterSeconds: 3600,
      });

      console.log("Tx Result:", result);

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        // 3. Show the Success Screen
        const jobId = result.result.Sequence;
        const currentSecrets = JSON.parse(localStorage.getItem("gig_secrets") || "{}");
        currentSecrets[jobId] = keys.fulfillment; // Save Key using Job ID
        localStorage.setItem("gig_secrets", JSON.stringify(currentSecrets));

        setSuccessData({
          secret: keys.fulfillment, // This is the PREIMAGE (Key)
          jobId: result.result.Sequence, // The Escrow ID
          txHash: result.result.hash,
        });
      } else {
        throw new Error("Transaction Failed: " + result.result.meta.TransactionResult);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- VIEW 1: SUCCESS (Show the Secret Key) ---
  if (successData) {
    return (
      <div className="flex flex-col h-full bg-slate-900 p-6 rounded-lg border border-slate-700 animate-in fade-in">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h2 className="text-xl font-bold text-white">Gig Created!</h2>
          </div>

          <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg mb-6">
            <p className="text-xs uppercase font-bold text-red-400 mb-2 tracking-wider">
              ⚠️ Copy this Secret Key (Required to Release Funds)
            </p>
            <div className="bg-black/50 p-3 rounded font-mono text-sm text-red-200 break-all select-all border border-red-900/30">
              {successData.secret}
            </div>
            <p className="text-[10px] text-red-400/70 mt-2">
              Send this key to the freelancer ONLY when you are happy with their work.
            </p>
          </div>

          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Job ID (Sequence):</span>
              <span className="font-mono text-white">{successData.jobId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Status:</span>
              <span className="text-emerald-400">Locked on Ledger</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccessData(null);
            setAmount("");
            setDestination("");
            if (onClose) onClose();
          }}
          className="w-full mt-4 bg-slate-100 text-slate-900 font-bold py-3 rounded hover:bg-white transition"
        >
          Close & Create Another
        </button>
      </div>
    );
  }

  // --- VIEW 2: INPUT FORM ---
  return (
    <div className="h-full flex flex-col bg-slate-950 p-1">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Create Escrow</h2>
        <p className="text-slate-400 text-sm">Lock funds safely on the XRPL.</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6 flex-1">
        <div>
          <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
            Freelancer Address (r...)
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="rPt1..."
            className="w-full bg-slate-900 border border-slate-800 text-white rounded p-3 focus:border-blue-500 outline-none font-mono text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase font-bold text-slate-500 mb-1">
            Amount (XRP)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50"
            className="w-full bg-slate-900 border border-slate-800 text-white rounded p-3 focus:border-blue-500 outline-none font-mono text-sm"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className={`w-full py-3 rounded font-bold transition-all
              ${
                isLoading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-[#F5F5DC] text-slate-950 hover:bg-white shadow-[0_0_15px_rgba(245,245,220,0.1)]"
              }`}
          >
            {isLoading ? "Locking Funds..." : "Create Escrow"}
          </button>
        </div>
      </form>
    </div>
  );
}
