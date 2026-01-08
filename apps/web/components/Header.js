"use client";

import Link from "next/link";
import { useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import ManualLogin from "./ManualLogin";

export function Header() {
  const { isConnected, balance, disconnectWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
        <div className="max-w-full px-4 py-3 flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-wide text-slate-100 hover:text-white transition"
          >
            GigSecure
          </Link>

          {/* RIGHT: Nav & Wallet */}
          <div className="flex items-center gap-4">
            {/* Navigation (Hidden on small mobile screens if needed) */}
            <nav className="flex gap-2 text-sm">
              <Link
                href="/client"
                className="hidden md:block px-3 py-1.5 rounded-full border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition bg-slate-900/50"
              >
                Client
              </Link>
              <Link
                href="/freelancer"
                className="hidden md:block px-3 py-1.5 rounded-full border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition bg-slate-900/50"
              >
                Freelancer
              </Link>
            </nav>

            {/* SEPARATOR */}
            <div className="h-6 w-px bg-slate-800 mx-1"></div>

            {/* WALLET BUTTON */}
            {!isConnected ? (
              <button
                onClick={() => setShowModal(true)}
                className="text-sm font-medium bg-slate-100 text-slate-900 px-4 py-1.5 rounded-full hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 pl-4 pr-1 py-1 rounded-full">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {balance ? `${balance} XRP` : "..."}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-400 text-[10px] uppercase font-bold px-2 py-1 rounded-full transition"
                >
                  Exit
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LOGIN POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Backdrop Click to Close */}
          <div className="absolute inset-0" onClick={() => setShowModal(false)}></div>

          <div className="relative z-10">
            <ManualLogin onClose={() => setShowModal(false)} />

            {/* Close 'X' Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
