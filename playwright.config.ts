import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config for tr-archive.
 *
 * - Tests live in `e2e/` so vitest (src/**) and playwright don't collide.
 * - `webServer` boots `next start` on CI so we test the real prod bundle
 *   (middleware, CSP, SW registration — the things unit tests can't cover).
 * - Local dev falls through to `next dev` — fast feedback loop at the cost
 *   of not exercising the prod CSP.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Firefox / WebKit only in CI — local runs stay fast
    ...(process.env.CI
      ? [
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
        ]
      : []),
  ],
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
