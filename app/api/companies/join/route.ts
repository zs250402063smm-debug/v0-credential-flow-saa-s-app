import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"

type ErrorResponse = {
  error: {
    message: string
    code: string
  }
}

export async function POST(request: Request) {
  try {
    const { enrollmentCode, providerId, requestNote } = await request.json()

    const normalizedCode = enrollmentCode?.trim().toUpperCase()

    if (!normalizedCode || !providerId) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Enrollment code and provider ID are required",
            code: "MISSING_FIELDS",
          },
        },
        { status: 400 },
      )
    }

    if (normalizedCode.length !== 8) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Enrollment code must be 8 characters",
            code: "INVALID_FORMAT",
          },
        },
        { status: 400 },
      )
    }

    const adminClient = createAdminClient()

    console.log("[v0] Looking up company with code:", normalizedCode)

    const { data: company, error: companyError } = await adminClient
      .from("companies")
      .select("*")
      .eq("enrollment_code", normalizedCode)
      .maybeSingle()

    console.log("[v0] Company lookup result:", {
      found: !!company,
      companyId: company?.id,
      companyName: company?.name,
      adminId: company?.admin_id,
      error: companyError?.message,
    })

    if (companyError) {
      console.error("[v0] Database error:", companyError)
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Database error while looking up company",
            code: "DATABASE_ERROR",
          },
        },
        { status: 500 },
      )
    }

    if (!company) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Invalid enrollment code. Please check and try again.",
            code: "NOT_FOUND",
          },
        },
        { status: 404 },
      )
    }

    const supabase = await createClient()

    console.log("[v0] Checking for existing link")

    const { data: existingLink, error: existingError } = await supabase
      .from("provider_company_links")
      .select("*")
      .eq("provider_id", providerId)
      .eq("company_id", company.id)
      .maybeSingle()

    console.log("[v0] Existing link check:", {
      exists: !!existingLink,
      status: existingLink?.status,
    })

    if (existingError) {
      console.error("[v0] Error checking existing link:", existingError)
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Database error while checking existing links",
            code: "DATABASE_ERROR",
          },
        },
        { status: 500 },
      )
    }

    if (existingLink) {
      const errorMessage =
        existingLink.status === "pending"
          ? "You have already requested access to this company"
          : existingLink.status === "approved"
            ? "You are already linked to this company"
            : "Your previous request was rejected. Please contact the company admin."

      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: errorMessage,
            code: "DUPLICATE_LINK",
          },
        },
        { status: 400 },
      )
    }

    console.log("[v0] Creating new link with request note:", {
      providerId,
      companyId: company.id,
      adminId: company.admin_id,
      hasNote: !!requestNote,
    })

    const { data: link, error: linkError } = await supabase
      .from("provider_company_links")
      .insert({
        provider_id: providerId,
        company_id: company.id,
        status: "pending",
        request_note: requestNote || null,
      })
      .select()
      .single()

    console.log("[v0] Link creation result:", {
      success: !!link,
      linkId: link?.id,
      requestNote: link?.request_note,
    })

    if (linkError) {
      console.error("[v0] Error creating link:", linkError)
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Failed to create join request. Please try again.",
            code: "CREATE_FAILED",
          },
        },
        { status: 500 },
      )
    }

    const response = {
      ...link,
      company: {
        id: company.id,
        name: company.name,
        enrollment_code: company.enrollment_code,
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json<ErrorResponse>(
      {
        error: {
          message: error.message || "An unexpected error occurred",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    )
  }
}
