import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { linkId } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    console.log("[v0] Reverting approval:", { linkId, adminId: user.id })

    // Get link details before reverting
    const { data: link } = await supabase.from("provider_company_links").select("*").eq("id", linkId).single()

    if (!link) throw new Error("Link not found")

    // Verify admin owns this company
    const { data: company } = await supabase.from("companies").select("*").eq("id", link.company_id).single()

    if (!company || company.admin_id !== user.id) {
      throw new Error("Unauthorized to revert this approval")
    }

    // Update status back to pending
    const { error: updateError } = await supabase
      .from("provider_company_links")
      .update({
        status: "pending",
        approved_at: null,
        approved_by: null,
      })
      .eq("id", linkId)

    if (updateError) throw updateError

    // Log the action
    await supabase.from("admin_action_logs").insert({
      admin_id: user.id,
      action_type: "revert_approval",
      target_id: link.provider_id,
      company_id: link.company_id,
      notes: `Reverted provider approval back to pending`,
    })

    console.log("[v0] Approval reverted successfully:", { linkId })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error reverting approval:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
