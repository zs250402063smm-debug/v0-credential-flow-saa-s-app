import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { name, adminId } = await request.json()
    const supabase = await createClient()

    // Generate enrollment code
    const { data: codeData, error: codeError } = await supabase.rpc("generate_enrollment_code")

    if (codeError) throw codeError

    // Create company
    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        name,
        admin_id: adminId,
        enrollment_code: codeData,
      })
      .select()
      .single()

    if (error) throw error

    // Update admin profile with company_id
    await supabase.from("profiles").update({ company_id: company.id }).eq("id", adminId)

    return NextResponse.json(company)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
