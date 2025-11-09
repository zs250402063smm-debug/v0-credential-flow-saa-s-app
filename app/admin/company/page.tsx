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
      id,
      provider_id,
      company_id,
      status,
      requested_at,
      request_note,
      provider:providers!provider_company_links_provider_id_fkey (
        id,
        user_id,
        profiles:user_id (
          email,
          full_name
        )
      )
    `,
    )
    .eq("company_id", company?.id)
    .eq("status", "pending")

  const { data: approvedProviders } = await supabase
    .from("provider_company_links")
    .select(
      `
      id,
      provider_id,
      company_id,
      status,
      approved_at,
      provider:providers!provider_company_links_provider_id_fkey (
        id,
        user_id,
        profiles:user_id (
          email,
          full_name
        )
      )
    `,
    )
    .eq("company_id", company?.id)
    .eq("status", "approved")

  const transformedPendingRequests =
    pendingRequests?.map((req: any) => ({
      id: req.id,
      provider_id: req.provider_id,
      company_id: req.company_id,
      status: req.status,
      requested_at: req.requested_at,
      request_note: req.request_note,
      provider: {
        id: req.provider.id,
        email: req.provider.profiles?.email || "",
        full_name: req.provider.profiles?.full_name || "",
      },
    })) || []

  const transformedApprovedProviders =
    approvedProviders?.map((prov: any) => ({
      id: prov.id,
      provider_id: prov.provider_id,
      company_id: prov.company_id,
      status: prov.status,
      approved_at: prov.approved_at,
      provider: {
        id: prov.provider.id,
        email: prov.provider.profiles?.email || "",
        full_name: prov.provider.profiles?.full_name || "",
      },
    })) || []

  return (
    <CompanyManagement
      company={company}
      pendingRequests={transformedPendingRequests}
      approvedProviders={transformedApprovedProviders}
      adminId={user.id}
    />
  )
}
