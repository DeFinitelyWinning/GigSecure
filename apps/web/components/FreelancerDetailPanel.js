"use client";

import { useState } from "react";

export default function FreelancerDetailPanel({ escrow, wallet }) {
  const [secret, setSecret] = useState("");

  if (!escrow) {
    return (
      <p className="text-xs text-slate-400">
        Select an escrow on the left to see details and unlock funds
        when the client shares the secret.
      </p>
    );
  }

  const canUnlock = escrow.status === "READY" && wallet?.address;

  return (
    <div className="space-y-3 text-xs">
      <div>
        <h3 className="text-sm font-semibold mb-1">
          {escrow.title || "Milestone"}
        </h3>
        <p className="text-slate-400">
          Amount: {escrow.amountXrp} XRP
        </p>
        <p className="text-slate-400">
          Client: {escrow.client || "—"}
        </p>
        <p className="text-slate-500">
          Status: {escrow.status}
        </p>
      </div>

      {canUnlock ? (
        <>
          <div className="space-y-1">
            <label className="block text-slate-300">
              Secret from client
            </label>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1"
              placeholder="Paste secret here"
            />
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-full bg-emerald-500 text-black text-xs hover:bg-emerald-400"
            // TODO: call your finishEscrow API here
          >
            Unlock funds
          </button>
        </>
      ) : (
        <p className="text-slate-500">
          This escrow is not ready to unlock yet, or wallet is not
          connected.
        </p>
      )}
    </div>
  );
}
