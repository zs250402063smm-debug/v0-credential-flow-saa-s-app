"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Search,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Provider {
  id: string
  npi: string
  specialty: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  status: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

interface ProvidersTableProps {
  providers: Provider[]
}

export function ProvidersTable({ providers }: ProvidersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const { toast } = useToast()

  const filteredProviders = providers.filter(
    (provider) =>
      provider.npi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
    }
  }

  const handleApprove = async () => {
    if (!selectedProvider) return

    setIsApproving(true)
    try {
      const response = await fetch("/api/providers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: selectedProvider.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve provider")
      }

      toast({
        title: "Provider Approved",
        description: "The provider has been successfully approved and activated.",
      })

      setShowDetailsDialog(false)
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error approving provider:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve provider",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!selectedProvider) return

    setIsRejecting(true)
    try {
      const response = await fetch("/api/providers/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: selectedProvider.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject provider")
      }

      toast({
        title: "Provider Rejected",
        description: "The provider has been rejected and marked as inactive.",
        variant: "destructive",
      })

      setShowDetailsDialog(false)
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error rejecting provider:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject provider",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider)
    setShowDetailsDialog(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, NPI, or specialty..."
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
                <TableHead className="font-semibold">Provider</TableHead>
                <TableHead className="font-semibold">NPI</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Specialty</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Phone</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProviders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No providers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProviders.map((provider) => (
                  <TableRow key={provider.id} className="transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{provider.profiles?.full_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{provider.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{provider.npi}</TableCell>
                    <TableCell className="hidden sm:table-cell">{provider.specialty}</TableCell>
                    <TableCell className="hidden md:table-cell">{provider.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(provider.status)}>{provider.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {new Date(provider.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(provider)}
                        className="transition-all hover:scale-105 hover:text-[#4ea8de]"
                      >
                        <Settings className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Take Action</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{selectedProvider?.profiles?.full_name || "Provider"}</DialogTitle>
                <DialogDescription className="text-base">
                  Complete provider information and credentials
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-6 pt-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                      <User className="h-5 w-5 text-[#0d173c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <p className="font-semibold text-base truncate">{selectedProvider.profiles?.full_name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                      <Mail className="h-5 w-5 text-[#0d173c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      <p className="font-semibold text-base truncate">{selectedProvider.profiles?.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                      <Phone className="h-5 w-5 text-[#0d173c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Phone Number</Label>
                      <p className="font-semibold text-base">{selectedProvider.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                      <Calendar className="h-5 w-5 text-[#0d173c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Member Since</Label>
                      <p className="font-semibold text-base">
                        {new Date(selectedProvider.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Professional Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-400/20">
                      <Award className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">NPI Number</Label>
                      <p className="font-semibold text-base font-mono">{selectedProvider.npi}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-400/20">
                      <Award className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Specialty</Label>
                      <p className="font-semibold text-base">{selectedProvider.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20">
                      <Shield className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Account Status</Label>
                      <Badge className={getStatusColor(selectedProvider.status)} className="font-medium mt-1">
                        {selectedProvider.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {(selectedProvider.address || selectedProvider.city || selectedProvider.state) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Practice Location
                  </h3>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-red-400/20">
                      <MapPin className="h-5 w-5 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Full Address</Label>
                      <div className="font-semibold text-base space-y-1 mt-1">
                        {selectedProvider.address && <p>{selectedProvider.address}</p>}
                        {(selectedProvider.city || selectedProvider.state || selectedProvider.zip) && (
                          <p>
                            {selectedProvider.city}
                            {selectedProvider.city && selectedProvider.state && ", "}
                            {selectedProvider.state} {selectedProvider.zip}
                          </p>
                        )}
                        {!selectedProvider.address && !selectedProvider.city && (
                          <p className="text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin Actions
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting || selectedProvider.status === "active"}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transition-all hover:scale-105"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isApproving ? "Approving..." : "Approve Provider"}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isApproving || isRejecting || selectedProvider.status === "inactive"}
                    variant="destructive"
                    className="flex-1 transition-all hover:scale-105"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isRejecting ? "Rejecting..." : "Reject Provider"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Current Status: <span className="font-semibold">{selectedProvider.status}</span>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
