"use client"

import type React from "react"
import type { Product } from "@/lib/store"
import { useMemo, useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/lib/store"
import { toast } from "@/hooks/use-toast"
import { SearchIcon } from "lucide-react"

export default function SalesModule() {
  const { products, recordBulkSale } = useProducts()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Product | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [qty, setQty] = useState<number>(1)
  const [cart, setCart] = useState<
    Array<{ code: string; name: string; packaging: string; qty: number; selling: number; sourcing: number }>
  >([])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products.slice(0, 50)
    const results = products.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.packaging || "").toLowerCase().includes(q),
    )
    return results.slice(0, 50)
  }, [products, query])

  const selling = selected?.sellingPrice ?? 0
  const total = selling * (qty || 0)

  const cartTotal = useMemo(() => cart.reduce((sum, i) => sum + i.qty * i.selling, 0), [cart])

  function addCurrentToCart() {
    if (!selected) {
      toast({ title: "Select a product", description: "Search and choose from the suggestions." })
      return
    }
    if ((qty || 0) < 1) {
      toast({ title: "Invalid quantity", description: "Quantity must be at least 1." })
      return
    }
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.code === selected.code)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [
        ...prev,
        {
          code: selected.code,
          name: selected.name,
          packaging: selected.packaging,
          qty,
          selling: selected.sellingPrice ?? 0,
          sourcing: selected.sourcingPrice ?? 0,
        },
      ]
    })
    // reset current selector state
    setQty(1)
    setSelected(null)
    setQuery("")
  }

  function removeFromCart(code: string) {
    setCart((prev) => prev.filter((i) => i.code !== code))
  }

  function updateCartQty(code: string, newQty: number) {
    setCart((prev) => prev.map((i) => (i.code === code ? { ...i, qty: Math.max(1, newQty || 1) } : i)))
  }

  function updateCartPrice(code: string, newPrice: number) {
    setCart((prev) =>
      prev.map((i) => {
        if (i.code === code) {
          const price = Math.max(0, newPrice || 0)
          return { ...i, selling: price }
        }
        return i
      }),
    )
  }

  function printReceipt() {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sales Receipt</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0;
            padding: 10mm 5mm;
            font-size: 12px;
            line-height: 1.4;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding: 12px 8px;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            border-radius: 8px;
            border: 2px solid #000;
          }
          .shop-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #000;
            text-shadow: 1px 1px 0px #fff;
          }
          .shop-tagline {
            font-size: 10px;
            margin-bottom: 8px;
            color: #444;
            font-style: italic;
          }
          .shop-address {
            font-size: 11px;
            margin-bottom: 6px;
            color: #333;
            font-weight: 500;
          }
          .shop-contact {
            font-size: 10px;
            color: #555;
            margin-bottom: 8px;
          }
          .receipt-title {
            font-size: 13px;
            font-weight: bold;
            margin: 8px 0 4px 0;
            letter-spacing: 2px;
            background: #000;
            color: #fff;
            padding: 4px;
            border-radius: 3px;
          }
          .date-time {
            font-size: 10px;
            margin-top: 6px;
            color: #555;
            font-weight: 500;
          }
          .divider {
            border-bottom: 1px solid #000;
            margin: 10px 0;
          }
          .items-section {
            margin: 10px 0;
          }
          .item {
            margin: 8px 0;
            page-break-inside: avoid;
          }
          .item-name {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 2px;
          }
          .item-details {
            font-size: 10px;
            color: #555;
            margin-bottom: 3px;
          }
          .item-calc {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-top: 2px;
          }
          .item-price {
            font-weight: bold;
          }
          .totals {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 2px dashed #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 11px;
          }
          .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #000;
          }
          .footer {
            text-align: center;
            margin-top: 15px;
            padding: 10px 8px;
            background: #f9f9f9;
            border-radius: 8px;
            border: 2px solid #ddd;
          }
          .thank-you {
            font-size: 13px;
            margin-bottom: 8px;
            font-weight: bold;
            color: #000;
          }
          .footer-note {
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.5;
          }
          .developer {
            font-size: 9px;
            margin-top: 10px;
            padding-top: 8px;
            color: #999;
            border-top: 1px dashed #ccc;
            font-style: italic;
          }
          @media print {
            body {
              padding: 5mm 3mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">🎨 Jamat Ali Sanitary<br>Tiles & Paint Store 🏪</div>
          <div class="shop-tagline">Your Complete Building Solutions Partner</div>
          <div class="shop-address">📍 Jamat Ali Bazar, Samundri</div>
          <div class="shop-contact">📞 Contact us for quality products</div>
          <div class="receipt-title">SALES INVOICE</div>
          <div class="date-time">${new Date().toLocaleString('en-PK', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
          })}</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="items-section">
          ${cart.map((item, index) => `
            <div class="item">
              <div class="item-name">${index + 1}. ${item.name}</div>
              <div class="item-details">Code: ${item.code} | ${item.packaging}</div>
              <div class="item-calc">
                <span>${item.qty} × Rs. ${item.selling.toFixed(2)}</span>
                <span class="item-price">Rs. ${(item.qty * item.selling).toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span>Total Items:</span>
            <span>${cart.reduce((sum, i) => sum + i.qty, 0)}</span>
          </div>
          <div class="total-row">
            <span>Products:</span>
            <span>${cart.length}</span>
          </div>
          <div class="grand-total">
            <span>TOTAL AMOUNT</span>
            <span>Rs. ${cartTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div class="thank-you">✓ Thank You for Your Business!</div>
          <div class="footer-note">
            We appreciate your trust in us.<br>
            Quality products • Competitive prices • Best service<br>
            Visit us again for all your building needs!
          </div>
          <div class="developer">Developed by JALogics</div>
        </div>
      </body>
      </html>
    `
    
    const printWindow = window.open('', '', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    let items = cart
    if (items.length === 0 && selected) {
      items = [
        {
          code: selected.code,
          name: selected.name,
          packaging: selected.packaging,
          qty,
          selling: selected.sellingPrice ?? 0,
          sourcing: selected.sourcingPrice ?? 0,
        },
      ]
    }

    if (items.length === 0) {
      toast({
        title: "Add at least one item",
        description: "Use the search to select a product and click Add Item.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[Sale] Recording sale with items:", items)
      await recordBulkSale(
        items.map((i) => ({
          productCode: i.code,
          packaging: i.packaging,
          quantitySold: i.qty,
          sellingPrice: i.selling,
        })),
      )
      setCart([])
      setQty(1)
      setSelected(null)
      setQuery("")
      console.log("[Sale] Successfully recorded!")
      toast({ 
        title: "✓ Sale recorded successfully!", 
        description: `${items.length} item(s) sold. Total: ${cartTotal.toFixed(2)}`,
      })
      
      // Print receipt
      printReceipt()
    } catch (err: any) {
      console.error("[Sale] Error:", err)
      const errorMsg = err?.message || err?.toString() || "Unknown error"
      console.error("[Sale] Full error details:", errorMsg)
      
      // Check if it's a database parameter issue
      if (errorMsg.includes("p_selling_price") || errorMsg.includes("argument")) {
        toast({
          title: "⚠️ Database needs updating",
          description: "Please apply the SQL migration from APPLY_THIS_SQL.sql in your Supabase dashboard first.",
          variant: "destructive",
        })
      } else if (errorMsg.includes("stock") || errorMsg.includes("Insufficient")) {
        toast({
          title: "✗ Insufficient stock",
          description: errorMsg,
          variant: "destructive",
        })
      } else {
        toast({
          title: "✗ Unable to record sale",
          description: errorMsg,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-background">
        <CardTitle className="flex items-center gap-2 text-2xl">
          🛒 Record Sale
          {cart.length > 0 && (
            <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-md">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Search products, set quantity, and add to cart. Press Enter to quickly add items. Prices are editable in cart.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Product Search Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative" ref={searchRef}>
            <Label htmlFor="query">Product Code or Name</Label>
            <div className="relative">
              <Input
                id="query"
                type="text"
                placeholder="Type code or name to search... (e.g., NU-100, White Paint)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(e.target.value.length > 0)
                }}
                onFocus={() => query.length > 0 && setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false)
                    setQuery("")
                  }
                }}
                autoFocus
                className="pr-10 h-11"
              />
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
            </div>
            {selected && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full">
                    <span className="text-green-700 dark:text-green-400 text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-900 dark:text-green-100">{selected.code}</div>
                    <div className="text-xs text-green-700 dark:text-green-300">{selected.name} • {selected.packaging}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(null)
                    setQuery("")
                  }}
                  className="h-8 px-3 text-green-700 hover:text-green-900 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-900/40"
                >
                  Change
                </Button>
              </div>
            )}
            {open && query.length > 0 && (
              <div className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto bg-popover border border-border rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95">
                {filtered.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-muted-foreground text-sm">No products found</div>
                    <div className="text-xs text-muted-foreground/70 mt-1">Try a different search term</div>
                  </div>
                ) : (
                  <div className="p-1.5">
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
                    </div>
                    {filtered.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          setSelected(p)
                          setQuery("")
                          setOpen(false)
                        }}
                        className="w-full text-left px-3 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <span className="text-primary font-bold text-xs">{p.code.substring(0, 2)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm">{p.code}</div>
                            <div className="text-xs text-muted-foreground truncate">{p.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{p.packaging}</div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${
                            p.quantity === 0 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : p.quantity < 10 
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {p.quantity} in stock
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

            <div className="space-y-2">
              <Label htmlFor="qty" className="text-sm font-semibold">Quantity</Label>
              <div className="flex gap-2">
                <Input 
                  id="qty" 
                  type="number" 
                  min={1} 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selected) {
                      e.preventDefault()
                      addCurrentToCart()
                    }
                  }}
                  className="h-11 text-lg font-medium text-center"
                  placeholder="1"
                />
                <Button 
                  type="button" 
                  size="lg"
                  onClick={addCurrentToCart}
                  className="bg-primary hover:bg-primary/90 min-w-[140px] font-semibold"
                  disabled={!selected}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Shopping Cart {cart.length > 0 && `(${cart.length})`}</h3>
              {cart.length > 0 && (
                <span className="text-sm text-muted-foreground">{cart.reduce((sum, i) => sum + i.qty, 0)} items total</span>
              )}
            </div>
            
            {cart.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Code</th>
                      <th className="text-left p-3 font-semibold">Name</th>
                      <th className="text-left p-3 font-semibold">Size</th>
                      <th className="text-right p-3 font-semibold">Price</th>
                      <th className="text-right p-3 font-semibold">Qty</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((i) => (
                      <tr key={i.code} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{i.code}</td>
                        <td className="p-3">{i.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{i.packaging}</td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={i.selling}
                            onChange={(e) => updateCartPrice(i.code, Number(e.target.value))}
                            className="h-9 w-28 text-right font-medium"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            min={1}
                            value={i.qty}
                            onChange={(e) => updateCartQty(i.code, Number(e.target.value))}
                            className="h-9 w-20 text-right font-medium"
                          />
                        </td>
                        <td className="p-3 text-right font-semibold text-lg">{(i.qty * i.selling).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFromCart(i.code)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-primary/20 bg-primary/5">
                      <td colSpan={3} className="p-4 text-left">
                        <div className="text-xs text-muted-foreground">Items: {cart.reduce((sum, i) => sum + i.qty, 0)}</div>
                      </td>
                      <td colSpan={2} className="p-4 text-right font-semibold text-base">
                        Total Amount
                      </td>
                      <td className="p-4 text-right font-bold text-2xl text-primary">{cartTotal.toFixed(2)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/20">
                <div className="text-muted-foreground space-y-2">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-lg font-medium">Cart is empty</p>
                  <p className="text-sm">Search for products above and add them to the cart</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Cards - Show when product selected */}
          {selected && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg border">
              <div className="rounded-lg border p-4 bg-card">
                <p className="text-xs font-medium text-muted-foreground mb-1">Selling Price</p>
                <p className="text-xl font-bold">{selling.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-4 bg-card">
                <p className="text-xs font-medium text-muted-foreground mb-1">Cost Price</p>
                <p className="text-xl font-bold">{(selected?.sourcingPrice ?? 0).toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-4 bg-card">
                <p className="text-xs font-medium text-muted-foreground mb-1">In Stock</p>
                <p className={`text-xl font-bold ${
                  (selected?.quantity ?? 0) === 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : (selected?.quantity ?? 0) < 10 
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>{selected?.quantity ?? 0}</p>
              </div>
              <div className="rounded-lg border p-4 bg-primary/10 border-primary/30">
                <p className="text-xs font-medium text-primary/80 mb-1">Order Total</p>
                <p className="text-xl font-bold text-primary">{total.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <span className="text-blue-600 dark:text-blue-400 font-medium">ℹ</span>
                <span>Receipt will print automatically after completing the sale</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 h-14 text-lg font-bold shadow-lg"
                >
                  ✓ Complete Sale & Print - {cartTotal.toFixed(2)}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => { setCart([]); setSelected(null); setQuery(""); }}
                  className="sm:w-[140px] h-14"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
