# Giza Global Service - Document Genie & PID Parser SaaS

## 🎯 Project Status

**✅ FULLY INTEGRATED & READY TO TEST**

The **document-genie** frontend and **PID-Parser-SaaS** backend are fully integrated with all API contracts finalized. Both systems are production-ready for local testing.

---

## 📦 What's Included

### Frontend: document-genie
- React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Pages: Auth (Sign Up/Login), Dashboard, Upload, Jobs, Results, Pricing, About
- Real-time polling for job status updates
- Responsive design with dark/light mode support
- Complete test coverage with unit tests and E2E tests

### Backend: PID-Parser-SaaS (backend-service)
- Node.js/Express REST API
- PostgreSQL database with Prisma ORM
- JWT authentication
- File upload handling (max 5MB)
- Plan-based quota management (Free/Pro/Enterprise)
- Background job processing

### AI Service: PID-Parser-SaaS (ai-service)
- FastAPI service for P&ID parsing
- YOLO-based object detection
- Pipe extraction and analysis
- Optional integration (runs separately)

---

## 🚀 Quick Start (3 Steps)

### Terminal 1: Database & Backend Setup
```powershell
cd PID-Parser-SaaS/backend-service

# Update database schema from Prisma
npx prisma db push

# Seed initial plans (Free, Pro, Enterprise)
node scripts/seed.js

# Create storage directory for uploads
New-Item -ItemType Directory -Path "./storage" -Force

# Install dependencies
npm install

# Start backend server on port 4000
npm run dev
```

**Expected Output:**
```
Backend API running on port 4000
✅ CORS enabled for localhost:8080
✅ Database connected
```

### Terminal 2: Frontend Setup & Run
```powershell
cd document-genie

# Install dependencies
npm install

# Start frontend dev server on port 8080
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Press h to show help
```

### Terminal 3: Optional - AI Service
```powershell
cd PID-Parser-SaaS/ai-service

# Install Python dependencies
pip install -r requirements.txt

# Start AI service on port 8000
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 Test the Integration

### Browser Test (Recommended)
1. Open [http://localhost:8080](http://localhost:8080) in your browser
2. Click **"Sign Up"** button
3. Create account with:
   - **Name**: Your name
   - **Email**: test@example.com
   - **Password**: any password
4. Should redirect to **Dashboard** ✅
5. Navigate to **Upload** section
6. Upload a PDF or image file (< 5MB)
7. Go to **Jobs** section
8. See your file listed with status (queued → processing → completed)
9. Click uploaded item to view **Results**

### PowerShell Test (Alternative)
```powershell
# Test signup
$body = @{
    name = "Test User"
    email = "testuser42@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri http://localhost:4000/api/auth/signup `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body

$response.Content | ConvertFrom-Json
# Should return: { token: "...", user: {...} }
```

### Database Verification
```powershell
# Opens Prisma Studio at http://localhost:5555
cd PID-Parser-SaaS/backend-service
npx prisma studio
```

View Users, Plans, Jobs, and Artifacts created by the integration.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│         BROWSER (http://localhost:8080)         │
│  ┌───────────────────────────────────────────┐  │
│  │  React App (document-genie)               │  │
│  │  - Auth, Dashboard, Upload, Jobs, Results │  │
│  │  - Token stored in localStorage           │  │
│  └───────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST (Express)
                     │ http://localhost:4000
                     ▼
┌─────────────────────────────────────────────────┐
│    BACKEND API (Node.js/Express, port 4000)    │
│  ┌───────────────────────────────────────────┐  │
│  │  Auth Routes: signup, login, forgot-pwd   │  │
│  │  Upload Routes: /api/upload, /api/jobs    │  │
│  │  User Routes: /api/users/me, /upgrade     │  │
│  │  Job Routes: list, status, results        │  │
│  │  Middleware: JWT auth, CORS, file upload  │  │
│  └───────────────────────────────────────────┘  │
└────────────┬─────────────────┬──────────────────┘
             │ SQL (Prisma)    │ HTTP (axios)
             │                 │
       ┌─────▼────────┐  ┌────▼──────────────┐
       │ PostgreSQL   │  │ AI Service        │
       │ (port 5432)  │  │ (port 8000)       │
       │              │  │ - P&ID parsing    │
       │ Tables:      │  │ - Detection       │
       │ - User       │  │ - Results storage │
       │ - Plan       │  └───────────────────┘
       │ - Job        │
       │ - Artifact   │
       └──────────────┘
```

### Data Flow: User Signup
```
User Browser → Sign Up Form
    ↓
POST /api/auth/signup { name, email, password }
    ↓
Backend: Validate email unique, hash password
    ↓
Create User in PostgreSQL with displayName, assign Free plan
    ↓
Generate JWT token
    ↓
Return { token, user }
    ↓
Frontend: Store token in localStorage
    ↓
Redirect to Dashboard ✅
```

---

## 📋 API Endpoints Reference

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/signup` | POST | ❌ | Create account with name, email, password |
| `/api/auth/login` | POST | ❌ | Login with email, password → JWT token |
| `/api/auth/forgot-password` | POST | ❌ | Request password reset |

### File Upload & Jobs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/upload` | POST | ✅ | Upload file → create job |
| `/api/jobs` | GET | ✅ | List user's jobs with pagination |
| `/api/jobs` | POST | ✅ | Create job manually (for testing) |
| `/api/jobs/:jobId/status` | GET | ✅ | Get job status (queued/processing/completed/failed) |
| `/api/jobs/:jobId/result` | GET | ✅ | Get job results (after completed) |

### User & Billing
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/me` | GET | ✅ | Get current user profile and plan info |
| `/api/users/upgrade` | POST | ✅ | Upgrade plan (Free → Pro → Enterprise) |

### Health Check
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/health` | GET | ❌ | Backend health status |

---

## ⚙️ Environment Configuration

### Backend Environment (.env)
**Location**: `PID-Parser-SaaS/backend-service/.env`

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/pid_parser_db?schema=public"

# JWT Authentication
JWT_SECRET="development-secret-key-change-this-in-production"

# AI Service Integration
AI_SERVICE_URL="http://127.0.0.1:8000"

# File Upload
STORAGE_DIR="./storage"
MAX_FILE_SIZE=5242880  # 5MB in bytes

# CORS Origins
CORS_ORIGIN="http://localhost:8080,http://localhost:5173"
```

### Frontend Environment (.env.local)
**Location**: `document-genie/.env.local`

```env
# Backend API
VITE_API_BASE_URL=http://localhost:4000

# App Configuration
VITE_MAX_FILE_SIZE=5242880  # 5MB (must match backend)
```

### AI Service Environment (Optional)
**Location**: `PID-Parser-SaaS/ai-service/.env`

```env
# FastAPI Configuration
API_PORT=8000
DEBUG=True

# Model Configuration
MODEL_PATH="./models/yolo_weights"
CONFIDENCE_THRESHOLD=0.5
```

---

## 🔧 Integration Changes Made

### Database Schema
**File**: `PID-Parser-SaaS/backend-service/prisma/schema.prisma`

Added optional `displayName` field to User model to store user's name from signup:
```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  displayName String?   // NEW: User's display name
  passwordHash String
  planId      String
  // ... rest of fields
}
```

### Auth Routes Updated
**File**: `PID-Parser-SaaS/backend-service/src/routes/auth.js`

1. **Signup** (`POST /api/auth/signup`):
   - Now accepts optional `name` parameter
   - Stores as `displayName` in database
   - Uses email prefix as fallback if name not provided

2. **Login** (`POST /api/auth/login`):
   - Returns `displayName` in user response

3. **Forgot Password** (`POST /api/auth/forgot-password`):
   - New endpoint for password recovery (optional integration)

### Upload Endpoint Created
**File**: `PID-Parser-SaaS/backend-service/src/routes/jobs.js`

Added `POST /api/upload` endpoint that:
- Accepts multipart file upload
- Creates job record in database
- Returns jobId for polling results
- Enforces 5MB file size limit
- Checks user quota before accepting upload

---

## ✅ Integration Verification Checklist

After starting both servers, verify:

### Pre-Startup
- [ ] PostgreSQL running locally (default port 5432)
- [ ] Node.js 18+ installed
- [ ] Port 4000 and 8080 are available
- [ ] You're in the A1 directory

### Backend Startup
- [ ] Backend shows: `Backend API running on port 4000`
- [ ] No error messages in console
- [ ] CORS headers configured
- [ ] Database connected successfully

### Frontend Startup
- [ ] Frontend shows: `Local: http://localhost:8080/`
- [ ] No error messages in console
- [ ] Hot reload working (try editing file and saving)

### Functionality Tests
- [ ] **Signup**: Create account with name, email, password → Token in localStorage
- [ ] **Login**: Email + password → Redirects to dashboard
- [ ] **Dashboard**: Shows current plan and usage metrics
- [ ] **Upload**: Select file → Upload succeeds → Job appears in list
- [ ] **Jobs**: File shows with status (queued → processing → completed)
- [ ] **Results**: Click job → See results and download buttons
- [ ] **Pricing**: Browse pricing page (public, no auth needed)
- [ ] **About**: Browse about page (public, no auth needed)
- [ ] **Logout**: Clear token and redirect to home ✅

### Database Verification (Optional)
```powershell
cd PID-Parser-SaaS/backend-service
npx prisma studio
# Visit http://localhost:5555
# Verify: Users created, Plans seeded, Jobs stored
```

---

## 🧪 Running Tests

### Unit Tests (Frontend)
```powershell
cd document-genie

# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests (Playwright)
```powershell
cd document-genie

# Run all E2E tests
npx playwright test e2e/chrome-edge-verification.spec.ts

# Run specific test
npx playwright test -g "upload"

# Run in headed mode (see browser)
npx playwright test --headed

# View test report
npx playwright show-report
```

### Linting & Build
```powershell
cd document-genie

# Check for linting errors
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Full Validation Suite
```powershell
cd document-genie
npm run test && npm run lint && npm run build && npx playwright test e2e/
```

---

## 🐛 Troubleshooting

### "Connection refused" on localhost:4000
**Problem**: Backend not running  
**Solution**: 
```powershell
cd PID-Parser-SaaS/backend-service
npm run dev
```
Ensure backend shows `Backend API running on port 4000`

### "Email already exists" error on signup
**Problem**: Email already registered  
**Solution**: Use a different email address or clear database:
```powershell
cd PID-Parser-SaaS/backend-service
npx prisma db push --skip-generate --force-reset
```

### "Cannot find module" errors
**Problem**: Dependencies not installed  
**Solution**: Install dependencies in respective directories:
```powershell
cd document-genie && npm install
cd ../backend-service && npm install
```

### File upload fails with 413 error
**Problem**: File too large or upload endpoint issue  
**Solution**: Check file size < 5MB and ensure backend is running

### "Quota exceeded" error
**Problem**: Used all uploads for Free plan (limit: 5)  
**Solution**: Sign up with a different email OR upgrade to Pro plan

### Token not persisting in localStorage
**Problem**: Browser localStorage disabled or cleared  
**Solution**: 
- Check browser privacy settings
- Clear browser cache and try again
- Use incognito window for fresh session

### Database errors
**Problem**: PostgreSQL not running or wrong credentials  
**Solution**:
```powershell
# Check if PostgreSQL is running
Get-Service postgresql* | Select-Object Status

# If not running, start it (Windows)
Start-Service postgresql

# Or reset database
cd PID-Parser-SaaS/backend-service
npx prisma db push --skip-generate
node scripts/seed.js
```

---

## 🚢 Next Steps

### 1. AI Service Integration (Optional)
If you have the AI service running on port 8000:
- Backend will automatically send jobs to AI service
- Results are stored and returned to frontend
- No code changes needed - already configured

### 2. Production Deployment
When ready to deploy:
- Change `JWT_SECRET` in backend `.env`
- Update `DATABASE_URL` to production PostgreSQL
- Change `VITE_API_BASE_URL` to production API URL
- Set `NODE_ENV=production` in backend
- Build frontend: `npm run build`
- Deploy built assets and backend separately

### 3. Azure Integration
For Azure deployment:
- Use Azure PostgreSQL for database
- Use Azure App Service or Container Instances for backend
- Use Azure Static Web Apps or CDN for frontend
- Use Azure Storage for file uploads
- Update `.env` variables accordingly

### 4. Additional Features
Consider implementing:
- Email notifications on job completion
- Batch file uploads
- Advanced search and filtering
- Admin dashboard
- Usage analytics and reporting
- API rate limiting and monitoring

---

## 📚 Project Structure

```
A1/
├── README.md (this file)
├── document-genie/                    # React Frontend
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   │   ├── Auth.tsx              # Sign up & login
│   │   │   ├── Dashboard/
│   │   │   │   └── Overview.tsx       # Main dashboard
│   │   │   ├── Upload.tsx             # File upload
│   │   │   ├── Jobs.tsx               # Jobs list
│   │   │   └── Results.tsx            # Job results
│   │   ├── components/                # Reusable components
│   │   ├── hooks/                     # Custom React hooks
│   │   └── test/                      # Unit tests
│   ├── e2e/                           # E2E tests
│   ├── package.json                   # Dependencies
│   └── .env.local                     # Frontend config
│
└── PID-Parser-SaaS/                   # Backend & AI Service
    ├── backend-service/                # Node.js/Express API
    │   ├── src/
    │   │   ├── routes/                # API endpoints
    │   │   ├── middlewares/           # Auth, CORS, etc.
    │   │   └── utils/                 # Helper functions
    │   ├── prisma/                    # Database schema
    │   ├── scripts/                   # Setup & seed scripts
    │   ├── .env                       # Backend config
    │   └── package.json
    │
    └── ai-service/                    # FastAPI (Optional)
        ├── app/
        │   ├── main.py                # FastAPI app
        │   ├── api/                   # Endpoints
        │   ├── services/              # Business logic
        │   └── schemas/               # Data models
        ├── models/                    # ML models
        ├── requirements.txt           # Python deps
        └── .env                       # AI config
```

---

## 🤝 Support & Debugging

### Check Logs
```powershell
# Backend logs show in terminal where you ran "npm run dev"
# Frontend logs show in browser console (F12)
# Check browser Network tab for API calls:
# 1. Open DevTools (F12)
# 2. Go to Network tab
# 3. Perform action (signup/upload)
# 4. See request/response details
```

### Common Response Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | ✅ All good |
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | JWT token missing or invalid |
| 403 | Forbidden | Quota exceeded or access denied |
| 404 | Not Found | Endpoint doesn't exist |
| 500 | Server Error | Check backend logs |
| 5XX | Server Error | Check database connection |

### Enable Debug Logging
```powershell
# Backend: Set debug env var
$env:DEBUG="*"
npm run dev

# Frontend: Enable Vite debug
$env:DEBUG="vite:*"
npm run dev
```

---

## 📄 File References

- **Frontend Config**: `document-genie/.env.local`
- **Backend Config**: `PID-Parser-SaaS/backend-service/.env`
- **Database Schema**: `PID-Parser-SaaS/backend-service/prisma/schema.prisma`
- **Auth Routes**: `PID-Parser-SaaS/backend-service/src/routes/auth.js`
- **Job Routes**: `PID-Parser-SaaS/backend-service/src/routes/jobs.js`
- **Frontend Tests**: `document-genie/src/test/frontend-critical-paths.test.tsx`
- **E2E Tests**: `document-genie/e2e/chrome-edge-verification.spec.ts`

---

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **Prisma ORM**: https://www.prisma.io/docs/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **Playwright**: https://playwright.dev/
- **TypeScript**: https://www.typescriptlang.org/

---

## ✨ Summary

Your system is **fully integrated and ready** for:
- ✅ Local development and testing
- ✅ Unit and E2E test validation
- ✅ Feature development and debugging
- ✅ Production deployment (with config updates)

**Start here**: Open [http://localhost:8080](http://localhost:8080) and create an account!

---

**Last Updated**: April 2026  
**Status**: ✅ Production Ready  
**Frontend**: React 18 + TypeScript + Vite  
**Backend**: Node.js + Express + PostgreSQL + Prisma
