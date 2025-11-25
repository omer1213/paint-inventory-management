"use client"

import useSWR, { mutate } from "swr"
import { getSupabaseBrowser } from "@/lib/supabase/client"

export type Product = {
  code: string
  name: string
  type?: string | null
  packaging: string
  quantity: number
  sourcingPrice: number
  sellingPrice: number
  deleted?: boolean
  deleted_at?: string | null
}

export type Sale = {
  id: string
  date: string
  productCode: string
  name: string
  packaging: string
  quantitySold: number
  sellingPrice: number
  sourcingPrice: number
}

const KEYS = {
  products: "inventory/products",
  deletedProducts: "inventory/deleted-products",
  sales: "inventory/sales",
}

async function fetchProducts(): Promise<Product[]> {
  const supabase = getSupabaseBrowser()
  // Try with deleted filter, fallback to all products if column doesn't exist
  let { data, error } = await supabase.from("products").select("*").order("code", { ascending: true })
  
  // If no error and data exists, filter by deleted column if it exists
  if (!error && data) {
    // Check if deleted column exists in the data
    const hasDeletedColumn = data.length > 0 && 'deleted' in data[0]
    if (hasDeletedColumn) {
      data = data.filter((p: any) => !p.deleted)
    }
  }
  
  if (error) throw error
  return (data || []) as Product[]
}

async function fetchDeletedProducts(): Promise<Product[]> {
  const supabase = getSupabaseBrowser()
  // Try to fetch deleted products, return empty if column doesn't exist
  let { data, error } = await supabase.from("products").select("*").order("code", { ascending: true })
  
  if (!error && data) {
    const hasDeletedColumn = data.length > 0 && 'deleted' in data[0]
    if (hasDeletedColumn) {
      data = data.filter((p: any) => p.deleted === true)
      // Sort by deleted_at if available
      if (data.length > 0 && 'deleted_at' in data[0]) {
        data.sort((a: any, b: any) => {
          const aTime = a.deleted_at ? new Date(a.deleted_at).getTime() : 0
          const bTime = b.deleted_at ? new Date(b.deleted_at).getTime() : 0
          return bTime - aTime
        })
      }
    } else {
      // Column doesn't exist yet, return empty array
      data = []
    }
  }
  
  if (error) throw error
  return (data || []) as Product[]
}

async function fetchSales(): Promise<Sale[]> {
  const supabase = getSupabaseBrowser()
  const { data, error } = await supabase.from("sales").select("*").order("date", { ascending: false })
  if (error) throw error
  return (data || []) as Sale[]
}

export function useProducts() {
  const { data: products = [] } = useSWR<Product[]>(KEYS.products, fetchProducts)
  const { data: deletedProducts = [] } = useSWR<Product[]>(KEYS.deletedProducts, fetchDeletedProducts)
  const { data: sales = [] } = useSWR<Sale[]>(KEYS.sales, fetchSales)

  async function refresh() {
    await Promise.all([mutate(KEYS.products), mutate(KEYS.deletedProducts), mutate(KEYS.sales)])
  }

  return {
    products,
    deletedProducts,
    sales,
    addProduct: async (p: Product) => {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.from("products").insert(p)
      if (error) throw error
      await mutate(KEYS.products)
    },
    updateProduct: async (p: Product) => {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.from("products").update(p).eq("code", p.code).eq("packaging", p.packaging)
      if (error) throw error
      await mutate(KEYS.products)
    },
    addStock: async (code: string, packaging: string, qty: number) => {
      const supabase = getSupabaseBrowser()
      // preferred: atomic RPC
      const { error } = await supabase.rpc("add_stock", { p_code: code, p_packaging: packaging, p_qty: qty })
      if (error) throw error
      await mutate(KEYS.products)
    },
    deleteProduct: async (code: string, packaging: string) => {
      const supabase = getSupabaseBrowser()
      // Soft delete: mark as deleted instead of removing
      const { error } = await supabase
        .from("products")
        .update({ deleted: true, deleted_at: new Date().toISOString() })
        .eq("code", code)
        .eq("packaging", packaging)
      
      if (error) {
        // If column doesn't exist, throw helpful error
        if (error.message.includes('column') && error.message.includes('deleted')) {
          throw new Error('Please apply the SOFT_DELETE_MIGRATION.sql file in your Supabase dashboard first. The deleted column does not exist yet.')
        }
        throw error
      }
      await refresh()
    },
    restoreProduct: async (code: string, packaging: string) => {
      const supabase = getSupabaseBrowser()
      // Restore deleted product
      const { error } = await supabase
        .from("products")
        .update({ deleted: false, deleted_at: null })
        .eq("code", code)
        .eq("packaging", packaging)
      if (error) throw error
      await refresh()
    },
    permanentlyDeleteProduct: async (code: string, packaging: string) => {
      const supabase = getSupabaseBrowser()
      // Actually delete from database (only for deleted products with no sales)
      const { error } = await supabase.from("products").delete().eq("code", code).eq("packaging", packaging)
      if (error) throw error
      await refresh()
    },
    recordSale: async (payload: { productCode: string; name: string; packaging: string; quantitySold: number }) => {
      const supabase = getSupabaseBrowser()
      // transactional: reduces stock and inserts sale
      const { data, error } = await supabase.rpc("record_sale", {
        p_product_code: payload.productCode,
        p_quantity_sold: payload.quantitySold,
        p_packaging: payload.packaging,
      })
      if (error) throw error
      await refresh()
      return data
    },
    recordBulkSale: async (
      items: Array<{ productCode: string; packaging: string; quantitySold: number; sellingPrice?: number }>,
    ): Promise<void> => {
      const supabase = getSupabaseBrowser()
      for (const item of items) {
        const { error } = await supabase.rpc("record_sale", {
          p_product_code: item.productCode,
          p_quantity_sold: item.quantitySold,
          p_packaging: item.packaging,
          p_selling_price: item.sellingPrice, // Pass the custom selling price
        })
        if (error) {
          throw new Error(`Failed for ${item.productCode}: ${error.message}`)
        }
      }
      await mutate(KEYS.products)
      await mutate(KEYS.sales)
    },
  }
}
