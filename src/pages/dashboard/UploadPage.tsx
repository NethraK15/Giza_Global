import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertCircle, Loader2, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config";
import { formatUsageLabel, isUsageLimitExceeded, useBilling } from "@/hooks/use-billing";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"];

const formatMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)}MB`;

export default function UploadPage() {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const { billing, loading: billingLoading, updateUsage, refetch } = useBilling();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return `Unsupported file type. Upload one of: ${ALLOWED_EXTENSIONS.join(", ")}.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File is too large (${formatMb(file.size)}). Maximum allowed size is 5MB.`;
    }
    return null;
  };

  const startUpload = async (file: File) => {
    setValidationError("");
    setCreatedJobId(null);
    setState("uploading");
    setFileName(file.name || "document");
    const interval = simulateProgress();

    const token = localStorage.getItem("document-genie-token");
    if (!token) {
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setState("success");
      }, 2500);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.UPLOAD), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.usage) {
          updateUsage(data.usage);
        }

        if (res.status === 429) {
          throw new Error("Upload limit reached. Please wait for your quota to reset or upgrade your plan.");
        }

        throw new Error(data.error || "Upload failed");
      }

      if (data?.usage) {
        updateUsage(data.usage);
      }

      setCreatedJobId(data.jobId);
      clearInterval(interval);
      setProgress(100);
      setState("success");

      // Keep usage in sync across all dashboard pages.
      void refetch();
    } catch (err) {
      clearInterval(interval);
      setState("error");
      setValidationError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const processSelectedFile = (file: File | undefined) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setFileName(file.name);
      setState("error");
      return;
    }

    if (billing && isUsageLimitExceeded(billing.usage)) {
      setFileName(file.name);
      setState("error");
      setValidationError("Upload limit reached. Please wait for your quota to reset or upgrade your plan.");
      return;
    }

    startUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processSelectedFile(file);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processSelectedFile(e.target.files?.[0]);
    e.currentTarget.value = "";
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
    setValidationError("");
    setCreatedJobId(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground text-sm">Upload a document for AI processing.</p>
        {!billingLoading && billing && (
          <p className="text-xs text-muted-foreground mt-1">Usage: {formatUsageLabel(billing.usage)}</p>
        )}
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
                className="p-4 sm:p-8"
              >
                <div
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 md:p-16 text-center transition-all duration-300 ${
                    state === "dragging"
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setState("dragging"); }}
                  onDragLeave={() => setState("idle")}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <div className="bg-muted rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                    <CloudUpload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-base mb-1">Drop your document here</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    PDF, PNG, JPG up to 5MB
                  </p>
                  <Button variant="default" onClick={handleFileSelect}>
                    <FileText className="mr-2 h-4 w-4" /> Browse Files
                  </Button>
                  {validationError && (
                    <p className="text-sm text-destructive mt-4" role="alert">{validationError}</p>
                  )}
                </div>
              </motion.div>
            )}

            {state === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-12 text-center"
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
                className="p-6 sm:p-12 text-center"
              >
                <div className="bg-success/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="h-7 w-7 text-success" />
                </div>
                <h3 className="font-semibold text-base mb-1">Upload Successful!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {fileName} is queued for processing.
                  {createdJobId ? ` Job ID: ${createdJobId}` : ""}
                </p>
                <Button variant="default" onClick={reset}>Upload Another</Button>
              </motion.div>
            )}

            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 sm:p-12 text-center"
              >
                <div className="bg-destructive/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-5">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
                <h3 className="font-semibold text-base mb-1">Upload Failed</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {validationError || `${fileName} could not be processed. The file may be corrupted or unsupported.`}
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
          <Button variant="outline" size="sm" onClick={handleFileSelect}>Select File</Button>
          <Button variant="outline" size="sm" onClick={simulateError}>Simulate Error</Button>
          <Button variant="outline" size="sm" onClick={reset}>Reset</Button>
        </CardContent>
      </Card>
    </div>
  );
}
