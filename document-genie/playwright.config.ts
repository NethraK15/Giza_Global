import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "npm run server",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 8080",
      url: "http://localhost:8080",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chrome",
      use: { channel: "chrome" },
    },
    {
      name: "edge",
      use: { channel: "msedge" },
    },
  ],
});
