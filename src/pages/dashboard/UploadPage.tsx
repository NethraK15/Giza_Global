import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 20;
      });
    }, 300);
    return interval;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("uploading");
    const file = e.dataTransfer.files[0];
    setFileName(file?.name || "document.pdf");
    const interval = simulateProgress();
    setTimeout(() => { clearInterval(interval); setProgress(100); setState("success"); }, 2500);
  };

  const handleFileSelect = () => {
    setState("uploading");
    setFileName("selected_document.pdf");
    const interval = simulateProgress();
    setTimeout(() => { clearInterval(interval); setProgress(100); setState("success"); }, 2500);
  };

  const simulateError = () => {
    setState("uploading");
    setFileName("corrupted_file.pdf");
    const interval = simulateProgress();
    setTimeout(() => { clearInterval(interval); setState("error"); }, 2000);
  };

  const reset = () => {
    setState("idle");
    setFileName("");
    setProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground text-sm">Upload a document for AI processing.</p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {(state === "idle" || state === "dragging") && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 md:p-16 text-center transition-all duration-300 ${
                    state === "dragging"
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
                  onDragLeave={() => setState("idle")}
                  onDrop={handleDrop}
                >
                  <div className="bg-muted rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                    <CloudUpload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Drop your document here</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    PDF, DOCX, PNG, JPG up to 25MB
                  </p>
                  <Button variant="default" onClick={handleFileSelect}>
                    <FileText className="mr-2 h-4 w-4" /> Browse Files
                  </Button>
                </div>
              </motion.div>
            )}

            {state === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <div className="bg-primary/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                </div>
                <h3 className="font-semibold text-base mb-1">Processing {fileName}</h3>
                <p className="text-sm text-muted-foreground mb-6">Uploading and starting AI analysis...</p>
                <div className="max-w-xs mx-auto">
                  <Progress value={Math.min(progress, 100)} className="h-2 rounded-full" />
                  <p className="text-xs text-muted-foreground mt-2">{Math.min(Math.round(progress), 100)}%</p>
                </div>
              </motion.div>
            )}

            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <div className="bg-success/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <h3 className="font-semibold text-base mb-1">Upload Successful!</h3>
                <p className="text-sm text-muted-foreground mb-6">{fileName} is being processed.</p>
                <Button variant="default" onClick={reset}>Upload Another</Button>
              </motion.div>
            )}

            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-12 text-center"
              >
                <div className="bg-destructive/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <h3 className="font-semibold text-base mb-1">Upload Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {fileName} could not be processed. The file may be corrupted or unsupported.
                </p>
                <Button variant="default" onClick={reset}>Try Again</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Demo controls */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Demo Controls</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFileSelect}>Simulate Success</Button>
          <Button variant="outline" size="sm" onClick={simulateError}>Simulate Error</Button>
          <Button variant="outline" size="sm" onClick={reset}>Reset</Button>
        </CardContent>
      </Card>
    </div>
  );
}
