"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/lib/store"
import { downloadCSV } from "@/lib/export"
import { Download } from "lucide-react"

type RangeKey = "today" | "yesterday" | "week" | "month" | "custom"

function rangeToDates(key: RangeKey, custom?: { from?: string; to?: string }) {
  const now = new Date()
  const start = new Date()
  const end = new Date()
  if (key === "today") {
    // start and end as today
  } else if (key === "yesterday") {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (key === "week") {
    const day = now.getDay()
    start.setDate(now.getDate() - day)
  } else if (key === "month") {
    start.setDate(1)
  } else if (key === "custom") {
    if (custom?.from) start.setTime(new Date(custom.from).getTime())
    if (custom?.to) end.setTime(new Date(custom.to).getTime())
  }
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export default function ReportsModule() {
  const { sales, products } = useProducts()
  const [key, setKey] = useState<RangeKey>("month")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [page, setPage] = useState(1)
  const itemsPerPage = 50

  const { list, totalProfit, totalRevenue, totalSold, totalPages, paginatedList } = useMemo(() => {
    const { start, end } = rangeToDates(key, { from, to })
    const filtered = sales.filter((s) => {
      const d = new Date(s.date)
      return d >= start && d <= end
    })
    const totalProfit = filtered.reduce((acc, s) => acc + (s.sellingPrice - s.sourcingPrice) * s.quantitySold, 0)
    const totalRevenue = filtered.reduce((acc, s) => acc + s.sellingPrice * s.quantitySold, 0)
    const totalSold = filtered.reduce((acc, s) => acc + s.quantitySold, 0)
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedList = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)
    return { list: filtered, totalProfit, totalRevenue, totalSold, totalPages, paginatedList }
  }, [sales, key, from, to, page])

  const topProducts = useMemo(() => {
    const map = new Map<string, number>()
    list.forEach((s) => map.set(s.productCode, (map.get(s.productCode) || 0) + s.quantitySold))
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [list])

  const lowStock = useMemo(() => products.filter((p) => p.quantity < 5), [products])

  function exportSales() {
    downloadCSV(
      ["Date", "Product Code", "Name", "Packaging", "Qty Sold", "Selling Price", "Total Sale"],
      list.map((s) => [
        new Date(s.date).toLocaleString(),
        s.productCode,
        s.name,
        s.packaging,
        String(s.quantitySold),
        String(s.sellingPrice),
        String(s.quantitySold * s.sellingPrice),
      ]),
      "sales-report.csv",
    )
  }
  function exportProfit() {
    downloadCSV(
      ["Product Code", "Name", "Qty Sold", "Profit/Unit", "Total Profit"],
      list.map((s) => [
        s.productCode,
        s.name,
        String(s.quantitySold),
        String(s.sellingPrice - s.sourcingPrice),
        String((s.sellingPrice - s.sourcingPrice) * s.quantitySold),
      ]),
      "profit-report.csv",
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md border-2 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">💰 Total Revenue</div>
            <div className="text-3xl font-bold mt-2 text-blue-600 dark:text-blue-400">Rs. {totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-2 bg-gradient-to-br from-green-50 to-background dark:from-green-950/20">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">📈 Total Profit</div>
            <div className="text-3xl font-bold mt-2 text-green-600 dark:text-green-400">Rs. {totalProfit.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-2 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">📦 Items Sold</div>
            <div className="text-3xl font-bold mt-2 text-purple-600 dark:text-purple-400">{totalSold}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-2 bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">🧾 Transactions</div>
            <div className="text-3xl font-bold mt-2 text-orange-600 dark:text-orange-400">{list.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-linear-to-r from-primary/5 to-background">
          <CardTitle className="text-xl mb-4">📊 Filters</CardTitle>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button 
                variant={key === "today" ? "default" : "outline"} 
                onClick={() => { setKey("today"); setPage(1); }}
                className="w-full text-sm"
              >
                Today
              </Button>
              <Button 
                variant={key === "yesterday" ? "default" : "outline"} 
                onClick={() => { setKey("yesterday"); setPage(1); }}
                className="w-full text-sm"
              >
                Yesterday
              </Button>
              <Button 
                variant={key === "week" ? "default" : "outline"} 
                onClick={() => { setKey("week"); setPage(1); }}
                className="w-full text-sm"
              >
                This Week
              </Button>
              <Button 
                variant={key === "month" ? "default" : "outline"} 
                onClick={() => { setKey("month"); setPage(1); }}
                className="w-full text-sm"
              >
                This Month
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value)
                  setKey("custom")
                  setPage(1)
                }}
                aria-label="From date"
                className="w-full"
              />
              <Input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value)
                  setKey("custom")
                  setPage(1)
                }}
                aria-label="To date"
                className="w-full"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Sales Report</CardTitle>
          <Button variant="outline" onClick={exportSales} className="gap-2 bg-transparent w-full sm:w-auto">
            <Download className="size-4" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-6 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="min-w-[140px]">Date</TableHead>
                  <TableHead className="min-w-[100px]">Code</TableHead>
                  <TableHead className="min-w-[120px]">Name</TableHead>
                  <TableHead className="min-w-[90px]">Pack</TableHead>
                  <TableHead className="text-right min-w-[60px]">Qty</TableHead>
                  <TableHead className="text-right min-w-20">Price</TableHead>
                  <TableHead className="text-right min-w-[90px]">Revenue</TableHead>
                  <TableHead className="text-right min-w-20">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.map((s) => {
                  const revenue = s.quantitySold * s.sellingPrice
                  const profit = (s.sellingPrice - s.sourcingPrice) * s.quantitySold
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs whitespace-nowrap">{new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                      <TableCell className="font-medium">{s.productCode}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{s.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.packaging}</TableCell>
                      <TableCell className="text-right">{s.quantitySold}</TableCell>
                      <TableCell className="text-right">{s.sellingPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">{revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400 font-medium">+{profit.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No sales in selected range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, list.length)} of {list.length}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-9"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.slice(0, 50).map(([code, qty]) => (
                    <TableRow key={code}>
                      <TableCell>{code}</TableCell>
                      <TableCell className="text-right">{qty}</TableCell>
                    </TableRow>
                  ))}
                  {topProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No data yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Low Stock Alerts (Qty &lt; 5)</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((p) => (
                    <TableRow key={p.code} className="border-b">
                      <TableCell className="font-medium">{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          p.quantity === 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>{p.quantity}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {lowStock.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        All good. ✓
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
