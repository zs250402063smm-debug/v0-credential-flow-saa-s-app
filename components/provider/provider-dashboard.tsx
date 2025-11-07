"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, LogOut, FileText, Award, AlertCircle, TrendingUp, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProviderDocuments } from "./provider-documents"
import { ProviderLicenses } from "./provider-licenses"
import { ProviderProfile } from "./provider-profile"

interface ProviderDashboardProps {
  provider: any
  profile: any
  documents: any[]
  licenses: any[]
}

export function ProviderDashboard({ provider, profile, documents, licenses }: ProviderDashboardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  // Calculate stats
  const pendingDocuments = documents.filter((d) => d.status === "pending").length
  const approvedDocuments = documents.filter((d) => d.status === "approved").length
  const expiringLicenses = licenses.filter((l) => {
    const expirationDate = new Date(l.expiration_date)
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 90 && daysUntilExpiration > 0
  }).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "inactive":
        return "outline"
      case "suspended":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20 px-[20px]">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className=" flex h-16 items-center justify-between">
          <Link href="/provider" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0d173c] to-[#4ea8de] bg-clip-text text-transparent">
              CredentialFlow
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="transition-all hover:scale-105"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-[20px]">
        <div className="">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile.full_name || "Provider"}</h1>
              <p className="text-muted-foreground">Manage your credentials and documents</p>
            </div>
            <Badge variant={getStatusColor(provider.status)} className="text-sm px-4 py-2">
              Status: {provider.status}
            </Badge>
          </div>

          <Card className="mb-8 border-[#4ea8de]/50 bg-gradient-to-r from-[#0d173c]/5 to-[#4ea8de]/5 animate-fade-in hover-lift">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Join a Company</h3>
                  <p className="text-sm text-muted-foreground">
                    Request access to a company using an enrollment code provided by your administrator
                  </p>
                </div>
              </div>
              <Link href="/provider/join-company" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-[#0d173c] to-[#4ea8de] text-white hover:opacity-90 transition-all hover:scale-105 shadow-md">
                  <Building2 className="mr-2 h-4 w-4" />
                  Request Access
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Alert for pending status */}
          {provider.status === "pending" && (
            <Card className="mb-8 border-amber-500/50 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/20 animate-fade-in">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-100">Your account is pending approval</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                    An administrator will review your profile and credentials. You can still upload documents while
                    waiting.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                  <FileText className="h-5 w-5 text-[#0d173c]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {approvedDocuments} approved
                </p>
              </CardContent>
            </Card>
            <Card
              className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-400/20">
                  <FileText className="h-5 w-5 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingDocuments}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
            <Card
              className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-400/20">
                  <Award className="h-5 w-5 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{licenses.length}</div>
                <p className="text-xs text-muted-foreground mt-1">On file</p>
              </CardContent>
            </Card>
            <Card
              className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-orange-400/20">
                  <AlertCircle className="h-5 w-5 text-red-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{expiringLicenses}</div>
                <p className="text-xs text-muted-foreground mt-1">Within 90 days</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0d173c] data-[state=active]:to-[#1a2b5f] data-[state=active]:text-white"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="licenses"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0d173c] data-[state=active]:to-[#1a2b5f] data-[state=active]:text-white"
              >
                Licenses
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0d173c] data-[state=active]:to-[#1a2b5f] data-[state=active]:text-white"
              >
                Profile
              </TabsTrigger>
            </TabsList>
            <TabsContent value="documents" className="space-y-4">
              <ProviderDocuments documents={documents} providerId={provider.id} />
            </TabsContent>
            <TabsContent value="licenses" className="space-y-4">
              <ProviderLicenses licenses={licenses} providerId={provider.id} />
            </TabsContent>
            <TabsContent value="profile" className="space-y-4">
              <ProviderProfile provider={provider} profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
