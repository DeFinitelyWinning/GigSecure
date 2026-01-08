"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Wallet, Client } from "xrpl";

const WalletContext = createContext(undefined);

export function WalletProvider({ children }) {
  // We store the FULL wallet object (which contains the secret)
  // In a real app, you never store secrets in state, but for this Hackathon/Testnet, this is the most reliable way.
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState("0");
  const [isConnected, setIsConnected] = useState(false);

  // Helper to "Login" with a secret
  const connectWithSecret = async (secret) => {
    try {
      // 1. Validate Secret locally
      const _wallet = Wallet.fromSeed(secret);
      
      // 2. Fetch Balance to confirm it exists on Testnet
      const client = new Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      
      try {
        const bal = await client.getXrpBalance(_wallet.address);
        setBalance(bal);
      } catch (e) {
        // Account might not be funded yet
        setBalance("0");
      }
      
      await client.disconnect();

      // 3. Save to state
      setWallet(_wallet);
      setIsConnected(true);
      return { success: true };
    } catch (error) {
      console.error("Connection Failed:", error);
      return { success: false, error: error.message };
    }
  };

  const disconnect = () => {
    setWallet(null);
    setIsConnected(false);
    setBalance("0");
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,     // Contains .address and .seed
        balance,    // XRP Balance
        isConnected,
        connectWithSecret,
        disconnect
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}