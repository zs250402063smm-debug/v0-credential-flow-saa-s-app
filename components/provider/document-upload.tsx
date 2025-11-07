"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Upload, ArrowLeft, FileText, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DocumentUploadProps {
  providerId: string
}

type Company = {
  id: string
  name: string
}

export function DocumentUpload({ providerId }: DocumentUploadProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [approvedCompanies, setApprovedCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  useEffect(() => {
    const fetchApprovedCompanies = async () => {
      const supabase = createClient()
      try {
        const { data: links, error } = await supabase
          .from("provider_company_links")
          .select("company_id, companies(id, name)")
          .eq("provider_id", providerId)
          .eq("status", "approved")

        if (error) throw error

        const companies =
          links
            ?.map((link: any) => ({
              id: link.companies.id,
              name: link.companies.name,
            }))
            .filter((c): c is Company => c.id && c.name) || []

        setApprovedCompanies(companies)
        if (companies.length === 1) {
          setSelectedCompanyId(companies[0].id)
        }
      } catch (error) {
        console.error("[v0] Error fetching companies:", error)
        toast({
          title: "Error",
          description: "Failed to load your companies",
          variant: "destructive",
        })
      } finally {
        setLoadingCompanies(false)
      }
    }

    fetchApprovedCompanies()
  }, [providerId, toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      setFile(droppedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCompanyId) {
      toast({
        title: "Company Required",
        description: "Please select a company for this document",
        variant: "destructive",
      })
      return
    }

    if (!file || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please select a file and document type",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from("documents").insert({
        provider_id: providerId,
        company_id: selectedCompanyId,
        document_type: documentType,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
      })

      if (dbError) throw dbError

      toast({
        title: "Upload Successful",
        description: "Your document has been uploaded and is pending review.",
      })

      router.push("/provider")
    } catch (error: unknown) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!loadingCompanies && approvedCompanies.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-[#0D173C]/5">
        <header className="border-b border-[#4ea8de]/20 bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/provider" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-1.5">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold sm:text-xl">CredentialFlow</span>
            </Link>
            <Link href="/provider">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <Card className="w-full max-w-2xl animate-fade-in shadow-lg border-[#4ea8de]/20">
            <CardHeader>
              <CardTitle>No Company Access</CardTitle>
              <CardDescription>You need to be approved by a company before you can upload documents.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/provider/join-company">
                <Button className="w-full bg-gradient-to-r from-[#0D173C] to-[#4ea8de] text-white">
                  Request Company Access
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-[#0D173C]/5">
      <header className="border-b border-[#4ea8de]/20 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/provider" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-1.5">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold sm:text-xl">CredentialFlow</span>
          </Link>
          <Link href="/provider">
            <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
              <ArrowLeft className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl animate-fade-in shadow-lg border-[#4ea8de]/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Upload Document</CardTitle>
                <CardDescription>Upload a credential, certification, or insurance document</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                  required
                  disabled={loadingCompanies}
                >
                  <SelectTrigger className="transition-all focus:border-[#4ea8de]">
                    <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select company"} />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select which company this document is for</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType} required>
                  <SelectTrigger className="transition-all focus:border-[#4ea8de]">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
                    dragActive
                      ? "border-[#4ea8de] bg-[#4ea8de]/5"
                      : "border-muted-foreground/25 hover:border-[#4ea8de]/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium mb-1">
                      {dragActive ? "Drop file here" : "Drag and drop or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
                {file && (
                  <div className="flex items-center gap-3 rounded-lg border border-[#4ea8de]/30 bg-[#4ea8de]/5 p-3 animate-fade-in">
                    <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#0D173C] to-[#4ea8de] transition-all hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </Button>
                <Link href="/provider" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all hover:scale-105 bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
