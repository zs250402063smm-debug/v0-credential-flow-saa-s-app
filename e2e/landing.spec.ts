import { test, expect } from "@playwright/test"

test.describe("Landing Page", () => {
  test("should load successfully on mobile", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/CredentialFlow/)

    // Check hero section
    await expect(page.getByRole("heading", { name: /streamline/i })).toBeVisible()

    // Check CTA buttons
    await expect(page.getByRole("link", { name: /get started/i })).toBeVisible()
  })

  test("should have responsive navigation", async ({ page }) => {
    await page.goto("/")

    // On mobile, hamburger menu should be visible
    if (page.viewportSize()?.width! < 768) {
      await expect(page.getByRole("button", { name: /menu/i })).toBeVisible()
    }
  })

  test("should not have horizontal scroll", async ({ page }) => {
    await page.goto("/")

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // Allow 1px tolerance
  })

  test("should take visual snapshot", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveScreenshot("landing-page.png", {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })
})
