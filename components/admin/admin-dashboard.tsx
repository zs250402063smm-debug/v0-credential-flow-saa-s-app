"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, LogOut, Users, FileText, Award, AlertCircle, TrendingUp, Building2 } from "lucide-react"
import { ProvidersTable } from "./providers-table"
import { DocumentsTable } from "./documents-table"
import { LicensesTable } from "./licenses-table"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { subscribeToProviders, subscribeToDocuments, subscribeToLicenses } from "@/lib/supabase/realtime"

interface AdminDashboardProps {
  providers: any[]
  documents: any[]
  licenses: any[]
  userEmail: string
  companyId: string
}

export function AdminDashboard({
  providers: initialProviders,
  documents: initialDocuments,
  licenses: initialLicenses,
  userEmail,
  companyId,
}: AdminDashboardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [providers, setProviders] = useState(initialProviders)
  const [documents, setDocuments] = useState(initialDocuments)
  const [licenses, setLicenses] = useState(initialLicenses)

  useEffect(() => {
    const providersChannel = subscribeToProviders(companyId, () => {
      const supabase = createClient()
      supabase
        .from("providers")
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            email
          )
        `,
        )
        .eq("company_id", companyId)
        .then(({ data }) => data && setProviders(data))
    })

    const documentsChannel = subscribeToDocuments(companyId, () => {
      const supabase = createClient()
      supabase
        .from("documents")
        .select(
          `
          *,
          providers:provider_id (
            npi,
            specialty,
            profiles:user_id (
              full_name,
              email
            )
          )
        `,
        )
        .eq("company_id", companyId)
        .then(({ data }) => data && setDocuments(data))
    })

    const licensesChannel = subscribeToLicenses(companyId, () => {
      const supabase = createClient()
      supabase
        .from("licenses")
        .select(
          `
          *,
          providers:provider_id (
            npi,
            specialty,
            profiles:user_id (
              full_name,
              email
            )
          )
        `,
        )
        .eq("company_id", companyId)
        .then(({ data }) => data && setLicenses(data))
    })

    return () => {
      providersChannel.unsubscribe()
      documentsChannel.unsubscribe()
      licensesChannel.unsubscribe()
    }
  }, [companyId])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  // Calculate stats
  const activeProviders = providers.filter((p) => p.status === "active").length
  const pendingDocuments = documents.filter((d) => d.status === "pending").length
  const expiringLicenses = licenses.filter((l) => {
    const expirationDate = new Date(l.expiration_date)
    const daysUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 90 && daysUntilExpiration > 0
  }).length

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-[20px]">
        <div className=" flex h-16 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#0d173c] to-[#4ea8de] bg-clip-text text-transparent">
              CredentialFlow Admin
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin/company">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                <Building2 className="mr-2 h-4 w-4" />
                Company
              </Button>
            </Link>
            <Link href="/admin/alerts">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                <AlertCircle className="mr-2 h-4 w-4" />
                Alerts
                {expiringLicenses > 0 && (
                  <Badge variant="destructive" className="ml-2 animate-pulse">
                    {expiringLicenses}
                  </Badge>
                )}
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground hidden md:inline">{userEmail}</span>
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage providers, documents, and credentials</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                  <Users className="h-5 w-5 text-[#0d173c]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{providers.length}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  {activeProviders} active
                </p>
              </CardContent>
            </Card>
            <Card
              className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-400/20">
                  <FileText className="h-5 w-5 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingDocuments}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
              </CardContent>
            </Card>
            <Card
              className="stat-card hover-lift border-[#4ea8de]/20 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-400/20">
                  <Award className="h-5 w-5 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{licenses.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all providers</p>
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

          <Tabs defaultValue="providers" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger
                value="providers"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0d173c] data-[state=active]:to-[#1a2b5f] data-[state=active]:text-white"
              >
                Providers
              </TabsTrigger>
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
            </TabsList>
            <TabsContent value="providers" className="space-y-4">
              <Card className="border-[#4ea8de]/20">
                <CardHeader>
                  <CardTitle>Approved Providers</CardTitle>
                  <CardDescription>View and manage providers who have been approved for your company</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProvidersTable providers={providers} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents" className="space-y-4">
              <Card className="border-[#4ea8de]/20">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Review and approve documents submitted by your company's providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentsTable documents={documents} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="licenses" className="space-y-4">
              <Card className="border-[#4ea8de]/20">
                <CardHeader>
                  <CardTitle>Licenses</CardTitle>
                  <CardDescription>
                    Track license status and expiration dates for your company's providers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LicensesTable licenses={licenses} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
