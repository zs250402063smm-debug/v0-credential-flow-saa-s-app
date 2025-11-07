import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { documentId, notes } = await request.json()

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

    // Update document status
    const { error } = await supabase
      .from("documents")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: notes || null,
      })
      .eq("id", documentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Document rejection error:", error)
    return NextResponse.json({ error: "Failed to reject document" }, { status: 500 })
  }
}
