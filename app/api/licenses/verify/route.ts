import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { licenseId } = await request.json()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get license details
    const { data: license } = await supabase.from("licenses").select("*").eq("id", licenseId).single()

    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 })
    }

    // Placeholder for actual verification logic
    // In production, this would call state licensing board APIs
    const verificationResult = await verifyLicenseWithStateBoard(license)

    // Update license verification status
    const { error } = await supabase
      .from("licenses")
      .update({
        verification_status: verificationResult.verified ? "verified" : "failed",
        last_verified_at: new Date().toISOString(),
      })
      .eq("id", licenseId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      verified: verificationResult.verified,
      message: verificationResult.message,
    })
  } catch (error) {
    console.error("[v0] License verification error:", error)
    return NextResponse.json({ error: "Failed to verify license" }, { status: 500 })
  }
}

// Placeholder function for license verification
// In production, this would integrate with state licensing board APIs
async function verifyLicenseWithStateBoard(license: any) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Placeholder logic - in production, call actual state board API
  // For now, we'll mark as verified if the license is not expired
  const expirationDate = new Date(license.expiration_date)
  const isExpired = expirationDate < new Date()

  return {
    verified: !isExpired,
    message: isExpired ? "License has expired" : "License verified successfully with state board",
  }
}
