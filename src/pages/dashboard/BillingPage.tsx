import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UsageData, mockUsage } from "@/data/mockData";
import { CheckCircle2, AlertTriangle, Sparkles, Receipt, Crown } from "lucide-react";
import { motion } from "framer-motion";

const invoices = [
  { id: "INV-001", date: "Mar 1, 2026", amount: "$0.00", status: "Paid" },
  { id: "INV-002", date: "Feb 1, 2026", amount: "$0.00", status: "Paid" },
];

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData>(mockUsage);
  const usagePercent = useMemo(() => (usage.used / usage.limit) * 100, [usage]);
  const isOverQuota = usagePercent >= 90;

  useEffect(() => {
    const token = localStorage.getItem("document-genie-token");
    if (token) {
      fetch("http://localhost:4000/api/billing/subscription", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to load subscription");
          return data;
        })
        .then((data) => {
          persistUsage({
            used: data.usage.used,
            limit: data.usage.limit,
            plan: data.plan,
            window: data.usage.window,
          });
        })
        .catch(() => {
          // Keep local data fallback.
        });
      return;
    }

    const stored = localStorage.getItem("document-genie-usage");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as UsageData;
      setUsage(parsed);
    } catch {
      // Ignore invalid persisted state and keep defaults.
    }
  }, []);

  const persistUsage = (next: UsageData) => {
    setUsage(next);
    localStorage.setItem("document-genie-usage", JSON.stringify(next));
  };

  const handleUpgrade = () => {
    if (usage.plan === "paid") return;

    const token = localStorage.getItem("document-genie-token");
    if (token) {
      fetch("http://localhost:4000/api/billing/upgrade", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Upgrade failed");
          return data;
        })
        .then((data) => {
          persistUsage({
            used: data.usage.used,
            limit: data.usage.limit,
            plan: data.plan,
            window: data.usage.window,
          });
        })
        .catch(() => {
          persistUsage({ ...usage, plan: "paid", limit: 1000, window: "monthly" });
        });
      return;
    }

    persistUsage({ ...usage, plan: "paid", limit: 1000, window: "monthly" });
  };

  const planTitle = usage.plan === "paid" ? "Paid Plan" : "Free Plan";
  const planPrice = usage.plan === "paid" ? "$20/month" : "$0/month";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm">Manage your plan and billing details.</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Current Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-muted rounded-xl p-3">
                {usage.plan === "paid" ? <Crown className="h-5 w-5 text-warning" /> : <Sparkles className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div>
                <p className="text-xl font-bold">{planTitle}</p>
                <p className="text-sm text-muted-foreground">{usage.limit} uploads/{usage.window} · {planPrice}</p>
              </div>
            </div>
            <Button variant={usage.plan === "paid" ? "outline" : "default"} onClick={handleUpgrade}>
              {usage.plan === "paid" ? "Current Plan Active" : "Upgrade to Paid"}
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usage this {usage.window}</span>
              <span className="font-semibold">{usage.used}/{usage.limit}</span>
            </div>
            <Progress value={usagePercent} className="h-2.5 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade banner */}
      {isOverQuota && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-primary rounded-2xl p-6 flex items-start gap-4"
        >
          <div className="bg-primary-foreground/10 rounded-xl p-2.5 shrink-0">
            <AlertTriangle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground mb-1">You're running low on uploads</h3>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Upgrade to Paid for 1000 uploads/month, higher queue priority, and subscription management.
            </p>
            <Button size="sm" className="bg-background text-foreground hover:bg-background/90 shadow-sm" onClick={handleUpgrade}>
              Upgrade to Paid — $20/mo
            </Button>
          </div>
        </motion.div>
      )}

      {/* Billing history */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Billing History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg p-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{inv.id}</p>
                    <p className="text-xs text-muted-foreground">{inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{inv.amount}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-success font-medium bg-success/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
