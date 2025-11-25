import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Jamat Ali Paint Store - Inventory Management",
  description: "Complete inventory management system for Jamat Ali Sanitary, Tiles & Paint Store",
  generator: "JALogics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
        <body className="font-sans bg-background text-foreground" suppressHydrationWarning>
          {children}
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
