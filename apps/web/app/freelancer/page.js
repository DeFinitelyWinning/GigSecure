"use client";

import { useState } from "react";
import ActiveGigs from "../../components/ActiveGigs";
import { Header } from "../../components/Header";
import { WalletStatus } from "../../components/WalletStatus";
import FreelancerDetailPanel from "../../components/FreelancerDetailPanel";
import useWalletManager from "../../hooks/useWalletManager";

export default function FreelancerPage() {
  const { wallet, connectWallet } = useWalletManager("freelancer");
  const [selectedEscrow, setSelectedEscrow] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(0,1fr)] gap-6">
        <section>
          <div className="mb-3">
            <h1 className="header-machina text-x1 mb-1">Freelancer dashboard</h1>
            <p className="text-xs text-slate-400">
              See gigs funded for you and unlock payment with the secret.
            </p>
          </div>
          <ActiveGigs role="freelancer" onSelectEscrow={setSelectedEscrow} />
        </section>

        <section className="bg-black border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <WalletStatus wallet={wallet} onConnect={connectWallet} />
          <div className="border-t border-slate-800 pt-4">
            <FreelancerDetailPanel escrow={selectedEscrow} wallet={wallet} />
          </div>
        </section>
      </main>
    </div>
  );
}
