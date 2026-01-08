"use client";

import React, { useState } from "react";

const MOCK_ESCROWS = [
  {
    id: "1",
    title: "Landing Page Design",
    amountXrp: 67,
    destination: "rB3...9FQ2",
    client: "rCL...1234",
    status: "PENDING",
    createdAt: "07 Jan 2026, 21:15",
    expiresInMinutes: 102,
    condition: "Final design approved",
    sequence: 12345,
  },
  {
    id: "2",
    title: "Bug-fix Sprint",
    amountXrp: 9873,
    destination: "rPZ...K55D",
    client: "rCL...1234",
    status: "PAID",
    createdAt: "07 Jan 2026, 21:15",
    expiresInMinutes: 102,
    condition: "All critical bugs fixed",
    sequence: 67890,
  },
];

import { cancelGigEscrow } from "../lib/xrpl/escrow";
import useWalletManager from "../hooks/useWalletManager";
import EscrowCard from "./EscrowCard";

export default function ActiveGigs({ role = "client", onSelectEscrow }) {
  const { wallet, client } = useWalletManager();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load functional gigs from localStorage
  useEffect(() => {
    const savedGigs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("gig_")) {
        savedGigs.push(JSON.parse(localStorage.getItem(key)));
      }
    }
    setGigs(savedGigs);
  }, []);

  const handleCancel = async (gig) => {
    const confirmCancel = confirm("Are you sure you want to dispute and cancel this gig?");
    if (!confirmCancel) return;

    setLoading(true);
    try {
      const result = await cancelGigEscrow(client, wallet || { address: "rMock..." }, {
        ownerAddress: wallet?.address || "rMockWalletAddress12345Demo",
        sequence: gig.sequence,
        isMock: gig.isMock,
      });

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        alert("Escrow Cancelled.");
        localStorage.removeItem(`gig_${gig.sequence}`);
        setGigs(gigs.filter((g) => g.sequence !== gig.sequence));
      }
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Error cancelling escrow.");
    } finally {
      setLoading(false);
    }
  };

  // Filter gigs based on teammate's search bar logic
  const filteredGigs = gigs.filter(
    (g) => g.sequence.toString().includes(searchTerm) || g.amount.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-3 w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Active Gig Contracts</h2>

      {/* Search bar from teammate's UI */}
      <div className="mb-2">
        <input
          placeholder="Search by Sequence or Amount"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-full bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-white"
        />
      </div>

      {filteredGigs.length === 0 && (
        <p className="text-gray-500 italic text-sm">No active gigs found.</p>
      )}

      {/* Map through your real data using their EscrowCard component */}
      {filteredGigs.map((gig) => (
        <EscrowCard
          key={gig.sequence}
          escrow={{
            id: gig.sequence,
            title: `Gig #${gig.sequence}`,
            amountXrp: gig.amount,
            destination: gig.destination || "Unknown",
            status: gig.isMock ? "MOCK" : "ACTIVE",
            fulfillment: gig.fulfillment, // Passing this so you can still reveal the key
          }}
          role={role}
          onSelect={onSelectEscrow}
          onCancel={() => handleCancel(gig)} // Passing your logic to their card
          loading={loading}
        />
      ))}
    </div>
  );
}

/* ---------- ESCROW CARD ---------- */

function EscrowCard({ escrow, role, onSelect }) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen((v) => !v);
    if (onSelect) onSelect(escrow);
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
                {escrow.title}
              </div>
            </div>
          </div>

          {/* TOP RIGHT: status icon placeholder */}
          <div className="flex items-start justify-end">
            <div className="h-4 w-4 rounded-full border border-slate-500" />
          </div>

          {/* BOTTOM LEFT: destination + created time */}
          <div className="flex flex-col justify-end">
            <div className="text-[11px]">
              Destination:{" "}
              <span className="text-amber-300">{escrow.destination}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Created: {escrow.createdAt}
            </div>
          </div>

          {/* BOTTOM RIGHT: amount + button */}
          <div className="flex flex-col items-end justify-end">
            <div className="text-sm font-semibold">
              {escrow.amountXrp} XRP
            </div>
            <button
              type="button"
              onClick={handleClick}
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
              {escrow.condition && (
                <div className="mb-0.5">
                  Condition: {escrow.condition}
                </div>
              )}
              {escrow.sequence && (
                <div className="mb-0.5">
                  Sequence: {escrow.sequence}
                </div>
              )}
              <div>Status: {escrow.status}</div>
            </div>
            <div className="text-right">
              <div>
                Expires in {escrow.expiresInMinutes} min
              </div>
              <div className="mt-1 text-[10px] text-slate-400">
                Role: {role}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
