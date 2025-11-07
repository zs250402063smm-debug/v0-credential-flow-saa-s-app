import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "https://v0-credential-flow-saa-s-app.vercel.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: {
        ...devices["iPhone 12"],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: "Tablet",
      use: {
        ...devices["iPad Pro"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "https://v0-credential-flow-saa-s-app.vercel.app",
    reuseExistingServer: !process.env.CI,
  },
})
