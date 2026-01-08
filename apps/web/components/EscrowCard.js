"use client";

export default function EscrowCard({ escrow, role, onSelect, onPrimaryAction }) {
  const {
    id,
    title,
    amountXrp,
    destination,
    client,
    status,
    createdAt,
    expiresInMinutes,
  } = escrow;

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

  return (
    <div
      className="bg-black border border-slate-800 rounded-xl px-4 py-3 text-xs cursor-pointer hover:border-slate-600"
      onClick={() => onSelect && onSelect(escrow)}
    >
      <div className="flex justify-between items-center mb-1">
        <div>
          <div className="text-sm font-semibold">
            {title || "Milestone"}
          </div>
          <div className="text-[11px] text-slate-400">
            {amountXrp} XRP
          </div>
        </div>

        <div className={`text-[11px] font-medium ${statusColor}`}>
          {statusLabel}
        </div>
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
        <span>
          {role === "freelancer"
            ? `Client: ${client || "—"}`
            : `Destination: ${destination || "—"}`}
        </span>
        <span>
          {expiresInMinutes != null
            ? `Expires in ${expiresInMinutes} min`
            : createdAt
            ? `Created: ${createdAt}`
            : ""}
        </span>
      </div>

      <button
        type="button"
        className="mt-1 text-[11px] text-amber-300 hover:text-amber-200 underline-offset-2 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onPrimaryAction && onPrimaryAction(escrow);
        }}
      >
        {footerLabel}
      </button>
    </div>
  );
}
