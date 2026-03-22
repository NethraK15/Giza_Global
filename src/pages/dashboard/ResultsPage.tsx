import { useState } from "react";
import { mockResults } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSearch, Download, FileText, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const selected = mockResults.find((r) => r.jobId === selectedJob);

  if (mockResults.length === 0) {
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
            {mockResults.map((r) => (
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
                  <Button variant="outline" size="sm">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Export JSON
                  </Button>
                </CardHeader>
                <CardContent>
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
