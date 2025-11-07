"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Building2, Copy, Check, UserCheck, UserX, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

type Company = {
  id: string
  name: string
  enrollment_code: string
  admin_id: string
  created_at: string
}

type PendingRequest = {
  id: string
  provider_id: string
  company_id: string
  status: string
  requested_at: string
  request_note: string | null
  provider: {
    id: string
    email: string
    full_name: string
  }
}

type ApprovedProvider = {
  id: string
  provider_id: string
  company_id: string
  status: string
  approved_at: string
  provider: {
    id: string
    email: string
    full_name: string
  }
}

export function CompanyManagement({
  company: initialCompany,
  pendingRequests: initialRequests,
  approvedProviders: initialApprovedProviders,
  adminId,
}: {
  company: Company | null
  pendingRequests: PendingRequest[]
  approvedProviders: ApprovedProvider[]
  adminId: string
}) {
  const [company, setCompany] = useState(initialCompany)
  const [companyName, setCompanyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(initialRequests)
  const [approvedProviders, setApprovedProviders] = useState(initialApprovedProviders)

  const handleCreateCompany = async () => {
    if (!companyName.trim()) {
      toast.error("Please enter a company name")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/companies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, adminId }),
      })

      if (!response.ok) throw new Error("Failed to create company")

      const newCompany = await response.json()
      setCompany(newCompany)
      toast.success("Company created successfully!")
    } catch (error) {
      toast.error("Failed to create company")
    } finally {
      setLoading(false)
    }
  }

  const copyEnrollmentCode = () => {
    if (company) {
      navigator.clipboard.writeText(company.enrollment_code)
      setCopied(true)
      toast.success("Enrollment code copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleApproveRequest = async (requestId: string, providerId: string) => {
    try {
      console.log("[v0] Approving request:", {
        requestId,
        providerId,
        companyId: company?.id,
        adminId,
      })

      const response = await fetch("/api/companies/approve-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, providerId, companyId: company?.id }),
      })

      if (!response.ok) throw new Error("Failed to approve request")

      const approvedLink = await response.json()

      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))
      setApprovedProviders((prev) => [
        ...prev,
        {
          ...approvedLink,
          provider: pendingRequests.find((req) => req.id === requestId)?.provider || {
            id: providerId,
            email: "",
            full_name: "",
          },
        },
      ])
      toast.success("Provider request approved!")
    } catch (error) {
      console.error("[v0] Error approving request:", error)
      toast.error("Failed to approve request")
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      console.log("[v0] Rejecting request:", { requestId, adminId })

      const response = await fetch("/api/companies/reject-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      })

      if (!response.ok) throw new Error("Failed to reject request")

      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId))
      toast.success("Provider request rejected")
    } catch (error) {
      console.error("[v0] Error rejecting request:", error)
      toast.error("Failed to reject request")
    }
  }

  const handleRemoveProvider = async (linkId: string, providerName: string) => {
    if (
      !confirm(
        `Are you sure you want to remove ${providerName} from your company? They will need to request access again.`,
      )
    ) {
      return
    }

    try {
      console.log("[v0] Removing provider:", { linkId, adminId })

      const response = await fetch("/api/companies/remove-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId }),
      })

      if (!response.ok) throw new Error("Failed to remove provider")

      setApprovedProviders((prev) => prev.filter((provider) => provider.id !== linkId))
      toast.success("Provider removed successfully")
    } catch (error) {
      console.error("[v0] Error removing provider:", error)
      toast.error("Failed to remove provider")
    }
  }

  if (!company) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Company Setup</h1>
            <p className="text-muted-foreground">Create your company to get started</p>
          </div>
        </div>

        <Card className="p-6 md:p-8 space-y-6 hover-lift">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              placeholder="Enter your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="text-base"
            />
          </div>
          <Button
            onClick={handleCreateCompany}
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0d173c] to-[#4ea8de] text-white hover:opacity-90"
          >
            {loading ? "Creating..." : "Create Company"}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <Link href="/admin">
        <Button variant="ghost" className="mb-4 transition-all hover:scale-105 hover:bg-muted">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Company Management</h1>
          <p className="text-muted-foreground">Manage your company and provider access</p>
        </div>
      </div>

      {/* Company Info Card */}
      <Card className="p-6 md:p-8 space-y-6 hover-lift">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <p className="text-sm text-muted-foreground">Created {new Date(company.created_at).toLocaleDateString()}</p>
          </div>
          <Badge
            variant="outline"
            className="w-fit bg-gradient-to-r from-[#0d173c]/10 to-[#4ea8de]/10 border-[#4ea8de]/30"
          >
            Active
          </Badge>
        </div>

        <div className="space-y-2">
          <Label>Enrollment Code</Label>
          <div className="flex gap-2">
            <Input value={company.enrollment_code} readOnly className="font-mono text-lg tracking-wider bg-muted" />
            <Button onClick={copyEnrollmentCode} variant="outline" size="icon" className="shrink-0 bg-transparent">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with providers to allow them to request access to your company
          </p>
        </div>
      </Card>

      {/* Approved Providers */}
      <Card className="p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold">Approved Providers</h2>
        {approvedProviders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No approved providers yet</p>
        ) : (
          <div className="space-y-4">
            {approvedProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover-lift"
              >
                <div className="space-y-1">
                  <p className="font-medium">{provider.provider.full_name || "Unknown Provider"}</p>
                  <p className="text-sm text-muted-foreground">{provider.provider.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Approved {new Date(provider.approved_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveProvider(provider.id, provider.provider.full_name || "this provider")}
                  size="sm"
                  variant="destructive"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pending Requests */}
      <Card className="p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold">Pending Access Requests</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex flex-col gap-4 p-4 rounded-lg border bg-card hover-lift">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{request.provider.full_name || "Unknown Provider"}</p>
                    <p className="text-sm text-muted-foreground">{request.provider.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Requested {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                    {request.request_note && (
                      <div className="mt-3 p-3 rounded-md bg-muted/50 border border-muted">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Request Note:</p>
                        <p className="text-sm">{request.request_note}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleApproveRequest(request.id, request.provider_id)}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:opacity-90"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleRejectRequest(request.id)} size="sm" variant="destructive">
                      <UserX className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
