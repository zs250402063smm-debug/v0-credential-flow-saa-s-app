import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { providerId } = await request.json()

    if (!providerId) {
      return NextResponse.json({ error: "Provider ID is required" }, { status: 400 })
    }

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    // Update provider status to inactive
    const { data, error } = await supabase
      .from("providers")
      .update({
        status: "inactive",
        updated_at: new Date().toISOString(),
      })
      .eq("id", providerId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error rejecting provider:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in reject provider route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
