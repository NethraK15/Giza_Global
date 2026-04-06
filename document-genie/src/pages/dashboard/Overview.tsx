import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockJobs, mockUsage } from "@/data/mockData";
import { Upload, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileText, TrendingUp, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const completed = mockJobs.filter((j) => j.status === "completed").length;
  const processing = mockJobs.filter((j) => j.status === "processing" || j.status === "queued").length;
  const failed = mockJobs.filter((j) => j.status === "failed").length;
  const usagePercent = (mockUsage.used / mockUsage.limit) * 100;

  const stats = [
    { label: "Total Jobs", value: mockJobs.length, icon: Activity, trend: "+12%", color: "text-foreground" },
    { label: "Completed", value: completed, icon: CheckCircle2, trend: "+8%", color: "text-success" },
    { label: "In Progress", value: processing, icon: Clock, trend: "", color: "text-info" },
    { label: "Failed", value: failed, icon: AlertTriangle, trend: "", color: "text-destructive" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your processing overview.</p>
        </div>
        <Button variant="default" asChild>
          <Link to="/dashboard/upload"><Upload className="mr-2 h-4 w-4" /> Upload Document</Link>
        </Button>
      </div>

      {/* Quota warning */}
      {usagePercent > 60 && (
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
                You've used {mockUsage.used} of {mockUsage.limit} uploads this month
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
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

      {/* Usage */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Monthly Usage</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">{mockUsage.used} of {mockUsage.limit} uploads used</span>
            <span className="font-semibold">{Math.round(usagePercent)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2.5 rounded-full" />
          <p className="text-xs text-muted-foreground mt-3">Plan: {mockUsage.plan.charAt(0).toUpperCase() + mockUsage.plan.slice(1)} · Resets monthly</p>
        </CardContent>
      </Card>

      {/* Recent jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link to="/dashboard/jobs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {mockJobs.slice(0, 4).map((job) => (
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
