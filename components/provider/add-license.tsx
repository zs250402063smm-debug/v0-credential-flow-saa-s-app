"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AddLicenseProps {
  providerId: string
}

export function AddLicense({ providerId }: AddLicenseProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    license_number: "",
    license_type: "",
    issuing_state: "",
    issue_date: "",
    expiration_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("licenses").insert({
        provider_id: providerId,
        license_number: formData.license_number,
        license_type: formData.license_type,
        issuing_state: formData.issuing_state,
        issue_date: formData.issue_date,
        expiration_date: formData.expiration_date,
        status: "active",
        verification_status: "pending",
      })

      if (error) throw error

      router.push("/provider")
    } catch (error: unknown) {
      console.error("[v0] License creation error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-[#0D173C]/5">
      <header className="border-b border-[#4ea8de]/20 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/provider" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-1.5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold sm:text-xl">CredentialFlow</span>
          </Link>
          <Link href="/provider">
            <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl animate-fade-in shadow-lg border-[#4ea8de]/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Add License</CardTitle>
                <CardDescription>Enter your professional license information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number *</Label>
                  <Input
                    id="license_number"
                    placeholder="ABC123456"
                    required
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_type">License Type *</Label>
                  <Input
                    id="license_type"
                    placeholder="e.g., Medical License"
                    required
                    value={formData.license_type}
                    onChange={(e) => setFormData({ ...formData, license_type: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuing_state">Issuing State *</Label>
                <Input
                  id="issuing_state"
                  placeholder="CA"
                  maxLength={2}
                  required
                  value={formData.issuing_state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      issuing_state: e.target.value.toUpperCase(),
                    })
                  }
                  className="transition-all focus:border-[#4ea8de]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date *</Label>
                  <Input
                    id="issue_date"
                    type="date"
                    required
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration_date">Expiration Date *</Label>
                  <Input
                    id="expiration_date"
                    type="date"
                    required
                    value={formData.expiration_date}
                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                    className="transition-all focus:border-[#4ea8de]"
                  />
                </div>
              </div>
              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#0D173C] to-[#4ea8de] transition-all hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding license..." : "Add License"}
                </Button>
                <Link href="/provider" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all hover:scale-105 bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
