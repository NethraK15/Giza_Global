# Giza GLobal Parser

Giza GLobal Parser is a full-stack P&ID document parsing SaaS prototype built with React + Vite on the frontend and Node.js + Express for backend mock APIs.

It supports:

- Public marketing pages (Home, Pricing, About)
- Auth flows (Login, Signup, Forgot Password)
- File upload with validation (PDF/JPG/JPEG/PNG, 5MB max)
- Job status tracking (`queued`, `processing`, `completed`, `failed`)
- Billing state handling (Free and Paid plan simulation)
- Results viewer with input preview, overlay panel, graph embed, and downloads (JSON/CSV/images)

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend (mock API): Node.js, Express, Multer
- Testing: Vitest, Testing Library, Supertest

## Project Structure

```text
document-genie/
	server/
		index.js                 # Express mock API server
	src/
		pages/
			Auth.tsx
			Index.tsx
			Pricing.tsx
			About.tsx
			dashboard/
				Overview.tsx
				UploadPage.tsx
				JobsPage.tsx
				ResultsPage.tsx
				BillingPage.tsx
		test/
			backend-routes.test.ts # Backend route integration test
	package.json
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run backend API server (port 4000):

```bash
npm run server
```

3. In another terminal, run frontend app (port 5173 by default):

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:5173
```

## Available Scripts

- `npm run dev`: Start frontend dev server
- `npm run server`: Start Express mock backend
- `npm run build`: Build production frontend bundle
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm test`: Run all tests once
- `npm run test:watch`: Run tests in watch mode

## Routes (Frontend)

### Public

- `/`
- `/pricing`
- `/about`

### Auth

- `/auth`
- `/auth/login`
- `/auth/signup`
- `/auth/forgot`

### App

- `/dashboard`
- `/dashboard/upload`
- `/dashboard/jobs`
- `/dashboard/results`
- `/dashboard/billing`

## API Endpoints (Mock Backend)

Base URL: `http://localhost:4000`

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

### Billing

- `GET /api/billing/subscription` (auth required)
- `POST /api/billing/upgrade` (auth required)

### Upload + Jobs

- `POST /api/upload` (auth required, multipart file)
- `POST /api/jobs` (auth required)
- `GET /api/jobs` (auth required)
- `GET /api/jobs/:jobId/status` (auth required)
- `GET /api/jobs/:jobId/result` (auth required)

## Validation and Limits

- Allowed upload file types: PDF, JPG, JPEG, PNG
- Max file size: 5MB
- Free plan usage: up to 5 files per day
- Paid plan usage: up to 1000 files per month

## Auth and Tokens

After login/signup, the frontend stores the token in local storage under:

- `document-genie-token`

Billing fallback state is persisted in:

- `document-genie-usage`

## Testing

Run all tests:

```bash
npm test
```

Run backend route integration test only:

```bash
npm test -- --run src/test/backend-routes.test.ts
```

This test covers:

- Auth signup/login
- Billing subscription + upgrade
- Upload endpoint
- Job create/list/status/result flow

## Current Status

- Mock API first flow: complete
- Core backend routes merged: complete
- Core backend routes tested: complete
- Real API contract integration: pending (next phase with Backend/AI owner)

## Notes

- Backend data is in-memory for development/demo.
- Restarting the backend resets users/jobs/artifacts.
- `multer@1.x` is currently used in this workspace and shows a deprecation warning; migrate to `multer@2.x` in the next hardening pass.


