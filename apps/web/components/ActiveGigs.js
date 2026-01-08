"use client";

import { useState } from "react";
import EscrowCard from "./EscrowCard";

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
  },
];

export default function ActiveGigs({ role = "client", onSelectEscrow }) {
  const [escrows] = useState(MOCK_ESCROWS);

  return (
    <div className="space-y-3">
      {/* search bar */}
      <div className="mb-2">
        <input
          placeholder="Search"
          className="w-full rounded-full bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs"
        />
      </div>

      {escrows.map((e) => (
        <EscrowCard
          key={e.id}
          escrow={e}
          role={role}
          onSelect={onSelectEscrow}
        />
      ))}
    </div>
  );
}
