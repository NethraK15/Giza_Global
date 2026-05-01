# API Configuration Guide

## Overview

The PID Parser SaaS frontend uses a centralized API configuration system that supports multiple environments (development, staging, production) through environment variables with sensible fallbacks.

## Configuration File Structure

### `src/lib/api-config.ts`

This is the single source of truth for all API configuration. It exports:

- **`API_BASE_URL`**: The base URL for all API calls
- **`API_ENDPOINTS`**: Constants for all API endpoint paths
- **`getApiUrl(endpoint)`**: Helper to build full API URLs
- **`getAuthHeaders(token?)`**: Helper to create auth headers
- **`getAuthToken()`**: Helper to retrieve the stored auth token

## Environment Variables

### `VITE_API_URL` (Vite)

The base URL for the backend API. Used in development, staging, and production environments.

**Default**: `http://localhost:4000` (if not set)

**Examples**:
```bash
# Development
VITE_API_URL=http://localhost:4000

# Staging
VITE_API_URL=https://api-staging.example.com

# Production
VITE_API_URL=https://api.example.com
```

## Configuration Files

### `.env`

Local development environment file. **Git-ignored** - not committed to repository.

```bash
VITE_API_URL=http://localhost:4000
```

### `.env.example`

Template file for developers. Committed to repository for documentation.

```bash
# Copy this file to .env and adjust values as needed
VITE_API_URL=http://localhost:4000
```

## How It Works

### 1. Reading Environment Variables

Vite automatically exposes environment variables prefixed with `VITE_` through `import.meta.env`:

```typescript
// In api-config.ts
const viteApiUrl = import.meta.env.VITE_API_URL;

// Returns:
// - The configured value if set
// - undefined if not set
```

### 2. Fallback Logic

```typescript
export function getApiBaseUrl(): string {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  if (viteApiUrl) {
    return viteApiUrl;  // Use configured value
  }

  return "http://localhost:4000";  // Fallback for development
}
```

### 3. Using API Config in Components

```typescript
// Old way (hardcoded URLs) ❌
fetch("http://localhost:4000/api/upload", { /* ... */ })

// New way (using config) ✅
import { getApiUrl, API_ENDPOINTS } from "@/lib/api-config";
fetch(getApiUrl(API_ENDPOINTS.UPLOAD), { /* ... */ })
```

## API Endpoints Reference

All endpoints are defined as constants in `API_ENDPOINTS`:

```typescript
// Authentication
API_ENDPOINTS.AUTH.SIGNUP        // "/api/auth/signup"
API_ENDPOINTS.AUTH.LOGIN         // "/api/auth/login"
API_ENDPOINTS.AUTH.FORGOT_PASSWORD // "/api/auth/forgot-password"

// Billing
API_ENDPOINTS.BILLING.SUBSCRIPTION // "/api/billing/subscription"
API_ENDPOINTS.BILLING.UPGRADE      // "/api/billing/upgrade"

// Jobs
API_ENDPOINTS.JOBS.LIST            // "/api/jobs"
API_ENDPOINTS.JOBS.CREATE          // "/api/jobs"
API_ENDPOINTS.JOBS.STATUS(id)      // "/api/jobs/{id}"
API_ENDPOINTS.JOBS.RESULT(id)      // "/api/jobs/{id}/result"

// Upload
API_ENDPOINTS.UPLOAD               // "/api/upload"

// Health
API_ENDPOINTS.HEALTH               // "/api/health"
```

## Helper Functions

### `getApiUrl(endpoint: string): string`

Builds a complete API URL from an endpoint path.

```typescript
getApiUrl(API_ENDPOINTS.BILLING.SUBSCRIPTION)
// Returns: "http://localhost:4000/api/billing/subscription"
```

### `getAuthHeaders(token?: string | null): Record<string, string>`

Creates fetch headers with authorization token.

```typescript
const headers = getAuthHeaders(token);
// Returns: {
//   "Content-Type": "application/json",
//   "Authorization": "Bearer {token}"
// }
```

### `getAuthToken(): string | null`

Retrieves the stored authentication token from localStorage.

```typescript
const token = getAuthToken();
```

## Deployment Configuration

### For Staging/Production

1. Set the `VITE_API_URL` environment variable before building:

```bash
# Using environment variables
VITE_API_URL=https://api-staging.example.com npm run build

# Or create .env file before building
echo "VITE_API_URL=https://api-staging.example.com" > .env
npm run build
```

2. Docker/Container Deployments:

```dockerfile
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
```

3. CI/CD Pipelines:

```yaml
# Example: GitHub Actions
- name: Build
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.API_URL }}
```

## Files Updated

The following files have been refactored to use the centralized API configuration:

- ✅ `src/hooks/use-billing.ts` - Billing API calls
- ✅ `src/pages/Auth.tsx` - Authentication API calls
- ✅ `src/pages/dashboard/JobsPage.tsx` - Jobs listing API calls
- ✅ `src/pages/dashboard/ResultsPage.tsx` - Results API calls
- ✅ `src/pages/dashboard/UploadPage.tsx` - File upload API calls

## Validation

The API configuration includes response validation to ensure backend responses match expected formats:

```typescript
function validateBillingResponse(data: unknown): BillingData {
  // Ensures all required fields are present and correct type
  // Throws descriptive error if validation fails
}
```

## Benefits

1. **Single Source of Truth**: All API URLs defined in one place
2. **Environment-Aware**: Works across dev, staging, and production
3. **Type-Safe**: TypeScript interfaces for all endpoints
4. **Reusable Helpers**: Consistent header and URL building
5. **Easy Migration**: Changing backend URL requires no code changes
6. **Fallback Support**: Works even if env vars are missing
7. **Documentation**: Centralized reference for all API endpoints

## Troubleshooting

### "API request failed" or "Backend unavailable"

1. Verify `VITE_API_URL` is correctly set:
   ```bash
   echo $VITE_API_URL  # Should print your API URL
   ```

2. Check the `.env` file exists and is readable:
   ```bash
   cat .env
   ```

3. Restart the dev server after changing `.env`:
   ```bash
   npm run dev
   ```

4. In production, ensure the build was done with correct env vars:
   ```bash
   # View what was built into the app
   grep -r "localhost" dist/  # Should be empty or show only comments
   ```

### Different API URL per environment?

Create separate `.env` files:

```bash
.env                 # Development (git-ignored)
.env.staging         # Staging (git-ignored)
.env.production      # Production (git-ignored)
```

Then load the appropriate file during build:

```bash
# Development
npm run dev

# Staging
VITE_API_URL=https://api-staging.example.com npm run build

# Production
VITE_API_URL=https://api.example.com npm run build
```
