"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, AlertCircle, CheckCircle, Eye, Award, MapPin, Calendar, User, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface License {
  id: string
  provider_id: string
  license_number: string
  license_type: string
  issuing_state: string
  expiration_date: string
  status: string
  verification_status: string
  providers?: {
    npi: string
    specialty: string
    profiles?: {
      full_name: string
      email: string
    }
  }
}

interface LicensesTableProps {
  licenses: License[]
}

export function LicensesTable({ licenses }: LicensesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const filteredLicenses = licenses.filter(
    (license) =>
      license.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.license_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.issuing_state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "badge-success"
      case "expired":
        return "badge-danger"
      case "suspended":
        return "badge-warning"
      case "revoked":
        return "badge-danger"
      default:
        return "outline"
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "verified":
        return "badge-success"
      case "pending":
        return "badge-warning"
      case "failed":
        return "badge-danger"
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

  const handleVerify = async (licenseId: string) => {
    setIsVerifying(licenseId)
    try {
      const response = await fetch("/api/licenses/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to verify license")
      }

      toast({
        title: "License Verified",
        description: "The license has been successfully verified.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Verify error:", error)
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify license",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(null)
    }
  }

  const handleRevert = async (licenseId: string) => {
    setIsVerifying(licenseId)
    try {
      const response = await fetch("/api/licenses/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to revert license")
      }

      toast({
        title: "License Reverted",
        description: "The license verification has been reset to pending.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Revert error:", error)
      toast({
        title: "Revert Failed",
        description: error instanceof Error ? error.message : "Failed to revert license",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(null)
    }
  }

  const handleViewDetails = (license: License) => {
    setSelectedLicense(license)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search licenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 transition-all focus:border-[#4ea8de]"
          />
        </div>
      </div>
      <div className="rounded-lg border border-[#4ea8de]/20 overflow-hidden">
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
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No licenses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLicenses.map((license) => {
                  const daysUntilExpiration = getDaysUntilExpiration(license.expiration_date)
                  const isExpiringSoon = daysUntilExpiration <= 90 && daysUntilExpiration > 0

                  return (
                    <TableRow key={license.id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium">{license.license_number}</TableCell>
                      <TableCell className="hidden sm:table-cell">{license.license_type}</TableCell>
                      <TableCell className="hidden md:table-cell">{license.issuing_state}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{new Date(license.expiration_date).toLocaleDateString()}</span>
                          {isExpiringSoon && <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />}
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(license)}
                            className="transition-all hover:scale-105 hover:text-[#4ea8de]"
                          >
                            <Eye className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          {license.verification_status === "pending" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleVerify(license.id)}
                              disabled={isVerifying === license.id}
                              className="transition-all hover:scale-105 bg-gradient-to-r from-[#0D173C] to-[#4ea8de]"
                            >
                              <CheckCircle className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Verify</span>
                            </Button>
                          )}
                          {license.verification_status === "verified" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevert(license.id)}
                              disabled={isVerifying === license.id}
                              className="transition-all hover:scale-105 hover:border-[#4ea8de] hover:text-[#4ea8de]"
                            >
                              <AlertCircle className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Revert</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">License Details</DialogTitle>
                <DialogDescription className="text-base">
                  Complete license and verification information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedLicense && (
            <div className="space-y-6 pt-4">
              {/* License Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                      <Award className="h-5 w-5 text-[#0d173c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">License Number</Label>
                      <p className="font-semibold text-base font-mono">{selectedLicense.license_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-400/20">
                      <Award className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">License Type</Label>
                      <p className="font-semibold text-base">{selectedLicense.license_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-red-400/20">
                      <MapPin className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Issuing State</Label>
                      <p className="font-semibold text-base">{selectedLicense.issuing_state}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-400/20">
                      <Calendar className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Expiration Date</Label>
                      <p className="font-semibold text-base">
                        {new Date(selectedLicense.expiration_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getDaysUntilExpiration(selectedLicense.expiration_date) > 0
                          ? `${getDaysUntilExpiration(selectedLicense.expiration_date)} days remaining`
                          : "Expired"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Status & Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20">
                      <Shield className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">License Status</Label>
                      <Badge variant={getStatusColor(selectedLicense.status)} className="font-medium mt-1">
                        {selectedLicense.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-400/20">
                      <CheckCircle className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Verification Status</Label>
                      <Badge
                        variant={getVerificationColor(selectedLicense.verification_status)}
                        className="font-medium mt-1"
                      >
                        {selectedLicense.verification_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              {selectedLicense.providers && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Provider Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                        <User className="h-5 w-5 text-[#0d173c]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">Provider Name</Label>
                        <p className="font-semibold text-base">
                          {selectedLicense.providers.profiles?.full_name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-400/20">
                        <Award className="h-5 w-5 text-purple-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">NPI / Specialty</Label>
                        <p className="font-semibold text-base">{selectedLicense.providers.npi}</p>
                        <p className="text-sm text-muted-foreground">{selectedLicense.providers.specialty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Expiration Warning */}
              {getDaysUntilExpiration(selectedLicense.expiration_date) <= 90 &&
                getDaysUntilExpiration(selectedLicense.expiration_date) > 0 && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Expiration Alert</p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                          This license expires in {getDaysUntilExpiration(selectedLicense.expiration_date)} days. Please
                          ensure renewal is in progress.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Actions */}
              {selectedLicense.verification_status !== "verified" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleVerify(selectedLicense.id)}
                    disabled={isVerifying === selectedLicense.id}
                    className="bg-gradient-to-r from-[#0D173C] to-[#4ea8de] hover:opacity-90 transition-opacity"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isVerifying === selectedLicense.id ? "Verifying..." : "Verify License"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
