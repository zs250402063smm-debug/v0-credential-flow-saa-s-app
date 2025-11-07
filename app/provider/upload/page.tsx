import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DocumentUpload } from "@/components/provider/document-upload"

export default async function UploadPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get provider data
  const { data: provider } = await supabase.from("providers").select("*").eq("user_id", user.id).single()

  if (!provider) {
    redirect("/provider/onboarding")
  }

  return <DocumentUpload providerId={provider.id} />
}
