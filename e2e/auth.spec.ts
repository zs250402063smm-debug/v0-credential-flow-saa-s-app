import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/auth/login")

    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("should display signup page", async ({ page }) => {
    await page.goto("/auth/sign-up")

    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test("should validate form inputs", async ({ page }) => {
    await page.goto("/auth/login")

    // Try to submit without filling form
    await page.getByRole("button", { name: /sign in/i }).click()

    // Should show validation errors (HTML5 validation)
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute("required")
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.goto("/auth/login")

    // Check that form is visible and properly sized
    const form = page.locator("form")
    await expect(form).toBeVisible()

    const box = await form.boundingBox()
    expect(box?.width).toBeLessThanOrEqual(page.viewportSize()?.width || 0)
  })
})
