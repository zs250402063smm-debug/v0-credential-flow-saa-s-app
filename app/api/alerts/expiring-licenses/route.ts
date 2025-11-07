import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

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

    // Get all licenses
    const { data: licenses, error } = await supabase.from("licenses").select(`
        *,
        providers (
          npi,
          specialty,
          profiles (
            email,
            full_name
          )
        )
      `)

    if (error) throw error

    const today = new Date()
    const alerts = []

    for (const license of licenses || []) {
      const expirationDate = new Date(license.expiration_date)
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Check for 90, 60, and 30 day alerts
      if (
        daysUntilExpiration === 90 ||
        daysUntilExpiration === 60 ||
        daysUntilExpiration === 30 ||
        (daysUntilExpiration <= 30 && daysUntilExpiration > 0)
      ) {
        alerts.push({
          licenseId: license.id,
          licenseNumber: license.license_number,
          licenseType: license.license_type,
          expirationDate: license.expiration_date,
          daysUntilExpiration,
          provider: license.providers,
          severity: daysUntilExpiration <= 30 ? "critical" : daysUntilExpiration <= 60 ? "warning" : "info",
        })
      }
    }

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("[v0] Expiring licenses check error:", error)
    return NextResponse.json({ error: "Failed to check expiring licenses" }, { status: 500 })
  }
}
