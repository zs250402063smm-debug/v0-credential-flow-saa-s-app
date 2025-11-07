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

  const [providersResult, documentsResult, licensesResult] = await Promise.all([
    supabase
      .from("providers")
      .select(
        `
      *,
      profiles:user_id (
        full_name,
        email
      )
    `,
      )
      .eq("company_id", profile.company_id),
    supabase
      .from("documents")
      .select(
        `
      *,
      providers:provider_id (
        npi,
        specialty,
        profiles:user_id (
          full_name,
          email
        )
      )
    `,
      )
      .eq("company_id", profile.company_id),
    supabase
      .from("licenses")
      .select(
        `
      *,
      providers:provider_id (
        npi,
        specialty,
        profiles:user_id (
          full_name,
          email
        )
      )
    `,
      )
      .eq("company_id", profile.company_id),
  ])

  return (
    <AdminDashboard
      providers={providersResult.data || []}
      documents={documentsResult.data || []}
      licenses={licensesResult.data || []}
      userEmail={user.email || ""}
      companyId={profile.company_id}
    />
  )
}
