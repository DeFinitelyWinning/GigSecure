"use client";

import { useState, useEffect } from "react";
import { getGigEscrows } from "../lib/xrpl/escrow";
import useWalletManager from "../hooks/useWalletManager";

export default function ActiveGigs({ role, onSelectEscrow }) {
  const { wallet, isConnected } = useWalletManager();
  
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAddress, setSearchAddress] = useState(""); // For Freelancer to search Client

  // 1. CLIENT: Fetch my own escrows automatically
  useEffect(() => {
    if (role === "client" && isConnected && wallet) {
      fetchGigs(wallet.address);
    }
  }, [role, isConnected, wallet]);

  // Helper to check for saved key in LocalStorage
  const getSavedKey = (sequence) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`escrow_key_${sequence}`);
  };

  // Helper to fetch and filter
  const fetchGigs = async (targetAddress) => {
    setLoading(true);
    try {
      // Fetch RAW data from the ledger
      const allEscrows = await getGigEscrows(targetAddress);
      
      if (role === "client") {
        // Show all escrows I created
        setGigs(allEscrows);
      } else if (role === "freelancer") {
        // FILTER: Only show escrows meant for ME (the logged-in freelancer)
        if (wallet?.address) {
          const myGigs = allEscrows.filter(g => g.destination === wallet.address);
          setGigs(myGigs);
        } else {
            // If not logged in, just show them all (or show none)
            setGigs(allEscrows);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch gigs");
    } finally {
      setLoading(false);
    }
  };

  // 2. FREELANCER: Handle manual search
  const handleFreelancerSearch = (e) => {
    e.preventDefault();
    if (!searchAddress) return;
    fetchGigs(searchAddress);
  };

  return (
    <div className="space-y-4">
      
      {/* FREELANCER SEARCH BAR */}
      {role === "freelancer" && (
        <form onSubmit={handleFreelancerSearch} className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Enter Client Wallet Address to find Gigs..."
            className="flex-1 bg-slate-900 border border-slate-700 text-white rounded px-3 py-2 text-sm"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Find Gigs
          </button>
        </form>
      )}

      {/* GIG LIST */}
      <div className="grid gap-4">
        {loading && <p className="text-slate-400 text-sm animate-pulse">Scanning Ledger...</p>}
        
        {!loading && gigs.length === 0 && (
          <div className="text-center py-8 bg-slate-900/50 rounded border border-slate-800 border-dashed">
            <p className="text-slate-500 text-sm">
              {role === "client" 
                ? "You haven't created any active escrows yet." 
                : "No active gigs found for you from this client."}
            </p>
          </div>
        )}

        {gigs.map((gig) => {
          const savedKey = getSavedKey(gig.sequence);

          return (
            <div 
                key={gig.sequence} 
                onClick={() => onSelectEscrow && onSelectEscrow(gig)}
                className={`
                p-4 rounded-lg border transition-all cursor-pointer relative group
                ${role === "freelancer" ? "hover:border-emerald-500 hover:bg-emerald-900/10 border-slate-800 bg-slate-900" : "border-slate-800 bg-slate-900"}
                `}
            >
                <div className="flex justify-between items-start mb-2">
                <span className="bg-blue-900/30 text-blue-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    SEQ: {gig.sequence}
                </span>
                <span className="text-emerald-400 font-bold text-lg">
                    {gig.amount} XRP
                </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                <p>
                    <span className="uppercase font-bold text-slate-600 mr-2">From:</span> 
                    <span className="font-mono text-slate-300">
                    {gig.owner === wallet?.address ? "You" : gig.owner.slice(0,8) + "..."}
                    </span>
                </p>
                <p>
                    <span className="uppercase font-bold text-slate-600 mr-2">To:</span> 
                    <span className="font-mono text-slate-300">
                    {gig.destination === wallet?.address ? "You" : gig.destination.slice(0,8) + "..."}
                    </span>
                </p>
                {/* HIDE CONDITION FROM UI, BUT KEEP IN DATA */}
                {/* <p>Condition: {gig.condition.slice(0, 10)}...</p> */}
                </div>

                {/* --- RECOVERED KEY SECTION (CLIENT ONLY) --- */}
                {role === "client" && savedKey && (
                    <div className="mt-3 pt-3 border-t border-slate-800" onClick={(e) => e.stopPropagation()}>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Recovered Fulfillment Key</p>
                        <div className="flex gap-2 items-center">
                            <code className="bg-black/50 text-emerald-400 text-[10px] p-1.5 rounded font-mono truncate flex-1 border border-emerald-900/30">
                                {savedKey}
                            </code>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent clicking the card
                                    navigator.clipboard.writeText(savedKey);
                                    alert("Key copied to clipboard!");
                                }}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-1.5 rounded text-white transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}