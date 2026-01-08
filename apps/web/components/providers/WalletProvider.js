"use client";

import { createContext, useContext, useState, useCallback } from "react";
// IMPORT XRPL LIBRARIES
import { Client, Wallet } from "xrpl";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  const [walletManager, setWalletManagerState] = useState(null); // Keeping this to avoid breaking imports, but we might not need it.
  const [events, setEvents] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [client, setClient] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // To show loading spinners
  const [accountInfo, setAccountInfo] = useState(null); // Stores address/balance object

  // --- HELPER: Status Messages ---
  const showStatus = useCallback((message, type) => {
    setStatusMessage({ message, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 5000);
  }, []);

  // --- HELPER: Event Logging ---
  const addEvent = useCallback((name, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [{ timestamp, name, data }, ...prev]);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // --- FUNCTION: Connect to Testnet using Seed ---
  const connectWallet = async (seed) => {
    setIsLoading(true);
    showStatus("Connecting to XRPL Testnet...", "info");

    try {
      // 1. Derive Wallet from Seed
      const _wallet = Wallet.fromSeed(seed);
      setWallet(_wallet);
      addEvent("Wallet Derived", { address: _wallet.address });

      // 2. Connect to Testnet Client
      const _client = new Client("wss://s.altnet.rippletest.net:51233");
      await _client.connect();
      setClient(_client);
      addEvent("Network Connected", { server: "wss://s.altnet.rippletest.net:51233" });

      // 3. Fetch Balance
      const response = await _client.request({
        command: "account_info",
        account: _wallet.address,
        ledger_index: "validated",
      });

      // 4. Update State
      const drops = response.result.account_data.Balance;
      const xrpBalance = (parseInt(drops) / 1000000).toFixed(2);

      setBalance(xrpBalance);
      setAccountInfo({
        address: _wallet.address,
        balance: xrpBalance,
        sequence: response.result.account_data.Sequence,
      });

      setIsConnected(true);
      showStatus("Wallet Connected Successfully!", "success");
    } catch (error) {
      console.error("Connection Failed:", error);
      showStatus("Connection Failed: " + error.message, "error");
      addEvent("Error", { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCTION: Disconnect ---
  const disconnectWallet = async () => {
    if (client) {
      await client.disconnect();
    }
    setClient(null);
    setWallet(null);
    setAccountInfo(null);
    setIsConnected(false);
    addEvent("Disconnected", {});
    showStatus("Wallet Disconnected", "info");
  };

  // Compatibility wrapper for setWalletManager if old code uses it
  const setWalletManager = useCallback((manager) => {
    setWalletManagerState(manager);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        // New XRPL Data
        client,
        wallet,
        balance,
        connectWallet,
        disconnectWallet,
        isLoading,

        // Existing Data (Kept for compatibility)
        walletManager,
        isConnected,
        accountInfo,
        events,
        statusMessage,
        setWalletManager,
        setIsConnected,
        setAccountInfo,
        addEvent,
        clearEvents,
        showStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
