"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import ManualLogin from "./ManualLogin";

export function Header() {
  const { isConnected, balance, wallet, disconnectWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40 py-6">
        <div className="max-w-full px-6 flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight text-slate-100 hover:text-white transition font-heading"
          >
            GigSecure
          </Link>

          {/* RIGHT: Nav & Wallet */}
          <div className="flex items-center gap-6">
            <nav className="flex gap-3 text-base font-medium">
              <Link
                href="/client"
                className="hidden md:block px-5 py-2.5 rounded-full border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition bg-slate-900/50"
              >
                Client
              </Link>
              <Link
                href="/freelancer"
                className="hidden md:block px-5 py-2.5 rounded-full border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition bg-slate-900/50"
              >
                Freelancer
              </Link>
            </nav>

            <div className="h-8 w-px bg-slate-800 mx-2"></div>

            {!isConnected ? (
              <button
                onClick={() => setShowModal(true)}
                className="text-base font-bold bg-slate-100 text-slate-900 px-6 py-3 rounded-full hover:bg-white hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 pl-6 pr-2 py-2 rounded-full">
                {/* ✅ FULL ADDRESS DISPLAY */}
                <div className="hidden md:block">
                   <span className="text-xs font-mono text-slate-400 font-bold tracking-wide select-all">
                     Wallet address: {wallet?.address}
                   </span>
                </div>
                
                {/* Balance */}
                <span className="text-sm font-mono font-bold text-emerald-400 tracking-wide border-l border-slate-700 pl-4">
                  {balance ? `${balance} XRP` : "..."}
                </span>

                {/* Exit Button */}
                <button
                  onClick={disconnectWallet}
                  className="bg-slate-800 hover:bg-red-900/40 hover:text-red-300 text-slate-400 text-xs uppercase font-bold px-4 py-2 rounded-full transition"
                >
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>
          <div className="relative z-10">
            <ManualLogin onClose={() => setShowModal(false)} />
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-12 right-0 text-slate-400 hover:text-white text-lg font-bold"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}