import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProviderDashboard } from "@/components/provider/provider-dashboard"

export default async function ProviderPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get provider profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role === "admin") {
    redirect("/admin")
  }

  // Get provider data
  const { data: provider } = await supabase.from("providers").select("*").eq("user_id", user.id).single()

  // If no provider profile exists, redirect to onboarding
  if (!provider) {
    redirect("/provider/onboarding")
  }

  // Fetch provider's documents and licenses
  const [documentsResult, licensesResult] = await Promise.all([
    supabase.from("documents").select("*").eq("provider_id", provider.id),
    supabase.from("licenses").select("*").eq("provider_id", provider.id),
  ])

  return (
    <ProviderDashboard
      provider={provider}
      profile={profile}
      documents={documentsResult.data || []}
      licenses={licensesResult.data || []}
    />
  )
}
