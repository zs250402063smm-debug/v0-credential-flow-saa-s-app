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
    const { enrollmentCode, requestNote } = await request.json()

    const normalizedCode = enrollmentCode?.trim().toUpperCase()

    if (!normalizedCode) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Enrollment code is required",
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

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          },
        },
        { status: 401 },
      )
    }

    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("id, user_id, status")
      .eq("user_id", user.id)
      .single()

    if (providerError || !provider) {
      console.error("[v0] Provider lookup failed:", {
        userId: user.id,
        error: providerError,
        provider,
      })
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: "Provider profile not found. Please complete onboarding first.",
            code: "NO_PROVIDER_PROFILE",
          },
        },
        { status: 404 },
      )
    }

    console.log("[v0] Found provider:", {
      providerId: provider.id,
      userId: provider.user_id,
      status: provider.status,
    })

    const adminClient = createAdminClient()

    const { data: company, error: companyError } = await adminClient
      .from("companies")
      .select("*")
      .eq("enrollment_code", normalizedCode)
      .maybeSingle()

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

    const { data: existingLink, error: existingError } = await supabase
      .from("provider_company_links")
      .select("*")
      .eq("provider_id", provider.id)
      .eq("company_id", company.id)
      .maybeSingle()

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

    console.log("[v0] Creating provider_company_link:", {
      provider_id: provider.id,
      company_id: company.id,
      status: "pending",
    })

    const { data: link, error: linkError } = await supabase
      .from("provider_company_links")
      .insert({
        provider_id: provider.id,
        company_id: company.id,
        status: "pending",
        request_note: requestNote || null,
      })
      .select()
      .single()

    if (linkError) {
      console.error("[v0] Error creating link:", {
        error: linkError,
        provider_id: provider.id,
        company_id: company.id,
      })
      return NextResponse.json<ErrorResponse>(
        {
          error: {
            message: `Failed to create join request: ${linkError.message}`,
            code: "CREATE_FAILED",
          },
        },
        { status: 500 },
      )
    }

    console.log("[v0] Successfully created link:", link)

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
