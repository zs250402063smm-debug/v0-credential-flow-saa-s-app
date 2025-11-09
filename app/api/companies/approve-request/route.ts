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

    const { data: providerCheck, error: providerCheckError } = await supabase
      .from("providers")
      .select("id")
      .eq("id", providerId)
      .single()

    if (providerCheckError || !providerCheck) {
      console.error("[v0] Provider not found:", { providerId, error: providerCheckError })
      return NextResponse.json({ error: "Provider not found. They may need to complete onboarding." }, { status: 404 })
    }

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

    await supabase.from("providers").update({ status: "active" }).eq("id", providerId)

    await supabase.from("admin_action_logs").insert({
      admin_id: user.id,
      action_type: "approve_request",
      target_id: providerId,
      company_id: companyId,
      notes: `Approved provider access request`,
    })

    return NextResponse.json(updatedLink)
  } catch (error: any) {
    console.error("[v0] Error approving request:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
