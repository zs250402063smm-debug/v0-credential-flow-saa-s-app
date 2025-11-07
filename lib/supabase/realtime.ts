import { createBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function subscribeToProviderLinks(companyId: string, callback: (payload: any) => void): RealtimeChannel {
  const supabase = createBrowserClient()

  const channel = supabase
    .channel(`provider-links-${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "provider_company_links",
        filter: `company_id=eq.${companyId}`,
      },
      callback,
    )
    .subscribe()

  return channel
}

export function subscribeToProviders(companyId: string, callback: (payload: any) => void): RealtimeChannel {
  const supabase = createBrowserClient()

  const channel = supabase
    .channel(`providers-${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "providers",
        filter: `company_id=eq.${companyId}`,
      },
      callback,
    )
    .subscribe()

  return channel
}

export function subscribeToDocuments(companyId: string, callback: (payload: any) => void): RealtimeChannel {
  const supabase = createBrowserClient()

  const channel = supabase
    .channel(`documents-${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "documents",
        filter: `company_id=eq.${companyId}`,
      },
      callback,
    )
    .subscribe()

  return channel
}

export function subscribeToLicenses(companyId: string, callback: (payload: any) => void): RealtimeChannel {
  const supabase = createBrowserClient()

  const channel = supabase
    .channel(`licenses-${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "licenses",
        filter: `company_id=eq.${companyId}`,
      },
      callback,
    )
    .subscribe()

  return channel
}

export function subscribeToProviderRequests(companyId: string, callback: (payload: any) => void): RealtimeChannel {
  const supabase = createBrowserClient()

  const channel = supabase
    .channel(`provider-requests-${companyId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "provider_company_links",
        filter: `company_id=eq.${companyId}`,
      },
      callback,
    )
    .subscribe()

  return channel
}
