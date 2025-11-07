"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProviderOnboardingProps {
  userId: string
}

export function ProviderOnboarding({ userId }: ProviderOnboardingProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    npi: "",
    specialty: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("providers").insert({
        user_id: userId,
        npi: formData.npi,
        specialty: formData.specialty,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        status: "pending",
      })

      if (error) throw error

      router.push("/provider")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-[#0D173C]/5">
      <header className="border-b border-[#4ea8de]/20 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-1.5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold sm:text-xl">CredentialFlow</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl animate-fade-in shadow-lg border-[#4ea8de]/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Complete Your Provider Profile</CardTitle>
                <CardDescription>Enter your information to get started with CredentialFlow</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="npi">NPI Number *</Label>
                  <Input
                    id="npi"
                    placeholder="1234567890"
                    required
                    value={formData.npi}
                    onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input
                    id="specialty"
                    placeholder="e.g., Family Medicine"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="transition-all focus:border-[#4ea8de]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="transition-all focus:border-[#4ea8de]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="10001"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
              </div>
              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0D173C] to-[#4ea8de] transition-all hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Creating profile..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
