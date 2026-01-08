"use client";

import ActiveGigs from "../../components/ActiveGigs";
import { Header } from "../../components/Header";
import { WalletStatus } from "../../components/WalletStatus";
import { CreateEscrowForm } from "../../components/CreateEscrowForm";
import useWalletManager from "../../hooks/useWalletManager";

export default function ClientPage() {
  const { wallet, connectWallet } = useWalletManager("client");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1.1fr_minmax(0,1fr)] gap-6">
        <section>
          <h1 className="text-xl font-semibold mb-3">Client dashboard</h1>
          <ActiveGigs role="client" />
        </section>

        <section className="bg-black border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <WalletStatus wallet={wallet} onConnect={connectWallet} />
          <div className="border-t border-slate-800 pt-4">
            <h2 className="text-sm font-semibold mb-2">Create escrow</h2>
            <CreateEscrowForm />
          </div>
        </section>
      </main>
    </div>
  );
}
