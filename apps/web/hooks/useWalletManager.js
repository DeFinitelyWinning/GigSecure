"use client";

import { useWallet } from "../components/providers/WalletProvider";

export default function useWalletManager() {
  // We just return the global context
  // 'role' is unused now because the wallet is global
  return useWallet();
}