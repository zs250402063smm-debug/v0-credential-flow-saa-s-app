import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    console.log("[v0] Rejecting request:", { requestId, adminId: user.id })

    // Get link details before rejection for logging
    const { data: link } = await supabase.from("provider_company_links").select("*").eq("id", requestId).single()

    if (!link) throw new Error("Link not found")

    const { error } = await supabase
      .from("provider_company_links")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        rejected_by: user.id,
      })
      .eq("id", requestId)

    if (error) throw error

    await supabase.from("admin_action_logs").insert({
      admin_id: user.id,
      action_type: "reject_request",
      target_id: link.provider_id,
      company_id: link.company_id,
      notes: `Rejected provider access request`,
    })

    console.log("[v0] Request rejected successfully")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error rejecting request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
