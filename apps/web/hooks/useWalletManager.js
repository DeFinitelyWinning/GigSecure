// apps/web/app/hooks/useWalletManager.js
"use client";

import { useState } from "react";

export default function useWalletManager(role) {
  const [wallet, setWallet] = useState(null);

  async function connectWallet() {
    // TODO: hook into WalletConnector / XRPL
    // For now, mock:
    setWallet({
      address: "rXYZ...1234",
      balance: 250,
      lastTxHash: "MOCKTXHASH",
    });
  }

  return { wallet, connectWallet };
}
