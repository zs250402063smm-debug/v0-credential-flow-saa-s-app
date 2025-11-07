import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AlertsDashboard } from "@/components/admin/alerts-dashboard"

export default async function AlertsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/provider")
  }

  // Get all licenses with provider info
  const { data: licenses } = await supabase.from("licenses").select(`
      *,
      providers (
        npi,
        specialty,
        profiles (
          email,
          full_name
        )
      )
    `)

  return <AlertsDashboard licenses={licenses || []} userEmail={user.email || ""} />
}
