"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Building2, Send, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

type CompanyLink = {
  id: string
  provider_id: string
  company_id: string
  status: string
  requested_at: string
  company: {
    id: string
    name: string
    enrollment_code: string
  }
}

export function JoinCompany({
  providerId,
  existingLinks: initialLinks,
}: {
  providerId: string
  existingLinks: CompanyLink[]
}) {
  const [enrollmentCode, setEnrollmentCode] = useState("")
  const [requestNote, setRequestNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [links, setLinks] = useState(initialLinks)

  const handleJoinCompany = async () => {
    if (!enrollmentCode.trim()) {
      toast.error("Please enter an enrollment code")
      return
    }

    if (enrollmentCode.length !== 8) {
      toast.error("Enrollment code must be 8 characters")
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Submitting join request with note:", {
        enrollmentCode: enrollmentCode.toUpperCase(),
        providerId,
        hasNote: !!requestNote.trim(),
      })

      const response = await fetch("/api/companies/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentCode: enrollmentCode.toUpperCase(),
          providerId,
          requestNote: requestNote.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || "Failed to join company"
        throw new Error(errorMessage)
      }

      setLinks([...links, data])
      setEnrollmentCode("")
      setRequestNote("")
      toast.success("Join request sent successfully! Waiting for admin approval.")
    } catch (error: any) {
      toast.error(error.message || "Failed to join company")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="badge-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="badge-warning">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="badge-danger">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Join Company</h1>
            <p className="text-muted-foreground">Request access to a company using an enrollment code</p>
          </div>
        </div>
        <Link href="/provider">
          <Button variant="outline" size="sm" className="transition-all hover:scale-105 bg-transparent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="p-6 md:p-8 space-y-6 hover-lift">
        <div className="space-y-2">
          <Label htmlFor="enrollment-code">Enrollment Code</Label>
          <Input
            id="enrollment-code"
            placeholder="Enter 8-character code"
            value={enrollmentCode}
            onChange={(e) => setEnrollmentCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="font-mono text-lg tracking-wider"
          />
          <p className="text-sm text-muted-foreground">Ask your company admin for the enrollment code</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="request-note">Request Note (Optional)</Label>
          <Textarea
            id="request-note"
            placeholder="Add an optional message to the admin (e.g., your credentials, experience, or reason for joining)"
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            maxLength={500}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            {requestNote.length}/500 characters - This note will be visible to the admin
          </p>
        </div>

        <Button
          onClick={handleJoinCompany}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#0d173c] to-[#4ea8de] text-white hover:opacity-90"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Sending Request..." : "Request Access"}
        </Button>
      </Card>

      <Card className="p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold">Your Companies</h2>
        {links.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">You haven't joined any companies yet</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover-lift"
              >
                <div className="space-y-1">
                  <p className="font-medium">{link.company.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested {new Date(link.requested_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(link.status)}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
