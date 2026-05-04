import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileText, TrendingUp, Activity, AlertCircle, Inbox } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { formatUsageLabel, getUsageSuffix, useBilling } from "@/hooks/use-billing";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "@/lib/api-config";

type DashboardJob = {
  id: string;
  fileName: string;
  status: "queued" | "processing" | "completed" | "failed";
  uploadedAt: string;
};

export default function DashboardOverview() {
  const { billing, loading, error } = useBilling();
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      setJobs([]);
      setJobsLoaded(true);
      return;
    }

    const loadJobs = async () => {
      try {
        const response = await fetch(getApiUrl(API_ENDPOINTS.JOBS.LIST), {
          headers: getAuthHeaders(token),
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.jobs)) {
          setJobs(data.jobs as DashboardJob[]);
        } else {
          setJobs([]);
        }
      } catch {
        setJobs([]);
      } finally {
        setJobsLoaded(true);
      }
    };

    void loadJobs();
  }, []);

  const completed = jobs.filter((j) => j.status === "completed").length;
  const processing = jobs.filter((j) => j.status === "processing" || j.status === "queued").length;
  const failed = jobs.filter((j) => j.status === "failed").length;
  
  const usageUsed = billing?.usage.used ?? 0;
  const usageLimit = billing?.usage.limit ?? 0;
  const usagePercent = usageLimit > 0 ? (usageUsed / usageLimit) * 100 : 0;
  const usageLabel = billing ? formatUsageLabel(billing.usage) : "0/0 today";

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Activity, trend: jobs.length > 0 ? "+12%" : "", color: "text-foreground" },
    { label: "Completed", value: completed, icon: CheckCircle2, trend: completed > 0 ? "+8%" : "", color: "text-success" },
    { label: "In Progress", value: processing, icon: Clock, trend: "", color: "text-info" },
    { label: "Failed", value: failed, icon: AlertTriangle, trend: "", color: "text-destructive" },
  ];

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your processing overview.</p>
        </div>
        <Button variant="default" asChild>
          <Link to="/dashboard/upload"><Upload className="mr-2 h-4 w-4" /> Upload Document</Link>
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Failed to load billing information</p>
            <p className="text-xs text-destructive/70 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Quota warning */}
      {!loading && !error && usagePercent > 60 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-primary rounded-2xl p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary-foreground/10 rounded-xl p-2.5">
              <AlertTriangle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-foreground">
                You've used {usageLabel}
              </p>
              <p className="text-xs text-primary-foreground/60 mt-0.5">Upgrade for more capacity</p>
            </div>
          </div>
          <Button size="sm" className="bg-background text-foreground hover:bg-background/90 shadow-sm" asChild>
            <Link to="/dashboard/billing">Upgrade</Link>
          </Button>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.color} opacity-60`} />
                </div>
                <div className="flex items-end gap-2">
                  <span className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</span>
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

      {/* Usage */}
      <Card>
        <CardHeader className="pb-2 sm:pb-3"><CardTitle className="text-sm sm:text-base font-semibold">{billing?.usage.window === "daily" ? "Daily" : "Monthly"} Usage</CardTitle></CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
            <span className="text-muted-foreground">
              {loading ? "Loading..." : usageLabel}
            </span>
            <span className="font-semibold">{Math.round(usagePercent)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2.5 rounded-full" />
          <p className="text-xs text-muted-foreground mt-3">
            Plan: {loading ? "Loading..." : billing?.plan.charAt(0).toUpperCase() + billing?.plan.slice(1)} · Resets {billing ? getUsageSuffix(billing.usage.window) : "today"}
          </p>
        </CardContent>
      </Card>

      {/* Recent jobs */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 sm:pb-3 gap-2">
          <CardTitle className="text-sm sm:text-base font-semibold">Recent Jobs</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-muted-foreground w-fit" asChild>
            <Link to="/dashboard/jobs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {!jobsLoaded ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading recent uploads...</div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center">
              <div className="bg-muted rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">No uploads yet</h3>
              <p className="text-sm text-muted-foreground">Upload a file to see it appear here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 sm:py-3 px-2 sm:px-3 rounded-lg hover:bg-muted/50 transition-colors gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="bg-muted rounded-lg p-1 sm:p-2 shrink-0">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{job.fileName}</p>
                      <p className="text-xs text-muted-foreground hidden sm:block">{job.uploadedAt}</p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          )}
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
