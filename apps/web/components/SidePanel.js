"use client";

import { CreateEscrowForm } from "./CreateEscrowForm";

export function SidePanel({ mode, open, wallet, onConnectWallet }) {
  const isCreate = mode === "createEscrow";

  // when closed, show only center text
  if (!open) {
    return (
      <aside className="flex items-center justify-center">
        <button
          type="button"
          className="text-xs text-slate-300 hover:underline"
          onClick={() => onConnectWallet()}
        >
          Connect XRPL wallet / Create escrow
        </button>
      </aside>
    );
  }

  // when open, slide‑in card
  return (
    <aside className="relative overflow-hidden">
      <div
        className={`bg-black border border-slate-800 rounded-2xl h-full px-5 py-4 transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* top link */}
        <div className="flex items-center justify-between text-xs mb-4">
          <button
            type="button"
            className="text-slate-200 hover:underline"
            onClick={onConnectWallet}
          >
            Connect XRPL wallet
          </button>
        </div>

        <h2 className="text-sm font-semibold mb-3">
          {isCreate ? "Create escrow" : "XRPL wallet"}
        </h2>

        {isCreate ? <CreateEscrowPanel /> : <ConnectWalletPanel wallet={wallet} />}
      </div>
    </aside>
  );
}

function CreateEscrowPanel() {
  return (
    <div className="flex flex-col gap-4 text-xs">
      <label className="flex flex-col gap-1">
        <span>Project title</span>
        <input className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1">
        <span>Freelancer address</span>
        <input className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1">
        <span>Amount (in XRP)</span>
        <input
          type="number"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Deadline (optional)</span>
        <input className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2" />
      </label>

      <button
        type="button"
        className="mt-2 rounded-full bg-amber-400 text-black text-xs font-semibold py-2"
      >
        Submit escrow
      </button>
    </div>
  );
}

function ConnectWalletPanel({ wallet }) {
  const connected = !!wallet?.address;
  return (
    <div className="text-xs space-y-3">
      <p className="text-slate-300">
        {connected ? "XRPL wallet connected." : "No XRPL wallet connected yet."}
      </p>
    </div>
  );
}
