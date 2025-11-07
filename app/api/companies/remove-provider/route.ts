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

    console.log("[v0] Removing provider link:", { linkId, adminId: user.id })

    // Get link details before deletion for logging
    const { data: link } = await supabase.from("provider_company_links").select("*").eq("id", linkId).single()

    if (!link) throw new Error("Link not found")

    // Verify admin owns this company
    const { data: company } = await supabase.from("companies").select("*").eq("id", link.company_id).single()

    if (!company || company.admin_id !== user.id) {
      throw new Error("Unauthorized to remove this provider")
    }

    // Delete the provider-company link
    const { error: deleteError } = await supabase.from("provider_company_links").delete().eq("id", linkId)

    if (deleteError) throw deleteError

    // Log the action
    await supabase.from("admin_action_logs").insert({
      admin_id: user.id,
      action_type: "remove_provider",
      target_id: link.provider_id,
      company_id: link.company_id,
      notes: `Removed provider from company`,
    })

    console.log("[v0] Provider removed successfully:", { linkId })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error removing provider:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
