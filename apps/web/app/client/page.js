"use client";

import { useState } from "react";
import ActiveGigs from "../../components/ActiveGigs";
import { Header } from "../../components/Header";
import { SidePanelOverlay } from "../../components/SidePanelOverlay";
import { useWallet } from "../../components/providers/WalletProvider";

export default function ClientPage() {
  const { wallet, isConnected } = useWallet();
  const [panelOpen, setPanelOpen] = useState(false);

  function openCreateEscrow() {
    if (!isConnected) return;
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-body">
      <Header />

      <main className="max-w-full px-6 py-8">
        {/* CHANGE 1: 'items-start' aligns everything to the top initially */}
        <section className="flex justify-between items-start gap-12 relative">
          
          {/* LEFT: Dashboard Content */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl font-bold mb-6 tracking-tight text-white font-heading">
              Client Dashboard
            </h1>
            <ActiveGigs role="client" />
          </div>

          {/* RIGHT: Action Button */}
          {/* CHANGE 2: 'sticky top-32' locks the button in place while scrolling */}
          <div className="hidden md:block sticky top-32">
            {isConnected ? (
              <button
                type="button"
                onClick={openCreateEscrow}
                className="group relative flex items-center gap-3 bg-emerald-500 text-slate-950 px-6 py-4 rounded-xl font-bold text-lg hover:bg-emerald-400 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all duration-200"
              >
                <span className="text-2xl leading-none">+</span>
                <span>Create New Escrow</span>
              </button>
            ) : (
              <div className="text-center opacity-60 bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-700">
                <p className="text-slate-400 italic mb-2">Wallet not connected</p>
                <p className="text-xs text-slate-600">Connect to start hiring</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SidePanelOverlay
        open={panelOpen}
        mode="createEscrow"
        wallet={wallet}
        onClose={closePanel}
      />
    </div>
  );
}