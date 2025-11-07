import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanyManagement } from "@/components/admin/company-management"

export default async function CompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/provider")
  }

  // Fetch admin's company
  const { data: company } = await supabase.from("companies").select("*").eq("admin_id", user.id).single()

  const { data: pendingRequests } = await supabase
    .from("provider_company_links")
    .select(
      `
      *,
      provider:profiles!provider_company_links_provider_id_fkey(id, email, full_name)
    `,
    )
    .eq("company_id", company?.id)
    .eq("status", "pending")

  const { data: approvedProviders } = await supabase
    .from("provider_company_links")
    .select(
      `
      *,
      provider:profiles!provider_company_links_provider_id_fkey(id, email, full_name)
    `,
    )
    .eq("company_id", company?.id)
    .eq("status", "approved")

  return (
    <CompanyManagement
      company={company}
      pendingRequests={pendingRequests || []}
      approvedProviders={approvedProviders || []}
      adminId={user.id}
    />
  )
}
