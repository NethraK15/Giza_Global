import { mockJobs } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  processing: { label: "Processing", className: "bg-info/10 text-info", dot: "bg-info animate-pulse-soft" },
  completed: { label: "Completed", className: "bg-success/10 text-success", dot: "bg-success" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

export default function JobsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Job Status</h1>
        <p className="text-muted-foreground text-sm">Track the status of your document processing jobs.</p>
      </div>

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
                {mockJobs.map((job, i) => {
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
                            <FileText className="h-4 w-4 text-muted-foreground" />
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
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
    </div>
  );
}
