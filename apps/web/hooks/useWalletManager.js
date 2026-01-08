"use client";
import { useState } from "react";
import { Wallet } from 'xrpl';

export default function useWalletManager(role) {
  const [wallet, setWallet] = useState(null);
  const [seed, setSeed] = useState(null);

  async function connectWallet() {
    // For the Hackathon: Generating a temporary wallet if none exists
    // In production, this would come from a wallet extension (Crossmark/Xaman)
    const newWallet = Wallet.generate();
    setWallet({
      address: newWallet.address,
      balance: 100, // Mock initial balance
    });
    setSeed(newWallet.seed); // This is critical for signing logic
  }

  return { wallet, seed, connectWallet };
}