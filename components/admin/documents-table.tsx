"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Download, Check, X, Eye, FileText, User, Calendar, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  provider_id: string
  document_type: string
  file_name: string
  file_path: string
  status: string
  uploaded_at: string
  providers?: {
    npi: string
    specialty: string
    profiles?: {
      full_name: string
      email: string
    }
  }
}

interface DocumentsTableProps {
  documents: Document[]
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectNotes, setRejectNotes] = useState("")
  const [documentToReject, setDocumentToReject] = useState<string | null>(null)

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "badge-success"
      case "pending":
        return "badge-warning"
      case "rejected":
        return "badge-danger"
      case "expired":
        return "badge-info"
      default:
        return "outline"
    }
  }

  const handleApprove = async (documentId: string) => {
    setIsLoading(documentId)
    try {
      const response = await fetch("/api/documents/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to approve document")
      }

      toast({
        title: "Document Approved",
        description: "The document has been successfully approved.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Approve error:", error)
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleRejectClick = (documentId: string) => {
    setDocumentToReject(documentId)
    setRejectNotes("")
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = async () => {
    if (!documentToReject) return

    setIsLoading(documentToReject)
    try {
      const response = await fetch("/api/documents/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: documentToReject, notes: rejectNotes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reject document")
      }

      toast({
        title: "Document Rejected",
        description: "The document has been rejected.",
      })

      setShowRejectDialog(false)
      setDocumentToReject(null)
      setRejectNotes("")
      router.refresh()
    } catch (error) {
      console.error("[v0] Reject error:", error)
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from("documents").download(filePath)

    if (data) {
      const url = URL.createObjectURL(data)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const handleViewDetails = (doc: Document) => {
    setSelectedDocument(doc)
    setShowDetailsDialog(true)
  }

  const handleRevert = async (documentId: string) => {
    setIsLoading(documentId)
    try {
      const response = await fetch("/api/documents/revert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to revert document")
      }

      toast({
        title: "Document Reverted",
        description: "The document status has been reset to pending.",
      })

      router.refresh()
    } catch (error) {
      console.error("[v0] Revert error:", error)
      toast({
        title: "Revert Failed",
        description: error instanceof Error ? error.message : "Failed to revert document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
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
                <TableHead className="font-semibold">File Name</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Uploaded</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium max-w-[200px] truncate">{doc.file_name}</TableCell>
                    <TableCell className="capitalize hidden sm:table-cell">{doc.document_type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(doc.status)} className="font-medium">
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(doc)}
                          className="transition-all hover:scale-105 hover:text-[#4ea8de]"
                        >
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.file_path, doc.file_name)}
                          className="transition-all hover:scale-105 hover:text-[#4ea8de]"
                        >
                          <Download className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        {doc.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(doc.id)}
                              disabled={isLoading === doc.id}
                              className="transition-all hover:scale-105 bg-gradient-to-r from-[#0D173C] to-[#4ea8de]"
                            >
                              <Check className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Approve</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectClick(doc.id)}
                              disabled={isLoading === doc.id}
                              className="transition-all hover:scale-105 bg-red-600 hover:bg-red-700 text-white"
                            >
                              <X className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Reject</span>
                            </Button>
                          </>
                        )}
                        {(doc.status === "approved" || doc.status === "rejected") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevert(doc.id)}
                            disabled={isLoading === doc.id}
                            className="transition-all hover:scale-105 hover:border-[#4ea8de] hover:text-[#4ea8de]"
                          >
                            <AlertCircle className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Revert</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="space-y-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D173C] to-[#4ea8de]">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Document Details</DialogTitle>
                <DialogDescription className="text-base">Complete information about this document</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6 pt-4">
              {/* Document Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Document Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
                      <FileText className="h-5 w-5 text-[#0d173c]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">File Name</Label>
                      <p className="font-semibold text-base truncate">{selectedDocument.file_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-400/20">
                      <FileText className="h-5 w-5 text-purple-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Document Type</Label>
                      <p className="font-semibold text-base capitalize">{selectedDocument.document_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-400/20">
                      <AlertCircle className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <Badge variant={getStatusColor(selectedDocument.status)} className="font-medium mt-1">
                        {selectedDocument.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10 hover:border-[#4ea8de]/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-400/20">
                      <Calendar className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label className="text-xs text-muted-foreground">Uploaded At</Label>
                      <p className="font-semibold text-base">
                        {new Date(selectedDocument.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              {selectedDocument.providers && (
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
                          {selectedDocument.providers.profiles?.full_name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-[#4ea8de]/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-red-400/20">
                        <FileText className="h-5 w-5 text-orange-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label className="text-xs text-muted-foreground">NPI / Specialty</Label>
                        <p className="font-semibold text-base">{selectedDocument.providers.npi}</p>
                        <p className="text-sm text-muted-foreground">{selectedDocument.providers.specialty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleDownload(selectedDocument.file_path, selectedDocument.file_name)}
                  className="bg-gradient-to-r from-[#0D173C] to-[#4ea8de] hover:opacity-90 transition-opacity"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this document (optional)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-notes">Rejection Notes</Label>
              <Textarea
                id="reject-notes"
                placeholder="Enter reason for rejection..."
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectConfirm} disabled={!!isLoading}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
