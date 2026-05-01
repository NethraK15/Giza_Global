import cors from "cors";
import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const FREE_DAILY_LIMIT = 5;
const PAID_MONTHLY_LIMIT = 1000;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("Unsupported file type. Allowed: PDF, JPG, JPEG, PNG"));
      return;
    }
    cb(null, true);
  },
});

const users = new Map();
const jobs = new Map();
const artifacts = new Map();

const getPeriodStart = (window, nowMs = Date.now()) => {
  const date = new Date(nowMs);

  if (window === "daily") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getUsageConfigForPlan = (plan) => {
  if (plan === "paid") {
    return { limit: PAID_MONTHLY_LIMIT, window: "monthly" };
  }

  return { limit: FREE_DAILY_LIMIT, window: "daily" };
};

const ensureUsageState = (user) => {
  const { limit, window } = getUsageConfigForPlan(user.plan);
  const existingUsed = typeof user.usage?.used === "number" ? user.usage.used : 0;
  const existingPeriodStart = typeof user.usage?.periodStart === "string" ? user.usage.periodStart : null;

  user.usage = {
    used: existingUsed,
    limit,
    window,
    periodStart: existingPeriodStart || getPeriodStart(window),
  };
};

const resetUsageIfNeeded = (user, nowMs = Date.now()) => {
  ensureUsageState(user);

  const currentPeriodStart = getPeriodStart(user.usage.window, nowMs);
  if (user.usage.periodStart !== currentPeriodStart) {
    user.usage.used = 0;
    user.usage.periodStart = currentPeriodStart;
  }
};

const demoUser = {
  id: "user-demo-1",
  name: "Demo User",
  email: "demo@giza.ai",
  password: "password123",
  plan: "free",
  usage: { used: 2, limit: FREE_DAILY_LIMIT, window: "daily", periodStart: getPeriodStart("daily") },
  subscriptionStatus: "active",
};
users.set(demoUser.email, demoUser);

const nowString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "").trim();
  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }
  const user = [...users.values()].find((u) => u.id === token);
  if (!user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  req.user = user;
  next();
};

const updateJobStatuses = () => {
  for (const job of jobs.values()) {
    if (job.status === "queued" && Date.now() - job.createdAtMs > 3000) {
      job.status = "processing";
    } else if (job.status === "processing" && Date.now() - job.createdAtMs > 8000) {
      job.status = job.fileName.includes("fail") ? "failed" : "completed";
      job.completedAt = job.status === "completed" ? nowString() : undefined;
      if (job.status === "completed" && !artifacts.has(job.id)) {
        artifacts.set(job.id, {
          jobId: job.id,
          inputPreviewUrl: "https://picsum.photos/seed/input-preview/900/500",
          overlayImageUrl: "https://picsum.photos/seed/overlay-image/900/500",
          graphHtml: "<html><body style='font-family:sans-serif;display:grid;place-items:center;height:100%;margin:0;'><div><h3>PID Graph</h3><p>Generated graph preview for completed job.</p></div></body></html>",
          fields: [
            { key: "Tag", value: "P-101", confidence: 0.97 },
            { key: "Line Size", value: "4 in", confidence: 0.94 },
            { key: "Service", value: "Cooling Water", confidence: 0.92 },
          ],
        });
      }
    }
  }
};

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/signup", (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password || !name) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (users.has(email)) {
    res.status(409).json({ error: "User already exists" });
    return;
  }
  const user = {
    id: randomUUID(),
    name,
    email,
    password,
    plan: "free",
    usage: { used: 0, limit: FREE_DAILY_LIMIT, window: "daily", periodStart: getPeriodStart("daily") },
    subscriptionStatus: "active",
  };
  users.set(email, user);
  res.status(201).json({ token: user.id, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.get(email);
  if (!user || user.password !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({ token: user.id, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  res.json({ message: "If this email exists, a reset link has been sent." });
});

app.get("/api/billing/subscription", authMiddleware, (req, res) => {
  resetUsageIfNeeded(req.user);

  res.json({
    plan: req.user.plan,
    subscriptionStatus: req.user.subscriptionStatus,
    usage: req.user.usage,
  });
});

app.post("/api/billing/upgrade", authMiddleware, (req, res) => {
  if (req.user.plan === "paid") {
    res.status(400).json({ error: "User is already on a paid plan" });
    return;
  }
  
  req.user.plan = "paid";
  req.user.subscriptionStatus = "active";
  req.user.usage = {
    used: 0,
    limit: PAID_MONTHLY_LIMIT,
    window: "monthly",
    periodStart: getPeriodStart("monthly"),
  };
  
  res.status(200).json({
    success: true,
    message: "Successfully upgraded to paid plan",
    plan: req.user.plan,
    subscriptionStatus: req.user.subscriptionStatus,
    usage: req.user.usage,
  });
});

app.post("/api/upload", authMiddleware, upload.single("file"), (req, res) => {
  resetUsageIfNeeded(req.user);

  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  if (req.user.usage.used >= req.user.usage.limit) {
    res.status(429).json({
      error: "Upload quota exceeded for current plan",
      usage: req.user.usage,
    });
    return;
  }

  req.user.usage.used += 1;

  const jobId = randomUUID();
  const job = {
    id: jobId,
    userId: req.user.id,
    fileName: req.file.originalname,
    type: req.file.mimetype,
    pages: 1,
    status: "queued",
    uploadedAt: nowString(),
    completedAt: undefined,
    createdAtMs: Date.now(),
  };
  jobs.set(jobId, job);

  res.status(201).json({
    jobId,
    status: "queued",
    uploadedAt: job.uploadedAt,
    usage: req.user.usage,
  });
});

app.post("/api/jobs", authMiddleware, (req, res) => {
  const { fileName, type = "application/pdf", pages = 1 } = req.body ?? {};
  if (!fileName) {
    res.status(400).json({ error: "fileName is required" });
    return;
  }
  const jobId = randomUUID();
  const job = {
    id: jobId,
    userId: req.user.id,
    fileName,
    type,
    pages,
    status: "queued",
    uploadedAt: nowString(),
    completedAt: undefined,
    createdAtMs: Date.now(),
  };
  jobs.set(jobId, job);
  res.status(201).json({ jobId, status: "queued" });
});

app.get("/api/jobs", authMiddleware, (req, res) => {
  updateJobStatuses();
  const list = [...jobs.values()]
    .filter((job) => job.userId === req.user.id)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .map(({ createdAtMs, userId, ...job }) => job);
  res.json({ jobs: list });
});

app.get("/api/jobs/:jobId/status", authMiddleware, (req, res) => {
  updateJobStatuses();
  const job = jobs.get(req.params.jobId);
  if (!job || job.userId !== req.user.id) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json({ jobId: job.id, status: job.status, uploadedAt: job.uploadedAt, completedAt: job.completedAt });
});

app.get("/api/jobs/:jobId/result", authMiddleware, (req, res) => {
  updateJobStatuses();
  const job = jobs.get(req.params.jobId);
  if (!job || job.userId !== req.user.id) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  if (job.status !== "completed") {
    res.status(409).json({ error: "Job is not completed yet", status: job.status });
    return;
  }
  const result = artifacts.get(job.id);
  res.json({ ...result, fileName: job.fileName, status: job.status });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File exceeds max 5MB limit" });
      return;
    }
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof Error) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Unknown server error" });
});

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Mock API server running at http://localhost:${port}`);
  });
}

export default app;
