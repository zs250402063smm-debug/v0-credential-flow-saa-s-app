"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile to determine role
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      // Redirect based on role
      if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/provider")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4ea8de]/10 via-background to-[#0d173c]/10" />
      <div className="absolute top-20 right-20 h-96 w-96 rounded-full bg-[#4ea8de]/20 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-96 w-96 rounded-full bg-[#0d173c]/20 blur-3xl" />

      <div className="relative w-full max-w-sm animate-scale-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d173c] to-[#4ea8de] shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#0d173c] to-[#4ea8de] bg-clip-text text-transparent">
              CredentialFlow
            </span>
          </Link>
        </div>

        <Card className="border-[#4ea8de]/20 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="provider@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#0d173c] to-[#1a2b5f] text-white hover:opacity-90 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="font-medium text-[#4ea8de] underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
