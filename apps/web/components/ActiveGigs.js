"use client";

import { useEffect, useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import { finishGigEscrow } from "../lib/xrpl/escrow";

export default function ActiveGigs({ role = "client" }) {
  const { client, wallet, isConnected } = useWallet();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const fetchGigs = async () => {
    if (!client || !wallet) return;
    setLoading(true);

    try {
      let formattedGigs = [];

      // --- LOGIC 1: CLIENT (Show Active Escrows I Created) ---
      if (role === "client") {
        const response = await client.request({
          command: "account_objects",
          account: wallet.address,
          type: "escrow",
          ledger_index: "validated",
        });

        formattedGigs = response.result.account_objects.map((escrow) => {
          const savedSecrets = JSON.parse(
            localStorage.getItem("gig_secrets") || "{}"
          );
          return {
            uniqueKey: escrow.index,
            id: escrow.Sequence,
            amount: parseInt(escrow.Amount, 10) / 1000000,
            destination: escrow.Destination,
            owner: escrow.Account,
            condition: escrow.Condition,
            secret: savedSecrets[escrow.Sequence] || null,
            status: "Locked",
          };
        });
      }
      // --- LOGIC 2: FREELANCER (Show Escrows Sent TO Me) ---
      else {
        const response = await client.request({
          command: "account_tx",
          account: wallet.address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: 20,
        });

        const txs = response.result.transactions;

        const incomingEscrows = txs.filter(
          (t) =>
            t.tx.TransactionType === "EscrowCreate" &&
            t.tx.Destination === wallet.address
        );

        formattedGigs = incomingEscrows.map((t) => ({
          uniqueKey: t.hash,
          id: t.tx.Sequence,
          amount: parseInt(t.tx.Amount, 10) / 1000000,
          destination: t.tx.Destination,
          owner: t.tx.Account,
          condition: t.tx.Condition,
          secret: null,
          status: "Incoming",
        }));
      }

      setGigs(formattedGigs);
    } catch (error) {
      console.error("Error fetching gigs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && client && wallet) {
      fetchGigs();
    }
  }, [isConnected, client, wallet, role]);

  const handleClaim = async (gig) => {
    const secret = prompt(
      "Enter the Secret Key from the Client to unlock these funds:"
    );
    if (!secret) return;

    setClaimingId(gig.uniqueKey);

    try {
      const result = await finishGigEscrow(client, wallet, {
        ownerAddress: gig.owner,
        sequence: gig.id,
        condition: gig.condition,
        fulfillment: secret,
        isMock: true,
      });

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        alert("Success! Funds claimed to your wallet.");

        // Remove claimed escrow from local list so it no longer shows as Incoming
        setGigs((prev) => prev.filter((g) => g.uniqueKey !== gig.uniqueKey));
        // or, to mark as completed instead:
        // setGigs((prev) =>
        //   prev.map((g) =>
        //     g.uniqueKey === gig.uniqueKey ? { ...g, status: "Completed" } : g
        //   )
        // );
      } else {
        alert("Claim Failed: " + result.result.meta.TransactionResult);
      }
    } catch (e) {
      console.error(e);
      alert("Error: " + e.message);
    } finally {
      setClaimingId(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-slate-500 text-sm">
        Connect your XRPL wallet to view active gigs.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-slate-400 text-sm">Loading active gigs from XRPL…</div>
    );
  }

  if (!loading && gigs.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        No active gigs found on the ledger for this account.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gigs.map((gig, idx) => (
        <div
          key={gig.uniqueKey ?? `${gig.id}-${idx}`}
          className="bg-[#111] border border-slate-800 rounded-xl p-5 relative overflow-hidden group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {role === "client" ? "Freelancer" : "Client (Owner)"}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-200">
              {gig.status}
            </span>
          </div>

          <div className="text-sm text-slate-200 mb-2">
            {role === "client" ? gig.destination : gig.owner}
          </div>

          <div className="text-xs text-slate-400 mb-2">
            Amount:{" "}
            <span className="text-slate-100 font-mono">{gig.amount} XRP</span>
          </div>

          {role === "client" && (
            <div className="mt-2">
              <div className="text-[10px] uppercase text-slate-500 mb-1">
                Secret Key on this device
              </div>
              <div className="bg-black/40 border border-slate-800 rounded p-2 text-[10px] text-slate-300 break-all">
                {gig.secret || "Key not found on this device"}
              </div>
            </div>
          )}

          {role !== "client" && (
            <div className="mt-3">
              <button
                type="button"
                disabled={claimingId === gig.uniqueKey}
                onClick={() => handleClaim(gig)}
                className="text-xs px-3 py-1 rounded bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300"
              >
                {claimingId === gig.uniqueKey ? "Claiming..." : "Claim Escrow"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
