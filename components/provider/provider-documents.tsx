"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, Download, FileText } from "lucide-react"
import Link from "next/link"

interface ProviderDocumentsProps {
  documents: any[]
  providerId: string
}

export function ProviderDocuments({ documents, providerId }: ProviderDocumentsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default"
      case "pending":
        return "secondary"
      case "rejected":
        return "destructive"
      case "expired":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card className="border-[#4ea8de]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Upload and manage your credentials and certifications</CardDescription>
          </div>
          <Link href="/provider/upload">
            <Button className="bg-gradient-to-r from-[#0d173c] to-[#1a2b5f] text-white hover:opacity-90 transition-all hover:scale-105">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20">
              <FileText className="h-8 w-8 text-[#0d173c]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No documents yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Upload your first document to get started</p>
            <Link href="/provider/upload">
              <Button className="bg-gradient-to-r from-[#0d173c] to-[#1a2b5f] text-white hover:opacity-90 transition-all hover:scale-105">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-[#4ea8de]/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">File Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Uploaded</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium">{doc.file_name}</TableCell>
                    <TableCell className="capitalize">{doc.document_type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(doc.status)} className="font-medium">
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="transition-all hover:scale-105 hover:text-[#4ea8de]">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
