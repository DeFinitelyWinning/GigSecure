"use client";

import { useEffect, useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import { finishGigEscrow } from "../lib/xrpl/escrow";

export default function ActiveGigs({ role = "client" }) {
  const { client, wallet, isConnected, refreshTrigger } = useWallet();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  const fetchGigs = async () => {
    if (!client || !wallet) return;
    setLoading(true);

    try {
      let formattedGigs = [];
      const savedSecrets = JSON.parse(localStorage.getItem("gig_secrets") || "{}");

      // ==========================================================
      // 1. CLIENT MODE: Show Active Escrows I Created (Strict)
      // ==========================================================
      if (role === "client") {
        const response = await client.request({
          command: "account_objects",
          account: wallet.address,
          type: "escrow",
          ledger_index: "validated",
        });

        const rawObjects = response.result.account_objects;

        // Fetch "PreviousTxnID" to get the Sequence # (needed for unlocking/IDs)
        const fullDetails = await Promise.all(
          rawObjects.map(async (escrow) => {
            // STRICT FILTER: If I am not the owner, skip it immediately.
            if (escrow.Account !== wallet.address) return null;

            let realSequence = null;
            if (escrow.PreviousTxnID) {
              try {
                const txResponse = await client.request({
                  command: "tx",
                  transaction: escrow.PreviousTxnID,
                });
                realSequence = txResponse.result.Sequence;
              } catch (err) {
                console.error("Could not fetch creation tx", err);
              }
            }

            const gigId = realSequence; // Fallback if needed

            return {
              uniqueKey: escrow.index,
              id: gigId,
              amount: parseInt(escrow.Amount) / 1000000,
              destination: escrow.Destination,
              owner: escrow.Account,
              condition: escrow.Condition,
              secret: savedSecrets[gigId] || null,
              isOwner: true, // We confirmed this above
              status: "Locked",
            };
          })
        );

        // Remove nulls (items that failed the strict filter)
        formattedGigs = fullDetails.filter((g) => g !== null);
      }

      // ==========================================================
      // 2. FREELANCER MODE: Show Active Jobs Sent TO Me
      // ==========================================================
      else {
        // A. Get History of Escrows sent to me
        const response = await client.request({
          command: "account_tx",
          account: wallet.address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: 20, // Grab last 20 relevant txs
        });

        const txs = response.result.transactions;

        // B. Filter for "EscrowCreate" where I am the destination
        const potentialGigs = txs.filter((t) => {
          const tx = t.tx || t.tx_json;
          return (
            tx.TransactionType === "EscrowCreate" &&
            tx.Destination === wallet.address
          );
        });

        // C. "LIVENESS CHECK" - Verify which ones are still Active (Unpaid)
        const activeGigs = await Promise.all(
          potentialGigs.map(async (t) => {
            const tx = t.tx || t.tx_json;
            const gigId = tx.Sequence;
            const owner = tx.Account;

            try {
              // Ask Ledger: "Does this specific Escrow Node still exist?"
              // We identify it by Owner + Sequence
              await client.request({
                command: "ledger_entry",
                escrow: {
                  owner: owner,
                  seq: gigId,
                },
                ledger_index: "validated",
              });

              // If the above line DOES NOT throw an error, the Escrow is ALIVE.
              return {
                uniqueKey: t.hash || tx.hash,
                id: gigId,
                amount: parseInt(tx.Amount) / 1000000,
                destination: tx.Destination,
                owner: owner,
                condition: tx.Condition,
                secret: null, // Freelancers don't have secrets usually
                isOwner: false,
                status: "Incoming",
              };
            } catch (err) {
              // If error is "entry not found", the Escrow is finished/paid!
              // We return null to filter it out.
              return null;
            }
          })
        );

        formattedGigs = activeGigs.filter((g) => g !== null);
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
  }, [isConnected, client, wallet, role, refreshTrigger]);

  const handleClaim = async (gig) => {
    const secret = prompt(
      "Enter the Secret Key from the Client to unlock these funds:"
    );
    if (!secret) return;

    setClaimingId(gig.uniqueKey);
    try {
      if (!gig.id) throw new Error("Missing Gig Sequence ID. Cannot claim.");

      const result = await finishGigEscrow(wallet.seed, {
        ownerAddress: gig.owner,
        sequence: gig.id,
        condition: gig.condition,
        fulfillment: secret,
      });

      if (result.result.meta.TransactionResult === "tesSUCCESS") {
        alert("Success! Funds claimed.");
        fetchGigs(); // Refresh list to remove the claimed item
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

  if (!isConnected)
    return (
      <div className="text-slate-500 text-sm italic">
        Connect wallet to view gigs.
      </div>
    );
  if (loading)
    return (
      <div className="text-slate-400 text-sm animate-pulse">
        Scanning XRPL Ledger...
      </div>
    );
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
          key={gig.uniqueKey}
          className="bg-[#111] border border-slate-800 rounded-xl p-5 relative overflow-hidden group"
        >
          <div
            className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg ${
              gig.isOwner
                ? "bg-amber-500/10 text-amber-500"
                : "bg-blue-500/10 text-blue-500"
            }`}
          >
            {gig.isOwner ? "OUTGOING (MY GIG)" : "INCOMING (JOB)"}
          </div>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-100 font-bold text-lg">
                Gig #{gig.id || "?"}
              </h3>
              <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">
                {gig.isOwner ? "Freelancer" : "Client (Owner)"}
              </p>
              <p className="text-slate-300 font-mono text-xs break-all">
                {gig.isOwner ? gig.destination : gig.owner}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {gig.amount}{" "}
                <span className="text-sm text-slate-500 font-normal">XRP</span>
              </div>
            </div>
          </div>

          {gig.isOwner && (
            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Secret Key
                </span>
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

          {!gig.isOwner && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => handleClaim(gig)}
                disabled={claimingId === gig.uniqueKey}
                className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 py-2 rounded text-xs font-bold hover:bg-emerald-600 hover:text-white transition flex justify-center items-center gap-2"
              >
                {claimingId === gig.uniqueKey
                  ? "Unlocking Funds..."
                  : "💰 Unlock Funds"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}