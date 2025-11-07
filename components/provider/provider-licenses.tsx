"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, AlertCircle, Award } from "lucide-react"
import Link from "next/link"

interface ProviderLicensesProps {
  licenses: any[]
  providerId: string
}

export function ProviderLicenses({ licenses, providerId }: ProviderLicensesProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "expired":
        return "destructive"
      case "suspended":
        return "outline"
      case "revoked":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expiration = new Date(expirationDate)
    const today = new Date()
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Licenses</CardTitle>
            <CardDescription>Track your professional licenses and their expiration dates</CardDescription>
          </div>
          <Link href="/provider/add-license">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-[#0D173C] to-[#4ea8de] text-white hover:opacity-90 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              Add License
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {licenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="rounded-full bg-[#4ea8de]/10 p-4 mb-4">
              <Award className="h-12 w-12 text-[#4ea8de]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No licenses yet</h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-sm">
              Add your first license to get started with credential tracking
            </p>
            <Link href="/provider/add-license">
              <Button className="bg-gradient-to-r from-[#0D173C] to-[#4ea8de] text-white hover:opacity-90 transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add License
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">License Number</TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">Type</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">State</TableHead>
                  <TableHead className="font-semibold">Expiration</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Status</TableHead>
                  <TableHead className="font-semibold">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses.map((license) => {
                  const daysUntilExpiration = getDaysUntilExpiration(license.expiration_date)
                  const isExpiringSoon = daysUntilExpiration <= 90 && daysUntilExpiration > 0

                  return (
                    <TableRow key={license.id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium">{license.license_number}</TableCell>
                      <TableCell className="hidden sm:table-cell">{license.license_type}</TableCell>
                      <TableCell className="hidden md:table-cell">{license.issuing_state}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{new Date(license.expiration_date).toLocaleDateString()}</span>
                            {isExpiringSoon && <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />}
                          </div>
                          {isExpiringSoon && (
                            <p className="text-xs text-amber-600 font-medium">Expires in {daysUntilExpiration} days</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant={getStatusColor(license.status)} className="font-medium">
                          {license.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getVerificationColor(license.verification_status)} className="font-medium">
                          {license.verification_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
