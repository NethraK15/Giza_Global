import { useEffect, useState } from "react";
import { ResultArtifact } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSearch, Download, FileText, Inbox, Image as ImageIcon, Network, FileJson, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ResultField = {
  key: string;
  value: string;
  confidence: number;
};

type ArtifactLink = {
  name: string;
  label: string;
  url: string | null;
};

type BackendResult = {
  jobId: string;
  fileName: string;
  inputPreviewUrl: string | null;
  overlayImageUrl: string | null;
  graphHtml: string;
  fields: ResultField[];
  artifactLinks?: ArtifactLink[];
  success?: boolean;
  warning?: string;
  result?: {
    warning?: string;
    detections?: Array<{ model_source?: string }>;
  };
};

type DisplayResult = ResultArtifact & {
  artifactLinks?: ArtifactLink[];
  warning?: string;
  result?: BackendResult["result"];
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:4000";

const triggerDownload = (content: BlobPart, fileName: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

const toCsv = (rows: Array<{ key: string; value: string; confidence: number }>) => {
  const header = "field,value,confidence";
  const body = rows
    .map((row) => `${row.key},${row.value},${(row.confidence * 100).toFixed(2)}%`)
    .join("\n");
  return `${header}\n${body}`;
};

export default function ResultsPage() {
  const [results, setResults] = useState<DisplayResult[]>([]);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const selected = results.find((r) => r.jobId === selectedJob);

  const normalizeResult = (payload: BackendResult): DisplayResult => ({
    jobId: payload.jobId,
    fileName: payload.fileName,
    inputPreviewUrl: payload.inputPreviewUrl || "",
    overlayImageUrl: payload.overlayImageUrl || payload.artifactLinks?.[0]?.url || "",
    graphHtml: payload.graphHtml || "<html><body></body></html>",
    fields: payload.fields || [],
    artifactLinks: payload.artifactLinks || [],
    warning: payload.warning || payload.result?.warning,
    result: payload.result,
  });

  useEffect(() => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      setLoadMessage("Sign in to see parsed results.");
      return;
    }

    const loadResults = async () => {
      try {
        const jobsRes = await fetch(`${API_BASE_URL}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobsData = await jobsRes.json();
        const jobs = Array.isArray(jobsData.jobs)
          ? jobsData.jobs
          : Array.isArray(jobsData.data?.jobs)
            ? jobsData.data.jobs
            : Array.isArray(jobsData)
              ? jobsData
              : [];

        if (!jobsRes.ok || jobs.length === 0) return;

        const completedIds = jobs
          .filter((job: { status: string }) => job.status === "completed")
          .map((job: { id: string }) => job.id);

        const loaded = await Promise.all(
          completedIds.map(async (jobId: string) => {
            const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/result`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const backendResult = (data?.data ?? data) as BackendResult;
            return res.ok ? normalizeResult(backendResult) : null;
          })
        );

        const filtered = loaded.filter((item): item is ResultArtifact => Boolean(item));
        if (filtered.length > 0) {
          setResults(filtered);
          setLoadMessage(null);
        } else {
          setLoadMessage("No completed jobs are available yet.");
        }
      } catch {
        setLoadMessage("Unable to load results from the backend.");
      }
    };

    loadResults();
  }, []);

  if (results.length === 0) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-bold">Results</h1>
          <p className="text-muted-foreground text-sm">View parsed document results.</p>
        </div>
        <Card>
          <CardContent className="py-20 text-center">
            <div className="bg-muted rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
              <Inbox className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-base mb-1">{loadMessage ? "No live results" : "No results yet"}</h3>
            <p className="text-sm text-muted-foreground">{loadMessage || "Upload and process a document to see results here."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-muted-foreground text-sm">View parsed document results.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-base font-semibold">Completed Jobs</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {results.map((r) => (
              <button
                key={r.jobId}
                onClick={() => setSelectedJob(r.jobId)}
                className={cn(
                  "w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-3",
                  selectedJob === r.jobId
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "hover:bg-muted border border-transparent"
                )}
              >
                <div className={cn(
                  "rounded-lg p-2 shrink-0",
                  selectedJob === r.jobId ? "bg-primary/10" : "bg-muted"
                )}>
                  <FileText className="h-4 w-4" />
                </div>
                <span className="truncate font-medium">{r.fileName}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Result detail */}
        <Card className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.jobId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">{selected.fileName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerDownload(JSON.stringify(selected, null, 2), `${selected.jobId}.json`, "application/json")}
                    >
                      <FileJson className="mr-1.5 h-3.5 w-3.5" /> JSON
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerDownload(toCsv(selected.fields), `${selected.jobId}.csv`, "text/csv")}
                    >
                      <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> CSV
                    </Button>
                  </div>
                </CardHeader>
                {(selected.warning || selected.result?.detections?.some((detection) => detection.model_source === 'fallback')) ? (
                  <div className="mx-6 mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
                    This result was produced by the backend fallback path, not the live AI service.
                  </div>
                ) : null}
                <CardContent>
                  <div className="space-y-5">
                    <div className="grid lg:grid-cols-2 gap-4">
                      <div className="rounded-xl border overflow-hidden">
                        <div className="px-4 py-2 border-b text-sm font-medium bg-muted/40 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" /> Input Preview
                        </div>
                        <img src={selected.inputPreviewUrl} alt="Input preview" className="w-full h-52 object-cover" />
                        <div className="p-3">
                          <Button variant="outline" size="sm" onClick={() => window.open(selected.inputPreviewUrl, "_blank", "noopener,noreferrer") }>
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download Input Image
                          </Button>
                        </div>
                      </div>

                      <div className="rounded-xl border overflow-hidden">
                        <div className="px-4 py-2 border-b text-sm font-medium bg-muted/40 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" /> Overlay Image Panel
                        </div>
                        <img src={selected.overlayImageUrl} alt="Overlay image" className="w-full h-52 object-cover" />
                        <div className="p-3">
                          <Button variant="outline" size="sm" onClick={() => window.open(selected.overlayImageUrl, "_blank", "noopener,noreferrer") }>
                            <Download className="mr-1.5 h-3.5 w-3.5" /> Download Overlay Image
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border overflow-hidden">
                      <div className="px-4 py-2 border-b text-sm font-medium bg-muted/40 flex items-center gap-2">
                        <Network className="h-4 w-4" /> Graph Panel
                      </div>
                      <iframe
                        title="PID graph"
                        srcDoc={selected.graphHtml}
                        className="w-full h-64"
                        sandbox="allow-scripts"
                      />
                    </div>

                    <div className="rounded-xl border overflow-hidden">
                      <div className="px-4 py-2 border-b text-sm font-medium bg-muted/40 flex items-center gap-2">
                        <Download className="h-4 w-4" /> Artifact Links
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <a
                            href={selected.inputPreviewUrl || undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            Open input preview
                          </a>
                          <a
                            href={selected.overlayImageUrl || undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            Open primary artifact
                          </a>
                        </div>
                        {(selected?.artifactLinks || []).length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">All artifacts</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {(selected?.artifactLinks || []).map((artifact) => (
                                <a
                                  key={artifact.name}
                                  href={artifact.url || "#"}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={cn(
                                    "rounded-lg border px-3 py-2 text-sm transition-colors",
                                    artifact.url ? "hover:bg-muted" : "opacity-50 pointer-events-none"
                                  )}
                                >
                                  {artifact.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold">Field</TableHead>
                          <TableHead className="font-semibold">Value</TableHead>
                          <TableHead className="text-right font-semibold">Confidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.fields.map((f) => (
                          <TableRow key={f.key} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-sm">{f.key}</TableCell>
                            <TableCell className="text-sm font-mono">{f.value}</TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "text-sm font-mono font-medium px-2 py-0.5 rounded-md",
                                f.confidence >= 0.95 ? "bg-success/10 text-success" :
                                f.confidence >= 0.9 ? "bg-warning/10 text-warning" :
                                "bg-destructive/10 text-destructive"
                              )}>
                                {(f.confidence * 100).toFixed(0)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </motion.div>
            ) : (
              <CardContent className="py-20 text-center">
                <div className="bg-muted rounded-2xl w-14 h-14 flex items-center justify-center mx-auto mb-4">
                  <FileSearch className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Select a job to view results</p>
              </CardContent>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
