"use client"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "../button"
import { jest } from "@jest/globals"

describe("Button Component", () => {
  it("renders button with text", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("handles click events", async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole("button"))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("applies variant styles", () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-primary")

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole("button")).toHaveClass("border")
  })
})
