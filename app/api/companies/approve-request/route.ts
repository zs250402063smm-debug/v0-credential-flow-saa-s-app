import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { requestId, providerId, companyId } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    console.log("[v0] Approving request:", { requestId, providerId, companyId, adminId: user.id })

    // Update link status
    const { data: updatedLink, error: linkError } = await supabase
      .from("provider_company_links")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq("id", requestId)
      .select()
      .single()

    if (linkError) throw linkError

    // Create or update provider record with company_id
    const { data: existingProvider } = await supabase
      .from("providers")
      .select("*")
      .eq("user_id", providerId)
      .maybeSingle()

    if (existingProvider) {
      // Update existing provider with company_id
      await supabase.from("providers").update({ company_id: companyId, status: "active" }).eq("user_id", providerId)
    }

    await supabase.from("admin_action_logs").insert({
      admin_id: user.id,
      action_type: "approve_request",
      target_id: providerId,
      company_id: companyId,
      notes: `Approved provider access request`,
    })

    console.log("[v0] Request approved successfully")

    return NextResponse.json(updatedLink)
  } catch (error: any) {
    console.error("[v0] Error approving request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
