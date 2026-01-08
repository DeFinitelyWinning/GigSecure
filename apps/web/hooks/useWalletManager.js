// useWalletManager.js
"use client";
import { useState, useEffect } from "react";

export default function useWalletManager(role) {
  const [wallet, setWallet] = useState(null);

  // 1. Load from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== "undefined"
      ? window.localStorage.getItem("gigsecure_wallet")
      : null;
    if (stored) {
      try {
        setWallet(JSON.parse(stored));
      } catch {}
    }
  }, []);

  async function connectWallet() {
    // TODO: real wallet; mock for now
    const newWallet = {
      address: "rXYZ...1234",
      balance: 250,
      lastTxHash: "MOCKTXHASH",
      // add seed or other fields you actually use
    };
    setWallet(newWallet);

    // 2. Save to localStorage
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gigsecure_wallet", JSON.stringify(newWallet));
    }
  }

  function disconnectWallet() {
    setWallet(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("gigsecure_wallet");
    }
  }

  return { wallet, connectWallet, disconnectWallet };
}
