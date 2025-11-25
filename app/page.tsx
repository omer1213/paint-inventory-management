"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Package2 as Packages, ShoppingCart, BarChart3, PlusCircle, SettingsIcon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import ProductsModule from "@/components/products-module"
import StockModule from "@/components/stock-module"
import SalesModule from "@/components/sales-module"
import ReportsModule from "@/components/reports-module"
import SettingsModule from "@/components/settings-module"

export default function Home() {
  return (
    <main className="min-h-dvh">
      <header className="border-b bg-linear-to-r from-primary/10 via-primary/5 to-background shadow-sm sticky top-0 z-50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div aria-hidden className="size-12 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <span className="text-2xl">🎨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Jamat Ali Paint Store
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Sanitary, Tiles & Paint Store • Jamat Ali Bazar, Samundri</p>
            </div>
          </div>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
            afterSignOutUrl="/sign-in"
          />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="products" className="gap-2">
              <PlusCircle className="size-4" /> Products
            </TabsTrigger>
            <TabsTrigger value="stock" className="gap-2">
              <Packages className="size-4" /> Stock
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingCart className="size-4" /> Sales
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="size-4" /> Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <SettingsIcon className="size-4" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="pt-4">
            <ProductsModule />
          </TabsContent>
          <TabsContent value="stock" className="pt-4">
            <StockModule />
          </TabsContent>
          <TabsContent value="sales" className="pt-4">
            <SalesModule />
          </TabsContent>
          <TabsContent value="reports" className="pt-4">
            <ReportsModule />
          </TabsContent>
          <TabsContent value="settings" className="pt-4">
            <SettingsModule />
          </TabsContent>
        </Tabs>
      </section>
      <footer className="border-t mt-8 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">© 2025 Jamat Ali Sanitary, Tiles & Paint Store</p>
          <p className="text-xs text-muted-foreground mt-1">Software developed by <span className="font-semibold text-primary">JALogics</span></p>
        </div>
      </footer>
    </main>
  )
}
