"use client"

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

let client: SupabaseClient | null = null

export function getSupabaseBrowser() {
  if (client) return client
  // NOTE: Next.js injects NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  return client
}
