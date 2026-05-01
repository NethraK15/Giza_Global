/**
 * Central API Configuration
 * 
 * Provides a single source of truth for all API base URLs and endpoints.
 * Supports multiple environments through environment variables with fallback defaults.
 */

/**
 * Get the API base URL from environment variables or use the default.
 * 
 * Environment Variables:
 * - VITE_API_URL (Vite): Backend API base URL (default: http://localhost:4000)
 * 
 * @returns {string} The API base URL
 */
export function getApiBaseUrl(): string {
  // Vite exposes env variables through import.meta.env
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  if (viteApiUrl) {
    return viteApiUrl;
  }

  // Fallback to localhost for development
  return "http://localhost:4000";
}

/**
 * API base URL instance
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
  },
  
  // Billing
  BILLING: {
    SUBSCRIPTION: "/api/billing/subscription",
    UPGRADE: "/api/billing/upgrade",
  },
  
  // Jobs
  JOBS: {
    LIST: "/api/jobs",
    CREATE: "/api/jobs",
    STATUS: (jobId: string) => `/api/jobs/${jobId}`,
    RESULT: (jobId: string) => `/api/jobs/${jobId}/result`,
  },
  
  // Upload
  UPLOAD: "/api/upload",
  
  // Health
  HEALTH: "/api/health",
} as const;

/**
 * Helper function to build full API URLs
 * 
 * @param endpoint - The endpoint path from API_ENDPOINTS
 * @returns {string} Full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Create a fetch headers object with authorization
 * 
 * @param token - Optional authentication token
 * @returns {Record<string, string>} Headers object for fetch requests
 */
export function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Get auth token from localStorage
 * 
 * @returns {string | null} The stored auth token or null
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("document-genie-token");
}
