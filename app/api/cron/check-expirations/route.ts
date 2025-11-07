import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This endpoint would be called by a cron job (e.g., Vercel Cron)
// to check for expiring licenses and send notifications
export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure only authorized calls
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all licenses
    const { data: licenses, error } = await supabase.from("licenses").select(`
        *,
        providers (
          npi,
          specialty,
          user_id,
          profiles (
            email,
            full_name
          )
        )
      `)

    if (error) throw error

    const today = new Date()
    const notifications = []

    for (const license of licenses || []) {
      const expirationDate = new Date(license.expiration_date)
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Send notifications at 90, 60, and 30 days
      if ([90, 60, 30].includes(daysUntilExpiration)) {
        notifications.push({
          licenseId: license.id,
          licenseNumber: license.license_number,
          licenseType: license.license_type,
          expirationDate: license.expiration_date,
          daysUntilExpiration,
          providerEmail: license.providers?.profiles?.email,
          providerName: license.providers?.profiles?.full_name,
        })

        // In production, send actual email notifications here
        console.log(`[v0] Notification: License ${license.license_number} expires in ${daysUntilExpiration} days`)
      }

      // Update license status if expired
      if (daysUntilExpiration < 0 && license.status === "active") {
        await supabase.from("licenses").update({ status: "expired" }).eq("id", license.id)
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent: notifications.length,
      notifications,
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json({ error: "Failed to check expirations" }, { status: 500 })
  }
}
