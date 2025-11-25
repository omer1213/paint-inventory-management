"use client"

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎨 Jamat Ali Paint Store</h1>
          <p className="text-muted-foreground">Sanitary, Tiles & Paint Store</p>
          <p className="text-sm text-muted-foreground">Jamat Ali Bazar, Samundri</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl",
            }
          }}
          routing="path"
          path="/sign-in"
        />
        <p className="text-center text-xs text-muted-foreground mt-6">
          Software developed by JALogics
        </p>
      </div>
    </div>
  )
}
