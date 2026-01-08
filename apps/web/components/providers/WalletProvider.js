"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Client, Wallet } from "xrpl";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [client, setClient] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: A simple counter. When this changes, other components know to re-fetch data.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ... (Keep your existing showStatus, addEvent, connectWallet, disconnectWallet logic here exactly as before) ...
  // Ensure connectWallet and disconnectWallet are included here (I'm omitting them for brevity, but keep them!)

  // --- CONNECT WALLET LOGIC (Paste your previous connectWallet/disconnectWallet code here) ---
  const connectWallet = useCallback(async (seed) => {
    setIsLoading(true);
    try {
      const _wallet = Wallet.fromSeed(seed);
      setWallet(_wallet);
      const _client = new Client("wss://s.altnet.rippletest.net:51233");
      await _client.connect();
      setClient(_client);
      
      // Initial Balance Check
      const response = await _client.request({
        command: "account_info",
        account: _wallet.address,
        ledger_index: "validated",
      });
      const drops = response.result.account_data.Balance;
      setBalance((parseInt(drops) / 1000000).toFixed(2));
      localStorage.setItem("xrpl_seed", seed);
      setIsConnected(true);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("xrpl_seed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = async () => {
    if (client) await client.disconnect();
    localStorage.removeItem("xrpl_seed");
    setClient(null);
    setWallet(null);
    setIsConnected(false);
  };

  useEffect(() => {
    const savedSeed = localStorage.getItem("xrpl_seed");
    if (savedSeed && !isConnected) connectWallet(savedSeed);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        client,
        wallet,
        balance,
        connectWallet,
        disconnectWallet,
        isConnected,
        isLoading,
        refreshTrigger, // <--- EXPOSE THIS
        triggerRefresh, // <--- EXPOSE THIS
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
}