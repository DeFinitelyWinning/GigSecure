"use client";
import { useState } from "react";
import { useWallet } from "./providers/WalletProvider";

export default function ManualLogin({ onClose }) {
  const { connectWallet, isLoading } = useWallet();
  const [seed, setSeed] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!seed.startsWith("s")) {
      alert("Invalid Seed. It must start with 's' (e.g. sEd...)");
      return;
    }
    await connectWallet(seed);
    if (onClose) onClose(); // Close modal on success
  };

  return (
    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm">
      <h2 className="text-xl font-bold text-slate-100 mb-2">Access Wallet</h2>
      <p className="text-sm text-slate-400 mb-6">Paste your Testnet Secret Seed to connect.</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <input
            type="password"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="sEd..."
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none font-mono text-sm"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all
            ${
              isLoading
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
            }`}
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a
          href="https://xrpl.org/resources/dev-tools/xrp-faucets"
          target="_blank"
          className="text-xs text-slate-500 hover:text-blue-400 underline"
        >
          Need a wallet? Get one here ↗
        </a>
      </div>
    </div>
  );
}
