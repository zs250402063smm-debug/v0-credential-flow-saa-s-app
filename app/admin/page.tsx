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

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role, company_id").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/provider")
  }

  // If admin doesn't have a company, redirect to company setup
  if (!profile.company_id) {
    redirect("/admin/company")
  }

  // Fetch providers through provider_company_links
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
          full_name,
          email
        )
      )
    `)
    .eq("company_id", profile.company_id)
    .eq("status", "approved")

  // Transform provider links to match expected format
  const providers =
    providerLinks?.map((link) => ({
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
        profiles:user_id (
          full_name,
          email
        )
      )
    `)
    .eq("company_id", profile.company_id)

  const { data: licenses } = await supabase
    .from("licenses")
    .select(`
      *,
      providers:provider_id (
        npi,
        specialty,
        profiles:user_id (
          full_name,
          email
        )
      )
    `)
    .eq("company_id", profile.company_id)

  return (
    <AdminDashboard
      providers={providers || []}
      documents={documents || []}
      licenses={licenses || []}
      userEmail={user.email || ""}
      companyId={profile.company_id}
    />
  )
}
