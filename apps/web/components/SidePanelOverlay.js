"use client";

import { useEffect } from "react";

export function SidePanelOverlay({
  open,
  mode,
  wallet,
  onConnectWallet,
  onClose,
}) {
  const isCreate = mode === "createEscrow";

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex"
      aria-modal="true"
      role="dialog"
    >
      {/* full-screen fading backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={onClose}
      />

      {/* sliding panel on the right */}
      <div className="relative ml-auto h-full w-full max-w-md">
        <div
          className="h-full bg-black border-l border-slate-800 shadow-xl
                     animate-slide-in-right flex flex-col px-5 py-4 text-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              className="text-slate-200 hover:underline"
            >
              Connect XRPL wallet
            </button>
            <button
              type="button"
              className="text-slate-500 hover:text-slate-300"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <h2 className="text-sm font-semibold mb-3">
            {isCreate ? "Create escrow" : "XRPL wallet"}
          </h2>

          {isCreate ? (
            <CreateEscrowPanel />
          ) : (
            <ConnectWalletPanel wallet={wallet} />
          )}
        </div>
      </div>
    </div>
  );
}

/* --------- PANELS --------- */

function CreateEscrowPanel() {
  return (
    <form className="flex flex-col gap-4 mt-1">
      <label className="flex flex-col gap-1">
        <span>Project title</span>
        <input
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
          placeholder="Landing page design"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Freelancer address</span>
        <input
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
          placeholder="r..."
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Amount (in XRP)</span>
        <input
          type="number"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
          placeholder="50"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span>Deadline (optional)</span>
        <input
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2"
          placeholder="Today, 11:59 PM"
        />
      </label>

      <button
        type="submit"
        className="mt-3 rounded-full bg-amber-400 text-black text-xs font-semibold py-2"
      >
        Submit escrow
      </button>
    </form>
  );
}

function ConnectWalletPanel({ wallet }) {
  const connected = !!wallet?.address;

  return (
    <div className="mt-1 space-y-2">
      <p className="text-slate-300">
        {connected
          ? "XRPL wallet connected."
          : "No XRPL wallet connected yet."}
      </p>
    </div>
  );
}
