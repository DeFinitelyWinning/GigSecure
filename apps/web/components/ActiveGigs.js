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
          const savedSecrets = JSON.parse(localStorage.getItem("gig_secrets") || "{}");
          return {
            // UNIQUE KEY FIX: Use the Ledger Object Index (Hex string)
            uniqueKey: escrow.index,
            id: escrow.Sequence,
            amount: parseInt(escrow.Amount) / 1000000,
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
          (t) => t.tx.TransactionType === "EscrowCreate" && t.tx.Destination === wallet.address
        );

        formattedGigs = incomingEscrows.map((t) => ({
          // UNIQUE KEY FIX: Use the Transaction Hash
          uniqueKey: t.hash,
          id: t.tx.Sequence,
          amount: parseInt(t.tx.Amount) / 1000000,
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

  // Add dependencies to prevent stale closures
  useEffect(() => {
    if (isConnected && client && wallet) {
      fetchGigs();
    }
  }, [isConnected, client, wallet, role]);

  const handleClaim = async (gig) => {
    const secret = prompt("Enter the Secret Key from the Client to unlock these funds:");
    if (!secret) return;

    setClaimingId(gig.uniqueKey);
    try {
      // ✅ We pass 'wallet.seed' as the first arg
      // ✅ We fix the key names in the object to match escrow.js
      const result = await finishGigEscrow(wallet.seed, {
        ownerAddress: gig.owner,
        sequence: gig.id, // CHANGED: from 'offerSequence' to 'sequence'
        condition: gig.condition,
        fulfillment: secret,
      });

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        alert("Success! Funds claimed to your wallet.");
        fetchGigs();
      } else {
        alert("Claim Failed: " + result.result.meta.TransactionResult);
      }
    } catch (e) {
      console.error(e); // Log the full error for debugging
      alert("Error: " + e.message);
    } finally {
      setClaimingId(null);
    }
  };

  if (!isConnected)
    return <div className="text-slate-500 text-sm italic">Connect wallet to view gigs.</div>;
  if (loading)
    return <div className="text-slate-400 text-sm animate-pulse">Scanning XRPL Ledger...</div>;
  if (gigs.length === 0)
    return (
      <div className="text-slate-500 text-sm p-4 border border-dashed border-slate-800 rounded">
        No active gigs found.
      </div>
    );

  return (
    <div className="space-y-4">
      {gigs.map((gig) => (
        <div
          key={gig.uniqueKey} // <--- THIS IS THE FIX (Using unique hash/index)
          className="bg-[#111] border border-slate-800 rounded-xl p-5 relative overflow-hidden group"
        >
          {/* Badge */}
          <div
            className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg
            ${role === "client" ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}`}
          >
            {role === "client" ? "OUTGOING" : "INCOMING"}
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-100 font-bold text-lg">Gig #{gig.id}</h3>
              <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">
                {role === "client" ? "Freelancer" : "Client (Owner)"}
              </p>
              <p className="text-slate-300 font-mono text-xs break-all">
                {role === "client" ? gig.destination : gig.owner}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {gig.amount} <span className="text-sm text-slate-500 font-normal">XRP</span>
              </div>
            </div>
          </div>

          {/* CLIENT VIEW */}
          {role === "client" && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Secret Key</span>
                {gig.secret && (
                  <button
                    onClick={() => navigator.clipboard.writeText(gig.secret)}
                    className="text-[10px] text-blue-400 hover:text-blue-300"
                  >
                    Copy
                  </button>
                )}
              </div>
              <code className="block w-full overflow-hidden text-ellipsis font-mono text-xs text-emerald-400/90">
                {gig.secret || "Key not found on this device"}
              </code>
            </div>
          )}

          {/* FREELANCER VIEW */}
          {role === "freelancer" && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleClaim(gig)}
                disabled={claimingId === gig.uniqueKey}
                className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 py-2 rounded text-xs font-bold hover:bg-emerald-600 hover:text-white transition flex justify-center items-center gap-2"
              >
                {claimingId === gig.uniqueKey ? "Unlocking Funds..." : "💰 Unlock Funds"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
