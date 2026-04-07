import { useEffect, useMemo, useState } from "react";
import { Job } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:4000";

const statusConfig: Record<Job["status"], { label: string; className: string; dot: string }> = {
  queued: { label: "Queued", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  processing: { label: "Processing", className: "bg-info/10 text-info", dot: "bg-info animate-pulse-soft" },
  completed: { label: "Completed", className: "bg-success/10 text-success", dot: "bg-success" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

const POLL_INTERVAL_MS = 3000;

const fetchRemoteJobs = async (token: string): Promise<Job[]> => {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch jobs");
  }
  return data.jobs as Job[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [lastPolledAt, setLastPolledAt] = useState<Date>(new Date());
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  const poll = async () => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      setJobs([]);
      setLoadMessage("Sign in to view your backend job queue.");
      setLastPolledAt(new Date());
      return;
    }

    try {
      const remoteJobs = await fetchRemoteJobs(token);
      setJobs(remoteJobs);
      setLoadMessage(null);
      setLastPolledAt(new Date());
    } catch {
      setJobs([]);
      setLoadMessage("Unable to load jobs from the backend.");
      setLastPolledAt(new Date());
    }
  };

  const isPollingActive = useMemo(() => jobs.some((job) => job.status === "queued" || job.status === "processing"), [jobs]);

  useEffect(() => {
    const token = localStorage.getItem("document-genie-token");
    if (!isPollingActive && !token) return;

    poll();

    const interval = setInterval(() => {
      poll();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPollingActive]);

  const handleManualPoll = () => {
    poll();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Job Status</h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${isPollingActive ? "bg-info animate-pulse-soft" : "bg-success"}`} />
            {isPollingActive ? "Polling" : "Up to date"}
          </span>
          <Button variant="outline" size="sm" onClick={handleManualPoll}>
            <RefreshCcw aria-hidden="true" className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Track the status of your document processing jobs. Last checked at {lastPolledAt.toLocaleTimeString()}.
      </p>

      {loadMessage && (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          {loadMessage}
        </div>
      )}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h3 className="text-base font-semibold">No live jobs yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Upload a document to see backend job status here.</p>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">File</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Pages</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Uploaded</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Completed</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job, i) => {
                  const sc = statusConfig[job.status];
                  return (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded-lg p-2 shrink-0">
                            <FileText aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-sm truncate max-w-[200px]">{job.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{job.type}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.className}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{job.pages}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{job.uploadedAt}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{job.completedAt || "—"}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          aria-label={`Open actions for ${job.fileName}`}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
