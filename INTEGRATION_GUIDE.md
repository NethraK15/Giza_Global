# Document-Genie & PID-Parser-SaaS Integration Guide

## Overview
This guide provides complete integration instructions for connecting the frontend (document-genie) with the backend (PID-Parser-SaaS).

---

## 🔴 CRITICAL ISSUES TO FIX

### 1. **Port Mismatch**
- **Frontend expects**: `http://localhost:4000`
- **Backend runs on**: `5000` (default)
- **Solution**: Change backend port to 4000 OR update frontend to use 5000

### 2. **Auth Signup Field Mismatch**
- **Frontend sends**: `{ name, email, password }`
- **Backend expects**: `{ email, password }` (no name field)
- **Solution**: Either update frontend to not send name OR update backend to accept/store name field

### 3. **Upload Endpoint Naming**
- **Frontend calls**: `POST /api/upload`
- **Backend provides**: `POST /api/jobs` (for file upload)
- **Solution**: Create `/api/upload` alias or update frontend to use `/api/jobs`

### 4. **Missing Forgot Password Endpoint**
- **Frontend expects**: `POST /api/auth/forgot-password`
- **Backend missing**: This endpoint doesn't exist
- **Solution**: Implement forgot-password endpoint (or make it a no-op for now)

### 5. **Directory Structure**
Backend expects `./storage` directory for file uploads - must exist or be created

---

## ✅ RECOMMENDED INTEGRATION APPROACH

### Option A (RECOMMENDED): Update Backend to Match Frontend Expectations
This is cleaner because frontend is already UI-focused and shouldn't change.

**Changes needed:**
1. Change backend PORT to 4000
2. Update auth/signup to accept optional `name` field
3. Create `/api/upload` endpoint that aliases `/api/jobs` POST
4. Implement forgot-password endpoint

---

## 📋 DETAILED CHANGES REQUIRED

### Backend Changes

#### 1. Rename upload endpoint
**File**: `backend-service/src/routes/jobs.js`

Add a `/api/upload` route that delegates to the POST /api/jobs handler:

```javascript
// At the bottom of jobs.js, before module.exports
router.post('/upload', authenticateToken, checkQuota, upload.single('file'), async (req, res) => {
  // ... reuse the POST / handler logic, but return jobId in response
  // Response format: { jobId: job.id, ... }
});
```

#### 2. Update signup to accept name field
**File**: `backend-service/src/routes/auth.js`

```javascript
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;  // Extract name
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Store name in user profile if provided
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        displayName: name || email.split('@')[0],  // Default to email prefix
        planId: freePlan.id
      }
    });

    res.status(201).json({ 
      token, 
      user: { id: user.id, email: user.email, plan: 'free', displayName: user.displayName } 
    });
  } catch (error) { ... }
});
```

#### 3. Implement forgot-password endpoint
**File**: `backend-service/src/routes/auth.js`

```javascript
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: 'If email exists, reset link sent' });

    // TODO: In production, generate reset token, store in DB, send email
    // For now, just return success message
    res.status(200).json({ message: 'Password reset instructions sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});
```

#### 4. Update Prisma schema to add displayName
**File**: `backend-service/prisma/schema.prisma`

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  displayName   String?  // Optional display name
  passwordHash  String
  planId        String   @default("free-plan-id")
  plan          Plan     @relation(fields: [planId], references: [id])
  dailyUsage    Int      @default(0)
  monthlyUsage  Int      @default(0)
  lastResetDate DateTime @default(now())
  jobs          Job[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### 5. Change PORT to 4000
**File**: `backend-service/.env`

Create file with:
```
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/pid_parser_db?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
AI_SERVICE_URL="http://127.0.0.1:8000"
STORAGE_DIR="./storage"
```

---

## 🔧 ENVIRONMENT FILES TO CREATE

### 1. Backend Environment File
**Path**: `PID-Parser-SaaS/backend-service/.env`

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/pid_parser_db?schema=public"

# Authentication
JWT_SECRET="development-secret-key-change-this-in-production"
JWT_EXPIRY=7d

# AI Service
AI_SERVICE_URL="http://127.0.0.1:8000"
AI_SERVICE_TIMEOUT=30000

# File Storage
STORAGE_DIR="./storage"
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN="http://localhost:8080,http://localhost:5173"

# Logging
LOG_LEVEL=debug
```

### 2. Frontend Environment File (Optional)
**Path**: `document-genie/.env.local`

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:4000
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Document Genie
VITE_MAX_FILE_SIZE=5242880

# Feature Flags
VITE_ENABLE_MOCK_DATA=false
```

### 3. Update Frontend Vite Config (if using .env)
**File**: `document-genie/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
```

---

## 🚀 HOW TO RUN AND VERIFY INTEGRATION

### Prerequisites
- Node.js 18+ and npm/yarn installed
- PostgreSQL 13+ running locally
- Python 3.8+ for AI service (optional for basic testing)
- Git bash or PowerShell on Windows

### Step 1: Setup Database

```powershell
# Navigate to backend
cd PID-Parser-SaaS/backend-service

# Push Prisma schema to database
npx prisma db push

# Seed initial data (plans)
node scripts/seed.js

# Or open Prisma Studio to verify
npx prisma studio
```

### Step 2: Create Storage Directory

```powershell
# In backend-service directory
New-Item -ItemType Directory -Path "./storage" -Force
```

### Step 3: Start Backend

```powershell
# Terminal 1: In PID-Parser-SaaS/backend-service
npm install
npm run dev

# Expected output:
# Backend API running on port 4000
```

### Step 4: Start Frontend

```powershell
# Terminal 2: In document-genie
npm install
npm run dev

# Expected output:
# ➜  Local:   http://localhost:8080/
```

### Step 5: Start AI Service (Optional)

```powershell
# Terminal 3: In PID-Parser-SaaS/ai-service
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Expected output:
# Uvicorn running on http://127.0.0.1:8000
```

### Step 6: Verify Integration

#### Test Auth Endpoints

```powershell
# Test Signup
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "testpass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/auth/signup" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Expected: 201 Created with { token: "...", user: {...} }
```

```powershell
# Test Login
$body = @{
    email = "test@example.com"
    password = "testpass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:4000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body

# Expected: 200 OK with { token: "...", user: {...} }
```

#### Test in Browser UI

1. **Open frontend**: `http://localhost:8080`

2. **Test Signup**:
   - Go to `/auth/signup`
   - Enter: Name, Email, Password
   - Click Sign Up
   - Expected: Redirected to dashboard, token saved to localStorage

3. **Test File Upload**:
   - Go to Dashboard → Upload
   - Drag/drop a PDF or image (< 5MB)
   - Expected: Shows "success" state with jobId

4. **Test Job Listing**:
   - Go to Dashboard → Jobs
   - Should see uploaded jobs in table
   - Click refresh to poll status

5. **Test Logout & Login**:
   - Log out
   - Log back in with same credentials
   - Expected: Dashboard shows previous jobs

#### Health Check Endpoints

```powershell
# Backend health
Invoke-WebRequest -Uri "http://localhost:4000/api/health"
# Expected: { status: "ok", service: "backend-api" }

# AI Service health (if running)
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health"
# Expected: FastAPI health check response
```

---

## 🔍 DEBUGGING TIPS

### If Frontend Can't Connect to Backend
1. **Check backend is running**: `http://localhost:4000/api/health`
2. **Check CORS is enabled**: 
   - Backend should have `app.use(cors())`
   - Check `CORS_ORIGIN` env var includes frontend URL
3. **Check network tab in DevTools** for actual error messages

### If File Upload Fails
1. **Storage directory**: Check `./storage` exists in backend
2. **File size**: Ensure file < 5MB
3. **File type**: Only PDF, PNG, JPG, JPEG allowed
4. **Permissions**: Backend should have write access to storage

### If Auth Token Won't Persist
1. **Check localStorage**: DevTools → Application → LocalStorage → document-genie-token
2. **Token format**: Should be a JWT string, not JSON
3. **Token expiry**: Default is 7 days
4. **CORS credentials**: Ensure fetch includes credentials if needed

### If Jobs Won't Load from Backend
1. **Check user ID**: Verify token contains correct user ID
2. **Check database**: Run `npx prisma studio` and check jobs table
3. **Check auth middleware**: Ensure Bearer token is properly formatted

### Database Connection Issues
```powershell
# Test PostgreSQL connection
psql -h localhost -U postgres -d pid_parser_db

# Or view in Prisma Studio
npx prisma studio
```

---

## 📝 API CONTRACT SUMMARY

### Authentication Endpoints
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/auth/signup` | ❌ | `{ name, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | ❌ | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/forgot-password` | ❌ | `{ email }` | `{ message }` |

### Job Endpoints
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/api/jobs` | ✅ Bearer | - | `[{ id, status, ... }]` |
| GET | `/api/jobs/:id` | ✅ Bearer | - | `{ id, status, artifacts, ... }` |
| POST | `/api/jobs` | ✅ Bearer | `form-data: file` | `{ id, status, ... }` |
| POST | `/api/upload` | ✅ Bearer | `form-data: file` | `{ jobId, status, ... }` |

### User Endpoints
| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| GET | `/api/users/me` | ✅ Bearer | - | `{ id, email, plan, ... }` |
| POST | `/api/users/upgrade` | ✅ Bearer | - | `{ id, plan, ... }` |

### Health Endpoints
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/api/health` | ❌ | `{ status: "ok" }` |

---

## 📊 Integration Checklist

### Backend Setup
- [ ] `.env` file created with PORT=4000
- [ ] Database connection verified
- [ ] Seed data run (plans created)
- [ ] Storage directory created
- [ ] `displayName` field added to User model (Prisma)
- [ ] `/api/upload` endpoint created
- [ ] Auth signup updated to accept `name`
- [ ] Forgot-password endpoint implemented
- [ ] Backend running on `http://localhost:4000`
- [ ] Health check responds: `http://localhost:4000/api/health`

### Frontend Setup
- [ ] `.env.local` file created (optional but recommended)
- [ ] API base URL set to `http://localhost:4000`
- [ ] Frontend running on `http://localhost:8080`
- [ ] localStorage key is `document-genie-token`

### Integration Testing
- [ ] Signup with new user works
- [ ] Login works
- [ ] Token stored in localStorage
- [ ] Forgot password endpoint responds
- [ ] File upload succeeds
- [ ] Uploaded files appear in Jobs list
- [ ] Job detail view works
- [ ] Logout clears token
- [ ] Redirects work (unauthenticated → /auth)

### AI Service Integration (Later Phase)
- [ ] AI service running on `http://127.0.0.1:8000`
- [ ] Worker process configured
- [ ] Job status updates from processing → completed
- [ ] Artifacts generated and stored

---

## 🎯 NEXT STEPS AFTER INTEGRATION

1. **Document API Responses**: Standardize all API response formats
2. **Add Error Handling**: Better error messages for each endpoint
3. **Implement Job Polling**: Current uses 3s poll, optimize if needed
4. **Add File Download**: Users should download artifacts
5. **Implement Pagination**: For large job lists
6. **Add Admin Dashboard**: Monitor jobs and users
7. **Production Deployment**: Move to cloud with proper DB
8. **Email Service**: Implement forgot-password email sending

---

## 📞 Troubleshooting Contacts

If you encounter issues:
1. Check the **Debugging Tips** section above
2. Review backend logs: `npm run dev` output
3. Review frontend logs: Browser DevTools Console
4. Check database: `npx prisma studio`
5. Verify environment variables are set correctly
