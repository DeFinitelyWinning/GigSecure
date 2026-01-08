"use client";

import { useState } from "react";
import useWalletManager from "../hooks/useWalletManager";

export function WalletStatus() {
  const { wallet, balance, isConnected, connectWithSecret, disconnect } = useWalletManager();
  const [inputSecret, setInputSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!inputSecret) return;
    
    setLoading(true);
    setError(null);
    
    const res = await connectWithSecret(inputSecret);
    if (!res.success) {
      setError("Invalid Secret or Network Error");
    } else {
      setInputSecret(""); // Clear field on success
    }
    setLoading(false);
  };

  // --- VIEW: LOGGED IN ---
  if (isConnected && wallet) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="text-emerald-400 font-bold text-xs tracking-wider">WALLET CONNECTED</span>
            <button 
                onClick={disconnect}
                className="text-xs text-red-400 hover:text-red-300 underline"
            >
                Disconnect
            </button>
        </div>
        
        <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-2">
            <div>
                <p className="text-xs text-slate-500 uppercase">Address</p>
                <p className="font-mono text-sm text-slate-200 break-all">{wallet.address}</p>
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase">Balance</p>
                <p className="font-mono text-sm text-slate-200">{balance} XRP</p>
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW: LOGGED OUT (Login Form) ---
  return (
    <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-400">
            Connect your Testnet wallet to create or claim escrows.
        </p>

        <form onSubmit={handleConnect} className="space-y-3">
            <div>
                <label className="text-xs text-slate-500 uppercase font-semibold">Wallet Secret</label>
                <input 
                    type="password" 
                    placeholder="sEd7..." 
                    className="w-full mt-1 bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded px-3 py-2 focus:border-blue-500 outline-none"
                    value={inputSecret}
                    onChange={(e) => setInputSecret(e.target.value)}
                />
            </div>
            
            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            >
                {loading ? "Connecting..." : "Connect Wallet"}
            </button>
        </form>
    </div>
  );
}