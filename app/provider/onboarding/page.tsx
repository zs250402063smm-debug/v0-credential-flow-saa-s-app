import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProviderOnboarding } from "@/components/provider/provider-onboarding"

export default async function OnboardingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if provider profile already exists
  const { data: provider } = await supabase.from("providers").select("*").eq("user_id", user.id).single()

  // If provider exists, redirect to dashboard
  if (provider) {
    redirect("/provider")
  }

  return <ProviderOnboarding userId={user.id} />
}
