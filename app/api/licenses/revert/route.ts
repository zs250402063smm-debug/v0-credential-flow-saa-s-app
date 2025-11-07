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

    // Revert license verification status
    const { error } = await supabase
      .from("licenses")
      .update({
        verification_status: "pending",
        verified_at: null,
        verified_by: null,
      })
      .eq("id", licenseId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] License revert error:", error)
    return NextResponse.json({ error: "Failed to revert license" }, { status: 500 })
  }
}
