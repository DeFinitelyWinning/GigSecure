"use client";

import { useState } from "react";
import ActiveGigs from "../../components/ActiveGigs";
import { Header } from "../../components/Header";
import { SidePanelOverlay } from "../../components/SidePanelOverlay";
import useWalletManager from "../../hooks/useWalletManager";

export default function ClientPage() {
  const { wallet, connectWallet } = useWalletManager("client");
  const [panelMode, setPanelMode] = useState("createEscrow"); // "createEscrow" | "connectWallet"
  const [panelOpen, setPanelOpen] = useState(false);

  function openPanel(mode) {
    setPanelMode(mode);
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
            <h1 className="heading-machina text-lg md:text-xl mb-4">
              Client dashboard
            </h1>

            <ActiveGigs role="client" />
          </div>

          {/* RIGHT: stacked text buttons, middle-right of screen */}
          <div className="hidden md:flex flex-col items-end justify-center text-xs gap-2">
            <button
              type="button"
              onClick={() => openPanel("createEscrow")}
              className="text-slate-100 hover:underline"
            >
              Create escrow
            </button>
            <button
              type="button"
              onClick={() => openPanel("connectWallet")}
              className="text-pink-300 hover:underline"
            >
              Connect XRPL wallet
            </button>
          </div>
        </section>
      </main>

      {/* Full-screen overlay side panel */}
      <SidePanelOverlay
        open={panelOpen}
        mode={panelMode}
        wallet={wallet}
        onConnectWallet={() => setPanelMode("connectWallet")}
        onClose={closePanel}
      />
    </div>
  );
}
