"use client"

import useSWR from "swr"
import { createBrowserClient } from "@supabase/ssr"

type ProductType = { id: string; name: string }

let browserClient: ReturnType<typeof createBrowserClient> | null = null
function sb() {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    browserClient = createBrowserClient(url, key)
  }
  // @ts-expect-error - ssr types
  return browserClient
}

const key = "product_types:list"

async function fetchTypes(): Promise<ProductType[]> {
  const { data, error } = await sb().from("product_types").select("id,name").order("name", { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useTypes() {
  const { data, error, isLoading, mutate } = useSWR<ProductType[]>(key, fetchTypes, { revalidateOnFocus: false })
  return {
    types: data ?? [],
    isLoading,
    error,
    async addType(name: string) {
      const trimmed = name.trim()
      if (!trimmed) return
      const { error } = await sb().from("product_types").insert({ name: trimmed })
      if (error) throw error
      await mutate()
    },
    async deleteType(id: string) {
      const { error } = await sb().from("product_types").delete().eq("id", id)
      if (error) throw error
      await mutate()
    },
    async refresh() {
      await mutate()
    },
  }
}

// Utility for one-off reads (if needed elsewhere)
export async function getAllTypesOnce() {
  return await fetchTypes()
}
