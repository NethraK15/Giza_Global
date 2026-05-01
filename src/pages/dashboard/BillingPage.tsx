import { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, Sparkles, Receipt, Crown, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { formatUsageLabel, getUsageSuffix, useBilling } from "@/hooks/use-billing";

const invoices = [
  { id: "INV-001", date: "Mar 1, 2026", amount: "$20.00", status: "Paid" },
  { id: "INV-002", date: "Feb 1, 2026", amount: "$0.00", status: "Paid" },
];

export default function BillingPage() {
  const { billing, loading, error, upgrade, upgrading, refetch } = useBilling();
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const usagePercent = useMemo(() => {
    if (!billing) return 0;
    return (billing.usage.used / billing.usage.limit) * 100;
  }, [billing]);

  const isOverQuota = usagePercent >= 90;
  const planTitle = billing?.plan === "paid" ? "Paid Plan" : "Free Plan";
  const planPrice = billing?.plan === "paid" ? "$20/month" : "$0/month";
  const usageLabel = billing ? formatUsageLabel(billing.usage) : "0/0 today";

  const handleUpgradeClick = useCallback(async () => {
    setUpgradeError(null);
    setUpgradeSuccess(false);
    try {
      await upgrade();
      setUpgradeSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setUpgradeSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upgrade failed. Please try again.";
      setUpgradeError(message);
    }
  }, [upgrade]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground text-sm">Manage your plan and billing details.</p>
      </div>

      {/* Initial load error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-destructive">Failed to load billing information</p>
            <p className="text-xs text-destructive/70 mt-0.5">{error}</p>
            <Button size="sm" variant="ghost" className="mt-3 text-xs h-7 px-2" onClick={() => refetch()}>
              <RotateCcw className="mr-1 h-3 w-3" /> Retry
            </Button>
          </div>
        </motion.div>
      )}

      {/* Upgrade success state */}
      {upgradeSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-success/10 border border-success/20 rounded-2xl p-5 flex items-start gap-3"
        >
          <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">Successfully upgraded to Paid Plan!</p>
            <p className="text-xs text-success/70 mt-0.5">Your plan now includes 1000 uploads/month and higher queue priority.</p>
          </div>
        </motion.div>
      )}

      {/* Upgrade error state */}
      {upgradeError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Upgrade failed</p>
            <p className="text-xs text-destructive/70 mt-0.5">{upgradeError}</p>
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading billing information...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current plan */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Current Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-xl p-3">
                    {billing?.plan === "paid" ? <Crown className="h-5 w-5 text-warning" /> : <Sparkles className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-xl font-bold">{planTitle}</p>
                    <p className="text-sm text-muted-foreground">{billing?.usage.limit} uploads/{billing?.usage.window} · {planPrice}</p>
                  </div>
                </div>
                <Button 
                  variant={billing?.plan === "paid" ? "outline" : "default"} 
                  onClick={handleUpgradeClick}
                  disabled={billing?.plan === "paid" || upgrading}
                >
                  {upgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {billing?.plan === "paid" ? "Current Plan Active" : "Upgrade to Paid"}
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usage {billing ? getUsageSuffix(billing.usage.window) : "today"}</span>
                  <span className="font-semibold">{usageLabel}</span>
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
                <Button 
                  size="sm" 
                  className="bg-background text-foreground hover:bg-background/90 shadow-sm" 
                  onClick={handleUpgradeClick}
                  disabled={billing?.plan === "paid" || upgrading}
                >
                  {upgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upgrade to Paid — $20/mo
                </Button>
              </div>
            </motion.div>
          )}

          {/* Plan comparison */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Plan Features</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Free: 5 files/day</p>
                    <p className="text-xs text-muted-foreground">Perfect for getting started</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Paid: 1000 files/month</p>
                    <p className="text-xs text-muted-foreground">Higher queue priority, subscription management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground mt-1">Max file size:</span>
                  <div>
                    <p className="text-sm font-medium">5 MB per file</p>
                    <p className="text-xs text-muted-foreground">Hard limit enforced</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </>
      )}
    </div>
  );
}
