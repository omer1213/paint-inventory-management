"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useProducts, type Product } from "@/lib/store"
import { downloadCSV } from "@/lib/export"
import { Pencil, Plus, Download, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function StockModule() {
  const { products, updateProduct, addStock } = useProducts()
  const [query, setQuery] = useState("")
  const [showStoreValue, setShowStoreValue] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return products.filter((p) => p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
  }, [products, query])

  const totalStoreValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.quantity * p.sourcingPrice), 0)
  }, [products])

  function handleEyeClick() {
    if (showStoreValue) {
      // If already showing, just hide it
      setShowStoreValue(false)
    } else {
      // If hidden, ask for password
      setPassword("")
      setShowPasswordDialog(true)
    }
  }

  function handlePasswordSubmit() {
    if (password === "Hello$50") {
      setShowStoreValue(true)
      setShowPasswordDialog(false)
      setPassword("")
      toast({
        title: "✓ Access Granted",
        description: "Store value is now visible",
      })
    } else {
      toast({
        title: "✗ Access Denied",
        description: "You are not permitted to check this. Sorry!",
        variant: "destructive",
      })
      setPassword("")
    }
  }

  function exportCSV() {
    downloadCSV(
      ["Code", "Name", "Type", "Packaging", "Qty", "Selling Price", "Sourcing Price"],
      filtered.map((p) => [
        p.code,
        p.name,
        p.type,
        p.packaging,
        String(p.quantity),
        String(p.sellingPrice),
        String(p.sourcingPrice),
      ]),
      "stock-report.csv",
    )
  }

  return (
    <Card className="shadow-lg border-2">
      <CardContent className="pt-6">
        {/* Store Value Display */}
        <div className="mb-4 p-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Store Value (Sourcing Price)</p>
                  {showStoreValue ? (
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                      Rs. {totalStoreValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-muted-foreground">
                      Rs. ••••••
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on {products.length} product{products.length !== 1 ? 's' : ''} in inventory
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleEyeClick}
              className="h-10 w-10 rounded-full"
              aria-label={showStoreValue ? "Hide store value" : "Show store value"}
            >
              {showStoreValue ? (
                <Eye className="size-5" />
              ) : (
                <EyeOff className="size-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 p-4 bg-linear-to-r from-primary/5 to-background rounded-lg border">
          <Input 
            placeholder="🔍 Search products by code or name..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 text-base shadow-sm"
          />
          <Button variant="outline" onClick={exportCSV} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 min-w-40 shadow-sm font-semibold">
            <Download className="size-4" /> Download CSV
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Packaging</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Selling</TableHead>
                <TableHead className="text-right">Sourcing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={`${p.code}-${p.packaging}`}>
                  <TableCell className="font-medium">{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.packaging}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-right">{p.sellingPrice}</TableCell>
                  <TableCell className="text-right">{p.sourcingPrice}</TableCell>
                  <TableCell className="flex gap-2">
                    <EditProductDialog product={p} onSave={updateProduct} />
                    <AddStockDialog
                      code={p.code}
                      packaging={p.packaging}
                      onAdd={async (qty) => {
                        try {
                          console.log(`[v0] Adding ${qty} stock to ${p.code} (${p.packaging})`)
                          await addStock(p.code, p.packaging, qty)
                          toast({ title: "✓ Stock added", description: `${qty} unit(s) added to ${p.code} (${p.packaging})` })
                        } catch (err: any) {
                          console.error("[v0] Add stock error:", err)
                          toast({
                            title: "✗ Add stock failed",
                            description: err?.message || "Please try again.",
                            variant: "destructive",
                          })
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No products yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Password Dialog */}
        <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>🔒 Enter Password</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the password to view the store value.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit()
                  }
                }}
                className="h-11"
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPassword("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePasswordSubmit}>Submit</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

function EditProductDialog({ product, onSave }: { product: Product; onSave: (p: Product) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const d = new FormData(e.currentTarget)
    try {
      console.log("[v0] Updating product:", product.code)
      await onSave({
        code: product.code,
        name: String(d.get("name") || ""),
        type: String(d.get("type") || ""),
        packaging: String(d.get("packaging") || ""),
        quantity: Number(d.get("quantity") || 0),
        sourcingPrice: Number(d.get("sourcingPrice") || 0),
        sellingPrice: Number(d.get("sellingPrice") || 0),
      })
      console.log("[v0] Product updated successfully")
      toast({ title: "✓ Product updated", description: product.code })
      setOpen(false)
    } catch (err: any) {
      console.error("[v0] Update error:", err)
      toast({ title: "✗ Update failed", description: err?.message || "Please try again.", variant: "destructive" })
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`Edit ${product.code}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {product.code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input name="name" defaultValue={product.name} />
            </div>
            <div>
              <Label>Type</Label>
              <Input name="type" defaultValue={product.type} />
            </div>
            <div>
              <Label>Packaging</Label>
              <Input name="packaging" defaultValue={product.packaging} />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" name="quantity" defaultValue={product.quantity} />
            </div>
            <div>
              <Label>Sourcing Price</Label>
              <Input type="number" step="0.01" name="sourcingPrice" defaultValue={product.sourcingPrice} />
            </div>
            <div>
              <Label>Selling Price</Label>
              <Input type="number" step="0.01" name="sellingPrice" defaultValue={product.sellingPrice} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddStockDialog({ code, packaging, onAdd }: { code: string; packaging: string; onAdd: (qty: number) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = Number(new FormData(e.currentTarget).get("qty") || 0)
    try {
      console.log(`[v0] Adding ${q} stock to ${code}`)
      await onAdd(q)
      setOpen(false)
    } catch (err: any) {
      console.error("[v0] Add stock dialog error:", err)
      toast({ title: "✗ Add stock failed", description: err?.message || "Please try again.", variant: "destructive" })
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-primary text-primary-foreground" aria-label={`Add stock ${code}`}>
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Stock for {code} ({packaging})</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-3">
          <div>
            <Label>Quantity</Label>
            <Input name="qty" type="number" min={1} defaultValue={1} />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


