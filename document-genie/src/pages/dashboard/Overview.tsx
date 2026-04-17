import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Job, UsageData } from "@/data/mockData";
import { Upload, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileText, TrendingUp, Activity, Crown, Sparkles, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { toast } from "sonner";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:4000";

const emptyUsage: UsageData = {
  used: 0,
  limit: 0,
  plan: "free",
  window: "monthly",
};

type JobsResponse = {
  jobs?: Job[];
  data?: {
    jobs?: Job[];
  };
};

type SubscriptionPayload = {
  planName?: string;
  plan?: string;
  monthlyUsage?: number;
  dailyUsage?: number;
  maxMonthly?: number;
  maxDaily?: number;
  data?: SubscriptionPayload;
};

const parseApiResponse = async (res: Response): Promise<unknown> => {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.toLowerCase().includes("application/json")) {
    return await res.json();
  }

  const text = await res.text();
  throw new Error(text || `Unexpected non-JSON response (${res.status})`);
};

const unwrapSubscriptionPayload = (value: unknown): SubscriptionPayload => {
  if (typeof value === "object" && value !== null) {
    const payload = value as SubscriptionPayload;
    return payload.data ?? payload;
  }

  return {};
};

const getUsageFromPayload = (payload: SubscriptionPayload): UsageData => {
  const planName = String(payload?.planName || payload?.plan || "free").toLowerCase();
  const isPaid = planName !== "free";
  const resolvedPlan: UsageData["plan"] = planName === "enterprise" ? "enterprise" : isPaid ? "paid" : "free";

  return {
    used: isPaid ? (payload?.monthlyUsage ?? 0) : (payload?.dailyUsage ?? 0),
    limit: isPaid ? (payload?.maxMonthly ?? 150) : (payload?.maxDaily ?? 5),
    plan: resolvedPlan,
    window: isPaid ? "monthly" : "daily",
  };
};

const persistUsage = (next: UsageData) => {
  localStorage.setItem("document-genie-usage", JSON.stringify(next));
  return next;
};

const readCachedUsage = (): UsageData | null => {
  const stored = localStorage.getItem("document-genie-usage");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as UsageData;
  } catch {
    return null;
  }
};

export default function DashboardOverview() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [usage, setUsage] = useState<UsageData>(emptyUsage);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      const cachedUsage = readCachedUsage();
      if (cachedUsage) {
        setUsage(cachedUsage);
      }
      return;
    }

    const loadData = async () => {
      try {
        const [jobsRes, usageRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const jobsData = (await parseApiResponse(jobsRes)) as JobsResponse;
        const usageData = await parseApiResponse(usageRes);

        if (jobsRes.ok) {
          setJobs(Array.isArray(jobsData.jobs) ? jobsData.jobs : Array.isArray(jobsData.data?.jobs) ? jobsData.data.jobs : []);
        }

        if (usageRes.ok) {
          const payload = unwrapSubscriptionPayload(usageData);
          const nextUsage = getUsageFromPayload(payload);
          setUsage(persistUsage(nextUsage));
        }
      } catch {
        setJobs([]);
        const cachedUsage = readCachedUsage();
        setUsage(cachedUsage ?? emptyUsage);
      }
    };

    loadData();
  }, []);

  const handleUpgrade = useCallback(async () => {
    if (isUpgrading || usage.plan !== "free") return;

    const optimisticUsage: UsageData = persistUsage({ ...usage, plan: "paid", limit: Math.max(usage.limit, 1000), window: "monthly" });
    setUsage(optimisticUsage);
    setIsUpgrading(true);

    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      toast.info("Sign in to complete the upgrade.");
      setIsUpgrading(false);
      return;
    }

    try {
      const upgradeRes = await fetch(`${API_BASE_URL}/api/users/upgrade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const upgradeData = await parseApiResponse(upgradeRes);
      if (!upgradeRes.ok) {
        throw new Error(upgradeData?.error || "Upgrade failed");
      }

      const refreshRes = await fetch(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refreshData = await parseApiResponse(refreshRes);
      if (!refreshRes.ok) {
        throw new Error(refreshData?.error || "Failed to refresh subscription");
      }

      const nextUsage = getUsageFromPayload(unwrapSubscriptionPayload(refreshData));
      setUsage(persistUsage(nextUsage));
      toast.success("Plan upgraded successfully");
    } catch (error) {
      persistUsage(optimisticUsage);
      setUsage(optimisticUsage);
      toast.info(error instanceof Error ? error.message : "Backend unavailable. Kept the upgraded plan locally.");
    } finally {
      setIsUpgrading(false);
    }
  }, [isUpgrading, usage]);

  const completed = useMemo(() => jobs.filter((j) => j.status === "completed").length, [jobs]);
  const processing = useMemo(() => jobs.filter((j) => j.status === "processing" || j.status === "queued").length, [jobs]);
  const failed = useMemo(() => jobs.filter((j) => j.status === "failed").length, [jobs]);
  const usagePercent = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;
  const remaining = Math.max(usage.limit - usage.used, 0);
  const planLabel = usage.plan === "enterprise" ? "Enterprise Plan" : usage.plan === "paid" ? "Paid Plan" : "Free Plan";
  const planTone = usage.plan === "enterprise" ? "bg-warning/10 text-warning" : usage.plan === "paid" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground";
  const actionLabel = usage.plan === "free" ? "Upgrade plan" : "Manage plan";

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Activity, trend: "", color: "text-foreground" },
    { label: "Completed", value: completed, icon: CheckCircle2, trend: "+8%", color: "text-success" },
    { label: "In Progress", value: processing, icon: Clock, trend: "", color: "text-info" },
    { label: "Failed", value: failed, icon: AlertTriangle, trend: "", color: "text-destructive" },
  ];

  return (
    <div className="space-y-6 max-w-6xl smooth-appear">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your processing overview and plan status.</p>
        </div>
        <Button variant="default" asChild>
          <Link to="/dashboard/upload"><Upload className="mr-2 h-4 w-4" /> Upload Document</Link>
        </Button>
      </div>

      <Card className="surface-elevated overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
        <CardContent className="relative p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${planTone}`}>
                  {usage.plan === "free" ? <Sparkles className="h-3.5 w-3.5" /> : <Crown className="h-3.5 w-3.5" />}
                  Current Plan
                </span>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                  Resets {usage.window}
                </span>
              </div>

              <div className="space-y-2 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold">{planLabel}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  You have used {usage.used} of {usage.limit} uploads this {usage.window}. {remaining} uploads remain before the quota resets.
                </p>
              </div>

              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage this {usage.window}</span>
                  <span className="font-semibold">{Math.round(usagePercent)}%</span>
                </div>
                <Progress value={usagePercent} className="h-2.5 rounded-full" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Used</p>
                    <p className="mt-1 text-lg font-semibold">{usage.used}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Remaining</p>
                    <p className="mt-1 text-lg font-semibold">{remaining}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Limit</p>
                    <p className="mt-1 text-lg font-semibold">{usage.limit}</p>
                  </div>
                </div>
              </div>

              {usagePercent > 70 && (
                <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-warning shrink-0" />
                  <p className="text-foreground/90">
                    You are nearing your quota. Upgrade now to keep processing without interruption.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:min-w-[220px]">
              <Button size="lg" onClick={handleUpgrade} disabled={isUpgrading || usage.plan !== "free"} className="shadow-glow">
                {isUpgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                {actionLabel}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard/billing">Open billing</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="surface-elevated hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color} opacity-60`} />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
                  {stat.trend && (
                    <span className="text-xs text-success font-medium flex items-center gap-0.5 mb-1">
                      <TrendingUp className="h-3 w-3" />{stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent jobs */}
      <Card className="surface-elevated">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link to="/dashboard/jobs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-lg p-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{job.fileName}</p>
                    <p className="text-xs text-muted-foreground">{job.uploadedAt}</p>
                  </div>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; dot: string }> = {
    queued: { label: "Queued", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
    processing: { label: "Processing", className: "bg-info/10 text-info", dot: "bg-info animate-pulse-soft" },
    completed: { label: "Completed", className: "bg-success/10 text-success", dot: "bg-success" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  };
  const c = config[status] || config.queued;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${c.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
