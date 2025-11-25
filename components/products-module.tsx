"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/lib/store"
import { useTypes } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function ProductsModule() {
  const { addProduct } = useProducts()
  const { types } = useTypes()
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const code = String(form.get("code") || "")
      .trim()
      .toUpperCase()
    const name = String(form.get("name") || "").trim()
    const type = String(form.get("type") || "")
    const packaging = String(form.get("packaging") || "")
    const qty = Number(form.get("qty") || 0)
    const sourcingPrice = Number(form.get("sourcingPrice") || 0)
    const sellingPrice = Number(form.get("sellingPrice") || 0)

    if (!code || !name || !packaging || !type) {
      toast({
        title: "Missing required fields",
        description: "Code, Name, Packaging, and Type are required.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      console.log("[v0] Adding product:", { code, name, type, packaging, qty, sourcingPrice, sellingPrice })
      await addProduct({
        code,
        name,
        type,
        packaging,
        quantity: qty,
        sourcingPrice,
        sellingPrice,
      })
      console.log("[v0] Product saved successfully")
      if (formRef.current) {
        formRef.current.reset()
      }
      toast({ title: "✓ Product saved", description: `${code} • ${name}`, variant: "default" })
      requestAnimationFrame(() => {
        const el = document.getElementById("code") as HTMLInputElement | null
        el?.focus()
      })
    } catch (err: any) {
      console.error("[v0] Product save error:", err)
      toast({
        title: "✗ Unable to save",
        description: err?.message || "Check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
        <CardTitle className="text-balance text-2xl">📦 Add Product</CardTitle>
        <CardDescription className="text-base">Create a product with code, name, packaging, and pricing details.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code" className="mb-0 text-sm font-medium leading-6">
              Product Code
            </Label>
            <Input id="code" name="code" placeholder="e.g. PNT-001" required className="h-10" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="mb-0 text-sm font-medium leading-6">
              Product Name
            </Label>
            <Input id="name" name="name" placeholder="e.g. Wall Emulsion" required className="h-10" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="mb-0 text-sm font-medium leading-6">Type</Label>
            <Select name="type" disabled={types.length === 0}>
              <SelectTrigger aria-label="Product Type" className="h-10">
                <SelectValue placeholder={types.length ? "Select type" : "No types — add in Settings"} />
              </SelectTrigger>
              <SelectContent position="popper" side="top" sideOffset={6} className="z-50">
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {types.length === 0 ? (
              <p className="text-muted-foreground text-xs mt-1">Add product types in the Settings tab.</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="mb-0 text-sm font-medium leading-6">Packaging</Label>
            <Select name="packaging">
              <SelectTrigger aria-label="Packaging" className="h-10">
                <SelectValue placeholder="Select packaging" />
              </SelectTrigger>
              <SelectContent position="popper" side="top" sideOffset={6} className="z-50">
                <SelectItem value="Gallon">Gallon</SelectItem>
                <SelectItem value="Quarter">Quarter</SelectItem>
                <SelectItem value="Balti">Balti</SelectItem>
                <SelectItem value="Tin">Tin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qty" className="mb-0 text-sm font-medium leading-6">
              Quantity
            </Label>
            <Input id="qty" name="qty" type="number" min={0} defaultValue={0} className="h-10" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sourcingPrice" className="mb-0 text-sm font-medium leading-6">
              Sourcing Price
            </Label>
            <Input id="sourcingPrice" name="sourcingPrice" type="number" step="0.01" min={0} className="h-10" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sellingPrice" className="mb-0 text-sm font-medium leading-6">
              Selling Price
            </Label>
            <Input id="sellingPrice" name="sellingPrice" type="number" step="0.01" min={0} className="h-10" />
          </div>

          <div className="md:col-span-3">
            <Button type="submit" disabled={loading} className="w-full md:w-auto bg-primary text-primary-foreground">
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
