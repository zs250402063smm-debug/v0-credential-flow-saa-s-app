import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { JoinCompany } from "@/components/provider/join-company"

export default async function JoinCompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "provider") {
    redirect("/admin")
  }

  // Fetch existing company links
  const { data: companyLinks } = await supabase
    .from("provider_company_links")
    .select(`
      *,
      company:companies!provider_company_links_company_id_fkey(id, name, enrollment_code)
    `)
    .eq("provider_id", user.id)

  return <JoinCompany providerId={user.id} existingLinks={companyLinks || []} />
}
