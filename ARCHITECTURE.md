# 🏗️ System Architecture & Integration Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                             │
│            http://localhost:8080                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Application (document-genie)                      │   │
│  │  - Pages: Auth, Dashboard, Upload, Jobs                 │   │
│  │  - UI Components: Buttons, Forms, Tables                │   │
│  │  - State: React Query, localStorage                    │   │
│  │  - Token Storage: localStorage["document-genie-token"]  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────────────────────────┘
                        │ HTTP/REST Calls with JWT Bearer Token
                        │ http://localhost:4000/api/*
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND API SERVER (Port 4000)                    │
│            Node.js/Express (PID-Parser-SaaS)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authentication Routes                                  │   │
│  │  ├─ POST /api/auth/signup        ─► Create User        │   │
│  │  ├─ POST /api/auth/login         ─► Get JWT Token      │   │
│  │  └─ POST /api/auth/forgot-pwd    ─► Reset Password     │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  File Upload Routes                                     │   │
│  │  ├─ POST /api/upload             ─► Create Job         │   │
│  │  ├─ POST /api/jobs               ─► Alternative upload │   │
│  │  ├─ GET /api/jobs                ─► List user jobs    │   │
│  │  └─ GET /api/jobs/:id            ─► Job details       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  User Routes                                            │   │
│  │  ├─ GET /api/users/me            ─► User profile      │   │
│  │  └─ POST /api/users/upgrade      ─► Change plan       │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Middleware                                             │   │
│  │  ├─ CORS: Allows localhost:8080 requests              │   │
│  │  ├─ JWT Auth: Validates Bearer tokens                 │   │
│  │  ├─ Multer: Handles file uploads (max 5MB)           │   │
│  │  └─ Quota Check: Free vs Paid limits                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────┬──────────────────────┬──────────────────────────┘
                │ SQL Queries          │ AXIOS to AI Service
                │ Prisma ORM           │ http://127.0.0.1:8000
                │                      │
       ┌────────▼────────┐    ┌────────▼────────┐
       │  PostgreSQL DB  │    │  AI Service     │
       │  (Port 5432)    │    │  (Port 8000)    │
       │                 │    │  (Optional)     │
       │ Tables:         │    │                 │
       │ - User          │    │ Processes:      │
       │ - Plan          │    │ - P&ID parsing  │
       │ - Job           │    │ - YOLO detect.  │
       │ - Artifact      │    │ - Extract pipes │
       └─────────────────┘    │ - Visual output │
                              └─────────────────┘

                        ▲                    ▲
                        │ DB Updates         │ Results
                        └────────────────────┴─────────┐
                                                       │
                        ┌──────────────────────────────▼──┐
                        │  Background Worker (node.js)    │
                        │  Polls jobs, sends to AI service│
                        │  Updates results               │
                        └──────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. User Signup Flow
```
User → Click "Sign Up"
        ↓
    Fill Form: name, email, password
        ↓
    POST /api/auth/signup
        ↓
    Backend Validates Email Unique
        ↓
    Hash Password with bcrypt
        ↓
    Create User in PostgreSQL
    - id: UUID
    - email: string
    - displayName: string (from name field)
    - passwordHash: hashed
    - planId: "free"
        ↓
    Generate JWT Token
        ↓
    Return { token, user }
        ↓
    Frontend Stores Token in localStorage
        ↓
    Redirect to Dashboard ✅
```

### 2. User Login Flow
```
User → Click "Log In"
        ↓
    Fill Form: email, password
        ↓
    POST /api/auth/login
        ↓
    Backend Finds User by Email
        ↓
    Compare Password with Hash
        ↓
    Generate JWT Token (7 day expiry)
        ↓
    Return { token, user: { id, email, displayName, plan } }
        ↓
    Frontend Stores Token in localStorage
        ↓
    Redirect to Dashboard ✅
```

### 3. File Upload Flow
```
User → Click "Upload"
        ↓
    Select or Drag/Drop File (< 5MB)
        ↓
    Validate File Type (PDF, PNG, JPG)
        ↓
    Create FormData with file + Bearer token
        ↓
    POST /api/upload
        ↓
    Backend Validates Auth Token
        ↓
    Backend Checks Storage Quota
        ↓
    Backend Saves File to ./storage/
        ↓
    Backend Creates Job in Database
    - id: UUID
    - userId: user's UUID
    - status: "queued"
    - originalFile: path to stored file
    - fileSize: bytes
        ↓
    Return { jobId, status, fileName }
        ↓
    Frontend Shows Success Message
        ↓
    (Optional) Worker picks up job and processes ✅
```

### 4. View Jobs Flow
```
User → Go to "Jobs" Page
        ↓
    Frontend Reads Token from localStorage
        ↓
    GET /api/jobs with Bearer token
        ↓
    Backend Validates Token → Extract user ID
        ↓
    Query Database: SELECT * FROM Job WHERE userId = ?
        ↓
    Include Related Artifacts
        ↓
    Return [{ id, status, fileName, createdAt, artifacts, ... }]
        ↓
    Frontend Maps to Table Rows
        ↓
    Display with Status Badges (queued/processing/completed) ✅
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Pages                                                  │    │
│  │  ├─ Index.tsx      (Home page)                         │    │
│  │  ├─ Auth.tsx       (Login/Signup)                      │    │
│  │  │                                                      │    │
│  │  │  Dashboard Pages:                                   │    │
│  │  ├─ Overview.tsx   (Dashboard home)                    │    │
│  │  ├─ UploadPage.tsx (File upload)                       │    │
│  │  │   └─ Calls: POST /api/upload                       │    │
│  │  ├─ JobsPage.tsx   (Job listing)                       │    │
│  │  │   └─ Calls: GET /api/jobs + Polling                │    │
│  │  ├─ ResultsPage.tsx (Results view)                     │    │
│  │  │   └─ Calls: GET /api/jobs/:id                      │    │
│  │  └─ BillingPage.tsx (Plan management)                  │    │
│  │      └─ Calls: POST /api/users/upgrade                │    │
│  │                                                         │    │
│  │  Shared Components:                                    │    │
│  │  ├─ DashboardLayout.tsx (Main layout)                  │    │
│  │  │   ├─ Navbar.tsx                                    │    │
│  │  │   │   └─ Logout functionality                      │    │
│  │  │   └─ DashboardSidebar.tsx                          │    │
│  │  └─ PublicLayout.tsx (Home layout)                     │    │
│  │                                                         │    │
│  │  API Calls Architecture:                               │    │
│  │  ├─ Token from localStorage                           │    │
│  │  ├─ Bearer Authorization header                       │    │
│  │  ├─ React Query for caching                           │    │
│  │  └─ Fetch API for HTTP                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  State Management:                                              │
│  ├─ React Query: Caches API responses                          │
│  ├─ localStorage: Stores JWT token                            │
│  └─ useState: Component local state                           │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/REST
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Express.js)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Express App (index.js)                                 │    │
│  │  ├─ CORS Middleware (localhost:8080 allowed)           │    │
│  │  ├─ JSON Parser Middleware                             │    │
│  │  ├─ Multer (File upload handler)                       │    │
│  │  └─ Error Handler Middleware                           │    │
│  │                                                         │    │
│  │  Routes Container:                                     │    │
│  │  ├─ auth.js (3 endpoints)                              │    │
│  │  │   ├─ signup(email→User)                            │    │
│  │  │   ├─ login(JWT generator)                          │    │
│  │  │   └─ forgot-password(stub)                         │    │
│  │  │                                                     │    │
│  │  ├─ jobs.js (5 endpoints)                              │    │
│  │  │   ├─ GET /jobs (list)                              │    │
│  │  │   ├─ GET /jobs/:id (detail)                        │    │
│  │  │   ├─ POST /jobs (upload)                           │    │
│  │  │   └─ POST /upload (alias)                          │    │
│  │  │                                                     │    │
│  │  ├─ users.js (2 endpoints)                             │    │
│  │  │   ├─ GET /me (profile)                             │    │
│  │  │   └─ POST /upgrade (plan)                          │    │
│  │  │                                                     │    │
│  │  └─ webhooks.js (stub)                                 │    │
│  │                                                         │    │
│  │  Middleware:                                           │    │
│  │  ├─ authenticateToken (JWT validation)                │    │
│  │  └─ checkQuota (Plan limits)                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Database Layer:                                                │
│  ├─ Prisma Client (ORM)                                        │
│  ├─ Models: User, Plan, Job, Artifact                         │
│  └─ Relationships: with CASCADE delete                         │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │ SQL
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                            │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Tables:                                               │     │
│  │  ┌──────────────┐   ┌───────────┐   ┌──────────┐       │     │
│  │  │    User      │   │   Plan    │   │   Job    │       │     │
│  │  ├──────────────┤   ├───────────┤   ├──────────┤       │     │
│  │  │ id (PK)      │   │ id (PK)   │   │ id (PK)  │       │     │
│  │  │ email (UQ)   │   │ name (UQ) │   │ userId→  │       │     │
│  │  │ displayName  │◄──┤ maxDaily  │   │ status   │       │     │
│  │  │ passwordHash │   │ maxMonth. │   │ file     │       │     │
│  │  │ planId→      │   └───────────┘   │ fileSize │       │     │
│  │  │ dailyUsage   │                    │ error    │       │     │
│  │  │ monthlyUsage │                    └────┬─────┘       │     │
│  │  │ lastReset    │                         │ 1:M         │     │
│  │  │ createdAt    │                         │             │     │
│  │  │ updatedAt    │                    ┌────▼──────────┐  │     │
│  │  └──────────────┘                    │  Artifact     │  │     │
│  │                                       ├───────────────┤  │     │
│  │                                       │ id (PK)      │  │     │
│  │                                       │ jobId→       │  │     │
│  │                                       │ name         │  │     │
│  │                                       │ path         │  │     │
│  │                                       │ createdAt    │  │     │
│  │                                       └──────────────┘  │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Contract Sequence Diagram

### Authentication Sequence
```
Frontend                Backend              Database
   │                      │                      │
   ├─ POST /signup ──────→│                      │
   │  (name, email, pwd)  │                      │
   │                      ├─ Validate unique ───→│
   │                      │                      ├─ SELECT by email
   │                      │                      │
   │                      ├─ Hash password       │
   │                      │                      │
   │                      ├─ GET default plan ──→│
   │                      │                      ├─ SELECT plan
   │                      │                      │
   │                      ├─ CREATE user ───────→│
   │                      │                      ├─ INSERT User
   │                      │                      │
   │                      ├─ Generate JWT        │
   │                      │                      │
   │  ←─ {token, user} ───┤                      │
   │                      │                      │
   ├─ Store in localStorage
   │
   ├─ POST /login ──────→│
   │  (email, password)   │
   │                      ├─ SELECT user ──────→│
   │                      │                      │
   │                      ├─ Compare pwd         │
   │                      │                      │
   │                      ├─ Generate JWT        │
   │                      │                      │
   │  ←─ {token, user} ───┤                      │
   │                      │                      │
   ├─ Store token
   │
   └─ Now all requests include:
      Authorization: Bearer <token>
```

### File Upload Sequence
```
Frontend                Backend              Storage            Database
   │                      │                      │                   │
   ├─ POST /upload ──────→│                      │                   │
   │  (file, auth)        │                      │                   │
   │                      ├─ Validate JWT        │                   │
   │                      │                      │                   │
   │                      ├─ Check quota ───────────────────────────→│
   │                      │                      │                   │
   │                      ├─ Save file ─────────→│                   │
   │                      │  ./storage/xyz       ├─ Write file       │
   │                      │                      │                   │
   │                      ├─ CREATE Job ───────────────────────────→│
   │                      │                      │                   │
   │  ←─ {jobId, status} ──┤                      │                   │
   │                      │                      │                   │
   ├─ Show success        │                      │                   │
   │
   ├─ GET /jobs ─────────→│                      │                   │
   │  (with auth)         │                      │                   │
   │                      ├─ Validate JWT        │                   │
   │                      │                      │                   │
   │                      ├─ SELECT jobs ──────────────────────────→│
   │                      │  WHERE userId = ?    ├─ Query with filter│
   │                      │  INCLUDE artifacts   │                   │
   │                      │                      │                   │
   │  ←─ [{job1, job2}] ──┤                      │                   │
   │                      │                      │                   │
   └─ Display in table    │                      │                   │
                          │                      │                   │
                          │                      │                   │
(Later: Worker picks up)  │                      │                   │
   ┌─ GET queued jobs ───→│                      │                   │
   │                      ├─ SELECT status ────────────────────────→│
   │                      │  = 'queued'         │                   │
   │                      │                      │                   │
   └─ Process with AI service
   
   ├─ UPDATE job ────────────────────────────────→│
   │  status = completed  │                      │
   │  artifacts = [...]   │                      │
   │                      │                      │                   │
(Frontend polls)          │                      │                   │
   │                      │                      │                   │
   ├─ GET /jobs/:id ─────→│                      │                   │
   │                      ├─ SELECT + artifacts ─→│
   │                      │                      │
   │  ←─ {status: "completed", artifacts: [...]} │
   │                      │                      │
   └─ Display results ✅
```

---

## Environment Variable Flow

```
┌──────────────────────────────────┐
│   .env File (Backend)            │
├──────────────────────────────────┤
│ PORT=4000                        │  ──┐
│ DATABASE_URL=postgresql://...    │    ├─→ Loaded by dotenv package
│ JWT_SECRET=dev-secret-key        │    │   process.env.* variables
│ AI_SERVICE_URL=http://localhost  │  ──┘
│ STORAGE_DIR=./storage            │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  .env.local File (Frontend)      │
├──────────────────────────────────┤
│ VITE_API_BASE_URL=http://...     │  ──┐
│ VITE_MAX_FILE_SIZE=5242880       │    ├─→ Loaded by Vite
│                                  │    │   import.meta.env.* variables
└──────────────────────────────────┘  ──┘

Runtime:
├─ Backend: Uses dotenv to load .env into process.env
├─ Frontend: Vite replaces VITE_* during build time
└─ Both: Can be overridden by shell environment variables
```

---

## Error Handling Flow

```
Frontend Makes Request
    │
    ├─→ Network Error
    │   ├─ Backend not running
    │   ├─ Wrong port
    │   └─ CORS blocked
    │
    ├─→ 400 Bad Request
    │   ├─ Missing required fields
    │   ├─ Invalid email format
    │   ├─ File too large
    │   └─ Invalid file type
    │
    ├─→ 401 Unauthorized
    │   ├─ Token missing
    │   ├─ Invalid token format
    │   ├─ Token expired
    │   └─ Wrong credentials
    │
    ├─→ 403 Forbidden
    │   ├─ Token signature invalid
    │   ├─ Insufficient quota
    │   └─ Not owner of resource
    │
    ├─→ 404 Not Found
    │   ├─ User doesn't exist
    │   ├─ Job doesn't exist
    │   └─ Invalid endpoint
    │
    └─→ 500 Server Error
        ├─ Database down
        ├─ File system error
        ├─ Unhandled exception
        └─ AI service timeout

In all cases:
    ├─ Returns JSON: { error: "message" }
    ├─ Frontend shows toast/error message
    └─ Stays on current page (doesn't redirect)
```

---

## Summary

This architecture ensures:
- ✅ Clear separation of concerns (frontend/backend)
- ✅ Stateless API server (easier to scale)
- ✅ JWT-based auth (no session management)
- ✅ File uploads handled securely
- ✅ Database consistency with Prisma
- ✅ Ready for AI service integration
- ✅ Easy to debug with clear error messages

All flows are designed for first-time integration testing and can be monitored through:
1. Browser DevTools (Network, Console)
2. Backend logs (npm run dev output)
3. Prisma Studio (database inspection)
4. File system (storage directory)
