"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Client, Wallet } from "xrpl";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  // Legacy field kept so existing imports of walletManager don't break
  const [walletManager, setWalletManagerState] = useState(null);

  const [events, setEvents] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const [client, setClient] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);

  // ---- Persistence: load wallet on mount ----
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("gigsecure_wallet");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored); // { seed, address } or similar
      if (!parsed.seed) return;

      // Reconnect using stored seed
      connectWallet(parsed.seed, { skipPersist: true });
    } catch {
      // ignore bad data
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const connectWallet = useCallback(
    async (seed, options = {}) => {
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
        addEvent("Network Connected", {
          server: "wss://s.altnet.rippletest.net:51233",
        });

        // 3. Fetch Balance
        const response = await _client.request({
          command: "account_info",
          account: _wallet.address,
          ledger_index: "validated",
        });

        const drops = response.result.account_data.Balance;
        const xrpBalance = (parseInt(drops, 10) / 1000000).toFixed(2);

        // 4. Update State
        setBalance(xrpBalance);
        setAccountInfo({
          address: _wallet.address,
          balance: xrpBalance,
          sequence: response.result.account_data.Sequence,
        });
        setIsConnected(true);
        showStatus("Wallet Connected Successfully!", "success");

        // 5. Persist to localStorage (unless we're already restoring)
        if (typeof window !== "undefined" && !options.skipPersist) {
          window.localStorage.setItem(
            "gigsecure_wallet",
            JSON.stringify({ seed, address: _wallet.address })
          );
        }
      } catch (error) {
        console.error("Connection Failed:", error);
        showStatus("Connection Failed: " + error.message, "error");
        addEvent("Error", { message: error.message });
      } finally {
        setIsLoading(false);
      }
    },
    [addEvent, showStatus]
  );

  // --- FUNCTION: Disconnect ---
  const disconnectWallet = useCallback(async () => {
    try {
      if (client) {
        await client.disconnect();
      }
    } catch (e) {
      console.error("Error disconnecting client", e);
    }

    setClient(null);
    setWallet(null);
    setAccountInfo(null);
    setBalance(null);
    setIsConnected(false);
    addEvent("Disconnected", {});
    showStatus("Wallet Disconnected", "info");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("gigsecure_wallet");
    }
  }, [client, addEvent, showStatus]);

  // Compatibility wrapper for old code
  const setWalletManager = useCallback((manager) => {
    setWalletManagerState(manager);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        // legacy
        walletManager,
        setWalletManager,

        // core XRPL connection
        client,
        wallet,
        balance,
        accountInfo,
        isConnected,
        isLoading,

        // actions
        connectWallet,
        disconnectWallet,

        // UX helpers
        events,
        statusMessage,
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
