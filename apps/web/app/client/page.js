"use client";

import { useState } from "react";
import ActiveGigs from "../../components/ActiveGigs";
import { Header } from "../../components/Header";
import { SidePanelOverlay } from "../../components/SidePanelOverlay";
// CHANGE: Import our new Provider hook
import { useWallet } from "../../components/providers/WalletProvider";

export default function ClientPage() {
  // CHANGE: Get the wallet from the new context
  const { wallet } = useWallet();

  const [panelOpen, setPanelOpen] = useState(false);

  function openCreateEscrow() {
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />

      <main className="max-w-full px-3 md:px-4 py-4">
        <section className="flex justify-between items-start gap-8">
          {/* LEFT: dashboard title + escrow cards */}
          <div className="flex-1 max-w-xl">
            <h1 className="heading-machina text-lg md:text-xl mb-4">Client dashboard</h1>

            <ActiveGigs role="client" />
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="hidden md:flex flex-col items-end justify-center text-xs gap-2">
            {/* ONLY ONE BUTTON NOW */}
            <button
              type="button"
              onClick={openCreateEscrow}
              className="text-slate-100 hover:underline"
            >
              Create escrow
            </button>
          </div>
        </section>
      </main>

      {/* Full-screen overlay side panel */}
      <SidePanelOverlay
        open={panelOpen}
        mode="createEscrow" // Hardcoded since we don't need 'connectWallet' mode anymore
        wallet={wallet}
        onClose={closePanel}
      />
    </div>
  );
}
