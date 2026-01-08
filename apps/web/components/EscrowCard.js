"use client";

import { useState } from "react";

export default function EscrowCard({
  escrow,
  role,
  onSelect,
  onPrimaryAction,
}) {
  const {
    id,
    title,
    amountXrp,
    destination,
    client,
    status,
    createdAt,
    expiresInMinutes,
    condition,
    sequence,
  } = escrow;

  const [open, setOpen] = useState(false);

  const statusLabel =
    status === "READY"
      ? "Ready to unlock"
      : status === "PAID"
      ? "Paid"
      : status === "PENDING"
      ? "Waiting to unlock"
      : status;

  const statusColor =
    status === "READY"
      ? "text-emerald-400"
      : status === "PAID"
      ? "text-emerald-300"
      : "text-amber-300";

  const footerLabel =
    role === "freelancer"
      ? status === "READY"
        ? "Unlock funds"
        : status === "PAID"
        ? "View payout"
        : "View details"
      : status === "PAID"
      ? "View payout"
      : "View details";

  const handleToggle = () => {
    setOpen((v) => !v);
    if (onSelect) onSelect(escrow);
    if (onPrimaryAction) onPrimaryAction(escrow);
  };

  return (
    <div className="space-y-1">
      {/* MAIN CARD */}
      <div className="rounded-xl bg-black text-xs text-slate-100 border border-slate-700 px-3 py-2">
        <div className="grid grid-cols-2 grid-rows-2 gap-y-3">
          {/* TOP LEFT: title */}
          <div className="flex items-start">
            <div>
              <div className="text-sm font-semibold tracking-wide">
                {title}
              </div>
            </div>
          </div>

          {/* TOP RIGHT: status icon placeholder */}
          <div className="flex items-start justify-end">
            {/* status icon placeholder for future use */}
            <div className="h-4 w-4 rounded-full border border-slate-500" />
          </div>

          {/* BOTTOM LEFT: destination + created time */}
          <div className="flex flex-col justify-end">
            <div className="text-[11px]">
              Destination:{" "}
              <span className="text-amber-300">{destination}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Created: {createdAt}
            </div>
          </div>

          {/* BOTTOM RIGHT: amount + button */}
          <div className="flex flex-col items-end justify-end">
            <div className="text-sm font-semibold">{amountXrp} XRP</div>
            <button
              type="button"
              onClick={handleToggle}
              className="mt-1 text-[11px] text-orange-400 hover:text-orange-300"
            >
              v Done v
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDING PANEL BELOW CARD */}
      {open && (
        <div className="rounded-xl bg-slate-900 text-[11px] text-slate-100 border border-slate-700 px-3 py-2">
          <div className="flex justify-between gap-4">
            <div>
              <div className="font-semibold mb-1">Escrow details</div>
              {condition && (
                <div className="mb-0.5">Condition: {condition}</div>
              )}
              {sequence && (
                <div className="mb-0.5">Sequence: {sequence}</div>
              )}
              <div className={`mb-0.5 ${statusColor}`}>
                Status: {statusLabel}
              </div>
              <div className="text-[10px] text-slate-400">
                Client: {client}
              </div>
            </div>
            <div className="text-right">
              {expiresInMinutes != null && (
                <div>Expires in {expiresInMinutes} min</div>
              )}
              <div className="mt-1 text-[10px] text-slate-400">
                Role: {role}
              </div>
              <div className="mt-2 text-[11px] text-slate-300">
                {footerLabel}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
