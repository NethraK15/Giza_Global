import { useEffect, useState } from "react";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "@/lib/api-config";

export interface BillingData {
  plan: "free" | "paid";
  subscriptionStatus: "active" | "inactive";
  usage: {
    used: number;
    limit: number;
    window: "daily" | "monthly";
    periodStart?: string;
  };
}

interface UseBillingReturn {
  billing: BillingData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  upgrade: () => Promise<void>;
  upgrading: boolean;
  updateUsage: (usage: BillingData["usage"]) => void;
}

const DEFAULT_BILLING: BillingData = {
  plan: "free",
  subscriptionStatus: "active",
  usage: {
    used: 0,
    limit: 5,
    window: "daily",
    periodStart: new Date().toISOString().slice(0, 10),
  },
};

export function getUsageSuffix(window: BillingData["usage"]["window"]): string {
  return window === "daily" ? "today" : "this month";
}

export function formatUsageLabel(usage: BillingData["usage"]): string {
  return `${usage.used}/${usage.limit} ${getUsageSuffix(usage.window)}`;
}

export function isUsageLimitExceeded(usage: BillingData["usage"]): boolean {
  return usage.used >= usage.limit;
}

/**
 * Validates that the API response contains all required billing fields.
 */
function validateBillingResponse(data: unknown): BillingData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid response format from server");
  }

  const billing = data as Record<string, unknown>;

  if (typeof billing.plan !== "string" || !["free", "paid"].includes(billing.plan)) {
    throw new Error("Invalid plan in response");
  }

  if (typeof billing.subscriptionStatus !== "string" || !["active", "inactive"].includes(billing.subscriptionStatus)) {
    throw new Error("Invalid subscription status in response");
  }

  if (!billing.usage || typeof billing.usage !== "object") {
    throw new Error("Invalid usage data in response");
  }

  const usage = billing.usage as Record<string, unknown>;
  if (typeof usage.used !== "number" || typeof usage.limit !== "number" || typeof usage.window !== "string") {
    throw new Error("Invalid usage fields in response");
  }

  if (!["daily", "monthly"].includes(usage.window)) {
    throw new Error("Invalid usage window in response");
  }

  return {
    plan: billing.plan as "free" | "paid",
    subscriptionStatus: billing.subscriptionStatus as "active" | "inactive",
    usage: {
      used: usage.used as number,
      limit: usage.limit as number,
      window: usage.window as "daily" | "monthly",
      periodStart: typeof usage.periodStart === "string" ? usage.periodStart : undefined,
    },
  };
}

/**
 * Makes an authenticated API request to the billing service.
 */
async function billingApiCall(
  endpoint: string,
  options: {
    method?: "GET" | "POST";
    token: string | null;
  }
): Promise<BillingData> {
  if (!options.token) {
    throw new Error("Not authenticated. Please log in to view billing information.");
  }

  const response = await fetch(getApiUrl(endpoint), {
    method: options.method || "GET",
    headers: getAuthHeaders(options.token),
  });

  if (!response.ok) {
    let errorMessage = "Failed to communicate with billing service";
    try {
      const data = await response.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      // Fallback to status text if JSON parsing fails
      errorMessage = response.statusText || errorMessage;
    }

    if (response.status === 401) {
      errorMessage = "Authentication failed. Please log in again.";
    } else if (response.status === 409) {
      errorMessage = "You are already on a paid plan.";
    } else if (response.status === 429) {
      errorMessage = "Too many requests. Please wait before retrying.";
    } else if (response.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return validateBillingResponse(data);
}

export function useBilling(): UseBillingReturn {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const fetchBillingData = async () => {
    const token = localStorage.getItem("document-genie-token");

    try {
      setLoading(true);
      setError(null);

      // If no token, use defaults and exit early
      if (!token) {
        setBilling(DEFAULT_BILLING);
        setLoading(false);
        return;
      }

      // Fetch real billing data from API
      const data = await billingApiCall(API_ENDPOINTS.BILLING.SUBSCRIPTION, { token });
      setBilling(data);

      // Update cache
      localStorage.setItem("document-genie-billing", JSON.stringify(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load billing information";
      setError(errorMessage);

      // Try to restore from cache
      const cached = localStorage.getItem("document-genie-billing");
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          validateBillingResponse(cachedData);
          setBilling(cachedData);
        } catch {
          // Cache is invalid, use defaults
          setBilling(DEFAULT_BILLING);
        }
      } else {
        // No cache available, use defaults
        setBilling(DEFAULT_BILLING);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem("document-genie-token");

    // Prevent upgrade if already on paid plan
    if (billing?.plan === "paid") {
      setError("You are already on a paid plan");
      return;
    }

    try {
      setUpgrading(true);
      setError(null);

      // Make upgrade API call
      const data = await billingApiCall(API_ENDPOINTS.BILLING.UPGRADE, { method: "POST", token });
      setBilling(data);

      // Update cache
      localStorage.setItem("document-genie-billing", JSON.stringify(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upgrade failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setUpgrading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const updateUsage = (usage: BillingData["usage"]) => {
    setBilling((prev) => {
      if (!prev) return prev;

      const nextBilling = {
        ...prev,
        usage,
      };

      localStorage.setItem("document-genie-billing", JSON.stringify(nextBilling));
      return nextBilling;
    });
  };

  return {
    billing,
    loading,
    error,
    refetch: fetchBillingData,
    upgrade: handleUpgrade,
    upgrading,
    updateUsage,
  };
}
