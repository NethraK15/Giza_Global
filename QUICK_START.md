# 🚀 Quick Start: Frontend-Backend Integration

## TL;DR - Run These Commands

### Terminal 1: Backend
```powershell
cd PID-Parser-SaaS/backend-service
npx prisma db push
node scripts/seed.js
New-Item -ItemType Directory -Path "./storage" -Force
npm install
npm run dev
# ✅ Runs on http://localhost:4000
```

### Terminal 2: Frontend
```powershell
cd document-genie
npm install
npm run dev
# ✅ Runs on http://localhost:8080
```

### Test It
1. Open http://localhost:8080
2. Click "Sign Up"
3. Create account: name, email@example.com, password
4. Redirects to dashboard ✅
5. Upload a PDF/image
6. See it in the Jobs page ✅

---

## ✅ What Was Done

### Environment Files Created
- `backend-service/.env` - Backend config (port 4000, database, secrets)
- `document-genie/.env.local` - Frontend config (API URL)

### Backend Code Updated

**1. Auth Routes** (`backend-service/src/routes/auth.js`)
- ✅ `/api/auth/signup` - Now accepts `name` parameter
- ✅ `/api/auth/login` - Returns `displayName`
- ✅ `/api/auth/forgot-password` - NEW endpoint added

**2. Job Routes** (`backend-service/src/routes/jobs.js`)
- ✅ `/api/upload` - NEW endpoint for file uploads

**3. Database Schema** (`backend-service/prisma/schema.prisma`)
- ✅ Added `displayName` field to User model

---

## 📋 API Endpoints Summary

| Endpoint | Method | Auth? | Purpose |
|----------|--------|-------|---------|
| `/api/auth/signup` | POST | ❌ | Create account |
| `/api/auth/login` | POST | ❌ | Login |
| `/api/auth/forgot-password` | POST | ❌ | Reset password |
| `/api/upload` | POST | ✅ | Upload file |
| `/api/jobs` | GET | ✅ | List user's jobs |
| `/api/jobs/:id` | GET | ✅ | Get job details |
| `/api/users/me` | GET | ✅ | Get user profile |
| `/api/health` | GET | ❌ | Health check |

---

## 🧪 Verify Integration Works

### Option 1: Browser Test
```
1. http://localhost:8080 → Home page
2. Click Sign Up → Create account with name
3. Get redirected to dashboard
4. Go to Upload → Upload a file
5. Go to Jobs → See file listed with "queued" status
✅ All working!
```

### Option 2: PowerShell Test
```powershell
# Test signup
$body = '{"name":"Test","email":"test@example.com","password":"pass123"}' | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:4000/api/auth/signup -Method POST -Body $body -Headers @{"Content-Type"="application/json"}

# Check response has token ✅
```

### Option 3: Check Database
```powershell
# In backend-service directory
npx prisma studio
# Opens http://localhost:5555
# See User table with new signups
✅ Database updated!
```

---

## ⚠️ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Cannot GET /api/health" | Backend not running: `npm run dev` in backend-service |
| "CORS error" in browser | Backend not running OR wrong port (should be 4000) |
| "Email already in use" | Use new email or delete old user from database |
| File upload failed | Check file < 5MB, type is PDF/PNG/JPG, storage/ dir exists |
| Login fails with correct email | Check password is correct, check JWT_SECRET unchanged |
| Token expired | Tokens last 7 days, login again |

---

## 📝 Configuration Files

### `.env` (Backend)
```env
PORT=4000
DATABASE_URL="postgresql://postgres:password@localhost:5432/pid_parser_db?schema=public"
JWT_SECRET="dev-secret-change-in-production"
AI_SERVICE_URL="http://127.0.0.1:8000"
STORAGE_DIR="./storage"
```

### `.env.local` (Frontend)
```env
VITE_API_BASE_URL=http://localhost:4000
```

---

## 🔄 Next: AI Service Integration (Later)

When ready to process uploads with AI:

```powershell
# Terminal 3
cd PID-Parser-SaaS/ai-service
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 4 (in backend-service)
node src/worker.js
```

Worker will automatically:
- Detect new uploaded files
- Send to AI service for processing
- Store results in database
- Update job status

---

## 📊 Files Changed Summary

### Created: 2 files
- `backend-service/.env` - Environment config
- `document-genie/.env.local` - Frontend env

### Modified: 3 files
- `backend-service/src/routes/auth.js` - Auth endpoints
- `backend-service/src/routes/jobs.js` - Upload endpoint
- `backend-service/prisma/schema.prisma` - User model

### New API Routes: 2
- `POST /api/auth/forgot-password`
- `POST /api/upload`

### Updated Routes: 2
- `POST /api/auth/signup` - accepts name
- `POST /api/auth/login` - returns displayName

---

## ✨ Features Ready

✅ User signup/login with JWT auth
✅ Forgot password endpoint
✅ File upload (5MB, PDF/PNG/JPG)
✅ Job tracking and status
✅ User profile endpoints
✅ Plan/quota management
✅ CORS configured
✅ Database seeding

---

## 🎯 Checklist After Setup

- [ ] Backend `.env` created
- [ ] Frontend `.env.local` created
- [ ] Database schema updated: `npx prisma db push`
- [ ] Seed data created: `node scripts/seed.js`
- [ ] Storage directory created: `New-Item -ItemType Directory -Path "./storage"`
- [ ] Backend running on port 4000 ✅
- [ ] Frontend running on port 8080 ✅
- [ ] Can signup with name ✅
- [ ] Can login ✅
- [ ] Can upload file ✅
- [ ] Can view jobs ✅

---

## 🆘 Help

Full documentation:
- See `INTEGRATION_GUIDE.md` for detailed setup and debugging
- See `CHANGES_SUMMARY.md` for all changes made and code examples

Quick questions?
1. Check backend logs: `npm run dev` output
2. Check frontend logs: DevTools Console (F12)
3. Check database: `npx prisma studio`
4. Check network: DevTools Network tab (look for 4000 requests)

---

**Status**: ✅ **Ready for Integration Testing**

Frontend and backend are fully integrated. Start the servers and test!
