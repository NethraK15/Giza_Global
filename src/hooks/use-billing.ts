import { useEffect, useState } from "react";

export interface BillingData {
  plan: "free" | "paid";
  subscriptionStatus: "active" | "inactive";
  usage: {
    used: number;
    limit: number;
    window: "daily" | "monthly";
  };
}

interface UseBillingReturn {
  billing: BillingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  upgrade: () => Promise<void>;
  upgrading: boolean;
}

const DEFAULT_BILLING: BillingData = {
  plan: "free",
  subscriptionStatus: "active",
  usage: {
    used: 0,
    limit: 5,
    window: "daily",
  },
};

export function useBilling(): UseBillingReturn {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const fetchBillingData = async () => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      // No token, use default billing data
      setBilling(DEFAULT_BILLING);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:4000/api/billing/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load billing information");
      }

      const data: BillingData = await response.json();
      setBilling(data);
      localStorage.setItem("document-genie-billing", JSON.stringify(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load billing information";
      setError(errorMessage);
      
      // Fallback to cached data or defaults
      const cached = localStorage.getItem("document-genie-billing");
      if (cached) {
        try {
          setBilling(JSON.parse(cached));
        } catch {
          setBilling(DEFAULT_BILLING);
        }
      } else {
        setBilling(DEFAULT_BILLING);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      setError("Not authenticated");
      return;
    }

    try {
      setUpgrading(true);
      setError(null);
      const response = await fetch("http://localhost:4000/api/billing/upgrade", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upgrade failed");
      }

      const data: BillingData = await response.json();
      setBilling(data);
      localStorage.setItem("document-genie-billing", JSON.stringify(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upgrade failed";
      setError(errorMessage);
      throw err;
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  return {
    billing,
    loading,
    error,
    refetch: fetchBillingData,
    upgrade: handleUpgrade,
    upgrading,
  };
}
