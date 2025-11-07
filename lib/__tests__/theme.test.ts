import { theme } from "../theme"

describe("Theme Configuration", () => {
  it("should have correct primary colors", () => {
    expect(theme.colors.primary).toBe("#0D173C")
    expect(theme.colors.accent).toBe("#4EA8DE")
  })

  it("should have consistent spacing system", () => {
    expect(theme.spacing.base).toBe(8)
    expect(theme.spacing.md).toBe(16)
    expect(theme.spacing.lg).toBe(24)
  })

  it("should have correct breakpoints", () => {
    expect(theme.breakpoints.sm).toBe("640px")
    expect(theme.breakpoints.md).toBe("768px")
    expect(theme.breakpoints.lg).toBe("1024px")
  })

  it("should have border radius values", () => {
    expect(theme.radius.sm).toBe("8px")
    expect(theme.radius.md).toBe("12px")
  })
})
