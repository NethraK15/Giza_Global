const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../db');
const { authenticateToken } = require('../middlewares/auth');
const { checkQuota } = require('../middlewares/quota');
const { success, failure } = require('../utils/apiResponse');

// Multer config for file upload (Max 5MB)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.STORAGE_DIR || './storage');
  },
  filename: (req, file, cb) => {
    // Unique filename
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

const toBrowserStorageUrl = (filePath) => {
  if (!filePath) return null;
  const fileName = path.basename(filePath);
  return `http://localhost:4000/storage/${encodeURIComponent(fileName)}`;
};

const toArtifactUrl = (artifactPath) => {
  if (!artifactPath) return null;
  if (/^https?:\/\//i.test(artifactPath)) return artifactPath;

  const normalized = artifactPath.replace(/\\/g, '/').replace(/^\/+/, '');

  // Some AI outputs include app/static paths (sometimes prefixed by job id).
  const appStaticMarker = '/app/static/';
  const staticMarker = '/static/';
  const appStaticIndex = normalized.indexOf(appStaticMarker);
  const staticIndex = normalized.indexOf(staticMarker);

  if (normalized.startsWith('app/static/')) {
    return `http://127.0.0.1:8000/static/${normalized.slice('app/static/'.length)}`;
  }

  if (normalized.startsWith('static/')) {
    return `http://127.0.0.1:8000/static/${normalized.slice('static/'.length)}`;
  }

  if (appStaticIndex !== -1) {
    return `http://127.0.0.1:8000/static/${normalized.slice(appStaticIndex + appStaticMarker.length)}`;
  }

  if (staticIndex !== -1) {
    return `http://127.0.0.1:8000/static/${normalized.slice(staticIndex + staticMarker.length)}`;
  }

  return `http://127.0.0.1:8000/artifacts/${normalized}`;
};

const parseResultArtifact = (artifact) => {
  if (!artifact || artifact.name !== 'full_parse_result') return null;

  try {
    return JSON.parse(artifact.path);
  } catch (error) {
    console.error('Failed to parse stored artifact JSON:', error);
    return null;
  }
};

const buildGraphHtml = (result) => {
  const detectionCount = Array.isArray(result?.detections) ? result.detections.length : 0;
  const lineCount = Array.isArray(result?.line_detections) ? result.line_detections.length : 0;
  const artifactCount = result?.artifacts ? Object.keys(result.artifacts).length : 0;

  return `
    <html>
      <body style="margin:0;background:#0f172a;color:#e2e8f0;font-family:ui-sans-serif,system-ui,sans-serif;">
        <div style="padding:16px;">
          <h3 style="margin:0 0 10px;">Parsed Result Summary</h3>
          <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
            <div style="background:#111827;border:1px solid #334155;border-radius:12px;padding:12px;">Detections<br><strong style="font-size:28px;">${detectionCount}</strong></div>
            <div style="background:#111827;border:1px solid #334155;border-radius:12px;padding:12px;">Line Detections<br><strong style="font-size:28px;">${lineCount}</strong></div>
            <div style="background:#111827;border:1px solid #334155;border-radius:12px;padding:12px;">Artifacts<br><strong style="font-size:28px;">${artifactCount}</strong></div>
          </div>
        </div>
      </body>
    </html>
  `;
};

const buildDisplayResult = (job) => {
  const artifacts = job.artifacts || [];
  const fullParseArtifact = artifacts.find((artifact) => artifact.name === 'full_parse_result');
  const parsed = parseResultArtifact(fullParseArtifact);

  const artifactLinks = [];
  if (parsed?.artifacts && typeof parsed.artifacts === 'object') {
    for (const [name, relativePath] of Object.entries(parsed.artifacts)) {
      artifactLinks.push({
        name,
        label: name.replace(/_/g, ' '),
        url: toArtifactUrl(relativePath),
      });
    }
  }

  const detections = Array.isArray(parsed?.detections) ? parsed.detections : [];
  const lineDetections = Array.isArray(parsed?.line_detections) ? parsed.line_detections : [];
  const fields = detections.length > 0
    ? detections.map((detection, index) => ({
        key: `Detection ${index + 1}`,
        value: `${detection.label || 'component'} ${Array.isArray(detection.bbox) ? `@ [${detection.bbox.join(', ')}]` : ''}`.trim(),
        confidence: typeof detection.confidence === 'number' ? detection.confidence : 0,
      }))
    : [
        {
          key: 'Status',
          value: job.status,
          confidence: 1,
        },
      ];

  return {
    jobId: job.id,
    fileName: path.basename(job.originalFile || 'document'),
    status: job.status,
    inputPreviewUrl: toBrowserStorageUrl(job.originalFile),
    overlayImageUrl: artifactLinks[0]?.url || null,
    graphHtml: buildGraphHtml(parsed),
    fields,
    artifactLinks,
    result: parsed,
    lineDetections,
    processingTime: job.processingTime,
    error: job.error,
  };
};

// GET /api/jobs -> list user's jobs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { artifacts: true }
    });
    return success(res, 200, { jobs }, { jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return failure(res, 500, 'Failed to fetch jobs', 'JOB_LIST_FAILED');
  }
});

// GET /api/jobs/:id -> get specific job
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { artifacts: true }
    });
    if (!job || job.userId !== req.user.id) {
      return failure(res, 404, 'Job not found', 'JOB_NOT_FOUND');
    }
    return success(res, 200, { job }, { job });
  } catch (error) {
    console.error('Error fetching job:', error);
    return failure(res, 500, 'Failed to fetch job', 'JOB_FETCH_FAILED');
  }
});

// GET /api/jobs/:id/result -> get parsed result + artifact links for result page
router.get('/:id/result', authenticateToken, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { artifacts: true },
    });

    if (!job || job.userId !== req.user.id) {
      return failure(res, 404, 'Job not found', 'JOB_NOT_FOUND');
    }

    if (job.status !== 'completed') {
      return failure(res, 409, 'Job is not completed yet', 'JOB_NOT_COMPLETED');
    }

    const displayResult = buildDisplayResult(job);
    return success(res, 200, displayResult, displayResult);
  } catch (error) {
    console.error('Error fetching job result:', error);
    return failure(res, 500, 'Failed to fetch job result', 'JOB_RESULT_FAILED');
  }
});

// POST /api/jobs -> upload file, check quota, create job
router.post('/', authenticateToken, checkQuota, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return failure(res, 400, 'No file uploaded', 'FILE_REQUIRED');
    }

    const userId = req.user.id;
    const isFree = req.dbUser.planType === 'free';
    
    // Increment usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyUsage: { increment: isFree ? 1 : 0 },
        monthlyUsage: { increment: !isFree ? 1 : 0 }
      }
    });

    const job = await prisma.job.create({
      data: {
        userId,
        status: 'queued',
        originalFile: req.file.path,
        fileSize: req.file.size
      }
    });

    // In an ideal B3 scenario, a worker process picks this up.
    // For now, we return successfully. The worker will handle AI processing.
    return success(res, 201, { job }, { job });
  } catch (error) {
    console.error('Upload error:', error);
    return failure(res, 500, 'Failed to create job', 'JOB_CREATE_FAILED');
  }
});

// POST /api/upload -> alias for POST /api/jobs to match frontend expectations
router.post('/upload', authenticateToken, checkQuota, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return failure(res, 400, 'No file uploaded', 'FILE_REQUIRED');
    }

    const userId = req.user.id;
    const isFree = req.dbUser.planType === 'free';
    
    // Increment usage
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyUsage: { increment: isFree ? 1 : 0 },
        monthlyUsage: { increment: !isFree ? 1 : 0 }
      }
    });

    const job = await prisma.job.create({
      data: {
        userId,
        status: 'queued',
        originalFile: req.file.path,
        fileSize: req.file.size
      }
    });

    // Return jobId in format expected by frontend
    return success(res, 201, { 
      jobId: job.id,
      id: job.id,
      status: job.status,
      fileName: req.file.originalname,
      fileSize: job.fileSize,
      createdAt: job.createdAt
    }, {
      jobId: job.id,
      id: job.id,
      status: job.status,
      fileName: req.file.originalname,
      fileSize: job.fileSize,
      createdAt: job.createdAt
    });
  } catch (error) {
    console.error('Upload error:', error);
    return failure(res, 500, 'Failed to create job', 'JOB_CREATE_FAILED');
  }
});

module.exports = router;
