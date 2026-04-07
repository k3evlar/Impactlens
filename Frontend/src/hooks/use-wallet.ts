import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export interface WalletData {
  credits: number;
  totalEarned: number;
  totalSpent: number;
  tier: string;
  transactions: any[];
  purchases: any[];
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserKey = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email || "anonymous";
      } catch (e) {
        return "anonymous";
      }
    }
    return "anonymous";
  };

  const syncWallet = useCallback(async () => {
    try {
      const userKey = getUserKey();
      const response = await axios.get(`${API_BASE}/user/wallet`, {
        headers: { "x-user-key": userKey }
      });
      setWallet(response.data);
    } catch (e) {
      console.error("Wallet sync error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncWallet();

    const handleUpdate = () => {
      syncWallet();
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("wallet-updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("wallet-updated", handleUpdate);
    };
  }, [syncWallet]);

  const refreshWallet = () => {
    window.dispatchEvent(new Event("wallet-updated"));
  };

  return {
    wallet,
    isLoading,
    syncWallet,
    refreshWallet,
    credits: wallet?.credits || 0,
    tier: wallet?.tier || "BRONZE",
    totalEarned: wallet?.totalEarned || 0,
    totalSpent: wallet?.totalSpent || 0,
    transactions: wallet?.transactions || [],
    purchases: wallet?.purchases || []
  };
};
