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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const connectWallet = useCallback(async (seed) => {
    setIsLoading(true);
    try {
      const _wallet = Wallet.fromSeed(seed);
      setWallet(_wallet);
      const _client = new Client("wss://s.altnet.rippletest.net:51233");
      await _client.connect();
      setClient(_client);
      
      const response = await _client.request({
        command: "account_info",
        account: _wallet.address,
        ledger_index: "validated",
      });
      
      const drops = response.result.account_data.Balance;
      setBalance((parseInt(drops) / 1000000).toFixed(2));

      // ✅ CHANGE 1: Use sessionStorage instead of localStorage
      // This persists on refresh, but WIPES when tab is closed.
      sessionStorage.setItem("xrpl_seed", seed);
      
      setIsConnected(true);
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem("xrpl_seed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = async () => {
    if (client) await client.disconnect();
    
    // ✅ CHANGE 2: Clear session on explicit disconnect
    sessionStorage.removeItem("xrpl_seed");
    
    setClient(null);
    setWallet(null);
    setIsConnected(false);
  };

  useEffect(() => {
    // ✅ CHANGE 3: Check sessionStorage on load
    // Note: This only works if the tab is still open. 
    // If they closed and reopened the tab, they must log in again (Good for security).
    const savedSeed = sessionStorage.getItem("xrpl_seed");
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
        refreshTrigger,
        triggerRefresh,
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