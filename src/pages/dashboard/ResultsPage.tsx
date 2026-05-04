import { useEffect, useState } from "react";
import { ResultArtifact, mockResults } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSearch, Download, FileText, Inbox, Image as ImageIcon, Network, FileJson, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "@/lib/api-config";

// Sample graph generator for P&ID diagrams
const generateSampleGraphHtml = (jobId: string): string => {
  const colors = [
    { primary: "#22d3ee", secondary: "#06b6d4", accent: "#bae6fd" },
    { primary: "#60a5fa", secondary: "#3b82f6", accent: "#bfdbfe" },
    { primary: "#34d399", secondary: "#10b981", accent: "#bbf7d0" },
  ];
  const colorSet = colors[parseInt(jobId.split("-").pop() || "0") % colors.length];

  return `
    <html>
      <body style="margin:0;background:#0f172a;color:#e2e8f0;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;">
        <div style="padding:24px;">
          <h3 style="margin:0 0 16px;font-size:18px;font-weight:600;">P&ID Graph Visualization</h3>
          <svg width="100%" height="350" viewBox="0 0 800 350" style="background:#111827;border-radius:8px;">
            <!-- Title -->
            <text x="400" y="30" text-anchor="middle" fill="#94a3b8" font-size="16" font-weight="bold">Process & Instrumentation Diagram</text>
            
            <!-- Pump -->
            <circle cx="100" cy="180" r="32" fill="${colorSet.primary}" opacity="0.2" stroke="${colorSet.primary}" stroke-width="2"/>
            <circle cx="100" cy="180" r="28" fill="none" stroke="${colorSet.primary}" stroke-width="2"/>
            <polygon points="100,155 115,180 100,205 85,180" fill="${colorSet.primary}"/>
            <text x="100" y="240" text-anchor="middle" fill="${colorSet.accent}" font-size="14" font-weight="600">P-101</text>
            <text x="100" y="260" text-anchor="middle" fill="#94a3b8" font-size="12">Pump</text>
            
            <!-- Valve 1 -->
            <rect x="220" y="150" width="80" height="60" rx="8" fill="${colorSet.secondary}" opacity="0.15" stroke="${colorSet.secondary}" stroke-width="2"/>
            <circle cx="260" cy="180" r="18" fill="none" stroke="${colorSet.secondary}" stroke-width="2"/>
            <line x1="242" y1="162" x2="278" y2="198" stroke="${colorSet.secondary}" stroke-width="2"/>
            <text x="260" y="240" text-anchor="middle" fill="${colorSet.accent}" font-size="14" font-weight="600">V-210</text>
            <text x="260" y="260" text-anchor="middle" fill="#94a3b8" font-size="12">Control Valve</text>
            
            <!-- Sensor -->
            <rect x="430" y="155" width="70" height="50" rx="6" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="2"/>
            <circle cx="465" cy="180" r="14" fill="none" stroke="#f59e0b" stroke-width="2"/>
            <line x1="451" y1="180" x2="479" y2="180" stroke="#f59e0b" stroke-width="2"/>
            <text x="465" y="240" text-anchor="middle" fill="#fcd34d" font-size="14" font-weight="600">T-301</text>
            <text x="465" y="260" text-anchor="middle" fill="#94a3b8" font-size="12">Temperature</text>
            
            <!-- Reactor -->
            <rect x="600" y="145" width="90" height="70" rx="8" fill="#ec4899" opacity="0.15" stroke="#ec4899" stroke-width="2"/>
            <rect x="610" y="155" width="70" height="50" rx="6" fill="none" stroke="#ec4899" stroke-width="2"/>
            <circle cx="645" cy="180" r="10" fill="#ec4899"/>
            <text x="645" y="240" text-anchor="middle" fill="#f472b6" font-size="14" font-weight="600">R-401</text>
            <text x="645" y="260" text-anchor="middle" fill="#94a3b8" font-size="12">Reactor</text>
            
            <!-- Connections -->
            <line x1="132" y1="180" x2="220" y2="180" stroke="#f8fafc" stroke-width="3"/>
            <line x1="300" y1="180" x2="430" y2="180" stroke="#f8fafc" stroke-width="3"/>
            <line x1="500" y1="180" x2="600" y2="180" stroke="#f8fafc" stroke-width="3" stroke-dasharray="8 6"/>
            
            <!-- Arrows -->
            <polygon points="215,175 220,180 215,185" fill="#f8fafc"/>
            <polygon points="495,175 500,180 495,185" fill="#f8fafc"/>
            <polygon points="595,175 600,180 595,185" fill="#f8fafc"/>
            
            <!-- Legend -->
            <text x="50" y="320" fill="#cbd5e1" font-size="12"><tspan font-weight="600">Legend:</tspan></text>
            <line x1="120" y1="315" x2="140" y2="315" stroke="#f8fafc" stroke-width="3"/>
            <text x="145" y="320" fill="#cbd5e1" font-size="12">Process Line</text>
            
            <line x1="320" y1="315" x2="340" y2="315" stroke="#f8fafc" stroke-width="3" stroke-dasharray="8 6"/>
            <text x="345" y="320" fill="#cbd5e1" font-size="12">Instrumented Line</text>
          </svg>
          <div style="margin-top:16px;padding:12px;background:#1e293b;border-radius:6px;font-size:12px;color:#94a3b8;">
            <strong>Detected Elements:</strong> 4 symbols (Pump, Valve, Sensor, Reactor) | <strong>Connections:</strong> 3 process lines | <strong>Confidence:</strong> 94%
          </div>
        </div>
      </body>
    </html>
  `;
};

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
  const [results, setResults] = useState<ResultArtifact[]>(mockResults);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const selected = results.find((r) => r.jobId === selectedJob);

  useEffect(() => {
    const token = localStorage.getItem("document-genie-token");
    if (!token) return;

    const loadResults = async () => {
      try {
        const jobsRes = await fetch(getApiUrl(API_ENDPOINTS.JOBS.LIST), {
          headers: getAuthHeaders(token),
        });
        const jobsData = await jobsRes.json();
        if (!jobsRes.ok || !Array.isArray(jobsData.jobs)) return;

        // Create a map of job IDs to their filenames
        const jobFileNameMap = new Map<string, string>();
        jobsData.jobs.forEach((job: { id: string; fileName: string }) => {
          jobFileNameMap.set(job.id, job.fileName);
        });

        const completedJobs = jobsData.jobs.filter(
          (job: { status: string }) => job.status === "completed"
        );
        const completedIds = completedJobs.map((job: { id: string }) => job.id);

        const loaded = await Promise.all(
          completedIds.map(async (jobId: string) => {
            const res = await fetch(getApiUrl(API_ENDPOINTS.JOBS.RESULT(jobId)), {
              headers: getAuthHeaders(token),
            });
            const data = await res.json();
            if (res.ok) {
              const result = data as ResultArtifact;
              // Ensure fileName is set from the jobs list
              if (!result.fileName && jobFileNameMap.has(jobId)) {
                result.fileName = jobFileNameMap.get(jobId)!;
              }
              // Generate sample graph if not provided by backend
              if (!result.graphHtml) {
                result.graphHtml = generateSampleGraphHtml(jobId);
              }
              return result;
            }
            return null;
          })
        );

        const filtered = loaded.filter((item): item is ResultArtifact => Boolean(item));
        if (filtered.length > 0) {
          setResults(filtered);
        }
      } catch {
        // Keep local fallback data if backend is unavailable.
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
            <h3 className="font-semibold text-base mb-1">No results yet</h3>
            <p className="text-sm text-muted-foreground">Upload and process a document to see results here.</p>
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
