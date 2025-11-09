import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: company } = await supabase.from("companies").select("id, name").eq("admin_id", user.id).single()

  if (!company) {
    redirect("/admin/company")
  }

  const { data: providerLinks } = await supabase
    .from("provider_company_links")
    .select(`
      provider_id,
      status,
      approved_at,
      providers:provider_id (
        id,
        npi,
        specialty,
        status,
        user_id,
        profiles:user_id (
          id,
          full_name,
          email
        )
      )
    `)
    .eq("company_id", company.id)
    .eq("status", "approved")

  const providers =
    providerLinks
      ?.filter((link) => link.providers)
      .map((link) => ({
        ...link.providers,
        link_status: link.status,
        approved_at: link.approved_at,
      })) || []

  const { data: documents } = await supabase
    .from("documents")
    .select(`
      *,
      providers:provider_id (
        npi,
        specialty,
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      )
    `)
    .eq("company_id", company.id)

  const { data: licenses } = await supabase
    .from("licenses")
    .select(`
      *,
      providers:provider_id (
        npi,
        specialty,
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      )
    `)
    .eq("company_id", company.id)

  return (
    <AdminDashboard
      providers={providers}
      documents={documents || []}
      licenses={licenses || []}
      userEmail={user.email || ""}
      companyId={company.id}
    />
  )
}
