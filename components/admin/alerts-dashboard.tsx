"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, LogOut, AlertCircle, Bell } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AlertsDashboardProps {
  licenses: any[]
  userEmail: string
}

export function AlertsDashboard({ licenses, userEmail }: AlertsDashboardProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const alerts = useMemo(() => {
    const today = new Date()
    const alertsList = []

    for (const license of licenses) {
      const expirationDate = new Date(license.expiration_date)
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilExpiration <= 90 && daysUntilExpiration > 0) {
        alertsList.push({
          licenseId: license.id,
          licenseNumber: license.license_number,
          licenseType: license.license_type,
          expirationDate: license.expiration_date,
          daysUntilExpiration,
          provider: license.providers,
          severity: daysUntilExpiration <= 30 ? "critical" : daysUntilExpiration <= 60 ? "warning" : "info",
        })
      }
    }

    return alertsList.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)
  }, [licenses])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-[#0D173C]/5">
      <header className="sticky top-0 z-50 w-full border-b border-[#4ea8de]/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-1.5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold sm:text-xl">CredentialFlow Admin</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="transition-all hover:scale-105">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Expiration Alerts</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Monitor licenses expiring within 90 days
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="w-full transition-all hover:scale-105 sm:w-auto bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="mb-6 grid gap-4 animate-slide-up sm:mb-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="group transition-all hover:shadow-lg hover:border-[#4ea8de]/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical (≤30 days)</CardTitle>
                <div className="rounded-full bg-destructive/10 p-2 transition-transform group-hover:scale-110">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alerts.filter((a) => a.severity === "critical").length}</div>
                <div className="mt-2 h-1 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-destructive transition-all" style={{ width: "100%" }} />
                </div>
              </CardContent>
            </Card>
            <Card className="group transition-all hover:shadow-lg hover:border-[#4ea8de]/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warning (31-60 days)</CardTitle>
                <div className="rounded-full bg-amber-500/10 p-2 transition-transform group-hover:scale-110">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alerts.filter((a) => a.severity === "warning").length}</div>
                <div className="mt-2 h-1 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: "75%" }} />
                </div>
              </CardContent>
            </Card>
            <Card className="group transition-all hover:shadow-lg hover:border-[#4ea8de]/50 sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Info (61-90 days)</CardTitle>
                <div className="rounded-full bg-[#4ea8de]/10 p-2 transition-transform group-hover:scale-110">
                  <Bell className="h-4 w-4 text-[#4ea8de]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alerts.filter((a) => a.severity === "info").length}</div>
                <div className="mt-2 h-1 w-full rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#4ea8de] transition-all" style={{ width: "50%" }} />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in overflow-hidden">
            <CardHeader>
              <CardTitle>Expiring Licenses</CardTitle>
              <CardDescription>Licenses that require attention within the next 90 days</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="rounded-full bg-[#4ea8de]/10 p-4 mb-4">
                    <Bell className="h-12 w-12 text-[#4ea8de]" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">No alerts</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">All licenses are valid for more than 90 days</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">Provider</TableHead>
                        <TableHead className="font-semibold">License Number</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Type</TableHead>
                        <TableHead className="font-semibold">Expiration</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Days Left</TableHead>
                        <TableHead className="font-semibold">Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.licenseId} className="transition-colors hover:bg-muted/30">
                          <TableCell>
                            <div>
                              <p className="font-medium">{alert.provider?.profiles?.full_name || "—"}</p>
                              <p className="text-xs text-muted-foreground">{alert.provider?.npi}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{alert.licenseNumber}</TableCell>
                          <TableCell className="hidden sm:table-cell">{alert.licenseType}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(alert.expirationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <AlertCircle
                                className={`h-4 w-4 ${
                                  alert.severity === "critical"
                                    ? "text-destructive"
                                    : alert.severity === "warning"
                                      ? "text-amber-500"
                                      : "text-[#4ea8de]"
                                }`}
                              />
                              <span className="text-sm">{alert.daysUntilExpiration} days</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getSeverityColor(alert.severity)} className="font-medium">
                              {alert.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
