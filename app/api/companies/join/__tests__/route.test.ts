import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "../route"
import { createClient } from "@/lib/supabase/server"

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

describe("/api/companies/join", () => {
  let mockSupabase: any
  let mockRequest: Request

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Setup mock Supabase client
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  it("should return 400 if enrollmentCode is missing", async () => {
    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({ providerId: "test-provider-id" }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("MISSING_FIELDS")
    expect(data.error.message).toContain("required")
  })

  it("should return 400 if providerId is missing", async () => {
    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({ enrollmentCode: "ABC12345" }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("MISSING_FIELDS")
  })

  it("should return 400 if enrollmentCode is not 8 characters", async () => {
    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({
        enrollmentCode: "ABC",
        providerId: "test-provider-id",
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("INVALID_FORMAT")
    expect(data.error.message).toContain("8 characters")
  })

  it("should return 404 if enrollment code not found", async () => {
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: null,
    })

    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({
        enrollmentCode: "NOTFOUND",
        providerId: "test-provider-id",
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe("NOT_FOUND")
    expect(data.error.message).toContain("Invalid enrollment code")
  })

  it("should return 400 if provider already has a pending link", async () => {
    // Mock company found
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({
        data: {
          id: "company-id",
          name: "Test Company",
          enrollment_code: "ABC12345",
        },
        error: null,
      })
      // Mock existing pending link
      .mockResolvedValueOnce({
        data: {
          id: "link-id",
          provider_id: "test-provider-id",
          company_id: "company-id",
          status: "pending",
        },
        error: null,
      })

    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({
        enrollmentCode: "ABC12345",
        providerId: "test-provider-id",
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("DUPLICATE_LINK")
    expect(data.error.message).toContain("already requested")
  })

  it("should return 400 if provider already has an approved link", async () => {
    // Mock company found
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({
        data: {
          id: "company-id",
          name: "Test Company",
          enrollment_code: "ABC12345",
        },
        error: null,
      })
      // Mock existing approved link
      .mockResolvedValueOnce({
        data: {
          id: "link-id",
          provider_id: "test-provider-id",
          company_id: "company-id",
          status: "approved",
        },
        error: null,
      })

    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({
        enrollmentCode: "ABC12345",
        providerId: "test-provider-id",
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe("DUPLICATE_LINK")
    expect(data.error.message).toContain("already linked")
  })

  it("should create a new pending link successfully", async () => {
    const mockCompany = {
      id: "company-id",
      name: "Test Company",
      enrollment_code: "ABC12345",
    }

    const mockLink = {
      id: "new-link-id",
      provider_id: "test-provider-id",
      company_id: "company-id",
      status: "pending",
      requested_at: new Date().toISOString(),
    }

    // Mock company found
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({
        data: mockCompany,
        error: null,
      })
      // Mock no existing link
      .mockResolvedValueOnce({
        data: null,
        error: null,
      })

    // Mock successful insert
    mockSupabase.single.mockResolvedValueOnce({
      data: mockLink,
      error: null,
    })

    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({
        enrollmentCode: "ABC12345",
        providerId: "test-provider-id",
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.id).toBe("new-link-id")
    expect(data.status).toBe("pending")
    expect(data.company.name).toBe("Test Company")
  })

  it("should handle database errors gracefully", async () => {
    mockSupabase.maybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "Connection timeout", code: "CONNECTION_ERROR" },
    })

    mockRequest = new Request("http://localhost/api/companies/join", {
      method: "POST",
      body: JSON.stringify({
        enrollmentCode: "ABC12345",
        providerId: "test-provider-id",
      }),
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe("DATABASE_ERROR")
  })
})
