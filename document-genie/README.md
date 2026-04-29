# Document Genie Frontend

Document Genie is a React + Vite frontend for the PID parser SaaS prototype. It talks to the local mock API server in `server/index.js` during development.

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the mock backend API in one terminal:

```bash
npm run server
```

3. Start the frontend in another terminal:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:5173
```

## Environment Variables

The frontend uses one optional environment variable:

- `VITE_API_BASE_URL`: Base URL for the backend API.
  - Default: `http://localhost:4000`

Example `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

If you do not set it, the app falls back to `http://localhost:4000` automatically.

## Build Command

```bash
npm run build
```

This generates the production frontend in `dist/`.

## Deploy Command

```bash
npm run build
```

After the build completes, deploy the contents of `dist/` to your static host of choice, such as Vercel, Netlify, Azure Static Web Apps, or S3/CloudFront.

## Helpful Scripts

- `npm run preview`: Preview the production build locally
- `npm run lint`: Run ESLint
- `npm run test`: Run the Vitest suite
- `npm run test:watch`: Run tests in watch mode

## Key Local Storage Keys

- `document-genie-token`: Auth token stored after login/signup
- `document-genie-usage`: Billing usage state used by the dashboard


