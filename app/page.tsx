"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, FileCheck, Clock, Users, CheckCircle2, ArrowRight, Sparkles, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 w-full">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-[#0d173c] to-[#4ea8de] bg-clip-text text-transparent">
              CredentialFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-[#4ea8de]">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium transition-colors hover:text-[#4ea8de]">
              How It Works
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#0d173c] to-[#4ea8de] text-white hover:opacity-90 transition-all hover:scale-105 shadow-md"
              >
                Get Started
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-xl animate-fade-in">
            <nav className=" flex flex-col gap-4 py-4 px-4">
              <Link
                href="#features"
                className="text-sm font-medium transition-colors hover:text-[#4ea8de] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium transition-colors hover:text-[#4ea8de] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-[#0d173c] to-[#4ea8de] text-white hover:opacity-90 shadow-md"
                >
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative flex flex-col items-center gap-8 py-16 md:py-24 lg:py-32 text-center px-4 md:px-6 w-[100vw]">
        {/* Gradient background effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#4ea8de]/5 via-transparent to-transparent w-full" />
        <div className="absolute top-10 md:top-20 right-4 md:right-20 h-48 w-48 md:h-72 md:w-72 rounded-full bg-[#4ea8de]/10 blur-3xl -z-10 animate-pulse" />
        <div
          className="absolute bottom-10 md:bottom-20 left-4 md:left-20 h-48 w-48 md:h-72 md:w-72 rounded-full bg-[#0d173c]/10 blur-3xl -z-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="flex max-w-3xl flex-col items-center gap-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border bg-gradient-to-r from-[#4ea8de]/10 to-[#7bc4e8]/10 px-3 md:px-4 py-1.5 text-xs md:text-sm backdrop-blur-sm hover:scale-105 transition-transform">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-[#4ea8de]" />
            <span className="font-medium">Trusted by healthcare organizations</span>
          </div>
          <h1 className="text-balance text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight animate-slide-up">
            Streamline Healthcare Provider{" "}
            <span className="bg-gradient-to-r from-[#0d173c] via-[#1a2b5f] to-[#4ea8de] bg-clip-text text-transparent">
              Credentialing
            </span>
          </h1>
          <p
            className="text-pretty max-w-2xl text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed animate-slide-up px-4"
            style={{ animationDelay: "0.1s" }}
          >
            Automate license verification, document management, and compliance tracking. Keep your healthcare providers
            credentialed and compliant with ease.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-slide-up px-4"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-[#0d173c] to-[#4ea8de] text-white hover:opacity-90 transition-all hover:scale-105 shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full transition-all hover:scale-105 hover:border-[#4ea8de] hover:text-[#4ea8de] bg-transparent"
              >
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative w-full max-w-5xl animate-scale-in px-4" style={{ animationDelay: "0.3s" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#4ea8de]/20 to-[#7bc4e8]/20 blur-3xl -z-10" />
          <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-[#4ea8de]/20 bg-muted shadow-2xl hover:shadow-[#4ea8de]/20 transition-all hover:scale-[1.02]">
            <img
              src="/modern-healthcare-credentialing-dashboard-interfac.jpg"
              alt="CredentialFlow Dashboard"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="features" className="border-t bg-gradient-to-b from-muted/30 to-background py-16 md:py-24">
        <div className="px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4ea8de]/10 px-4 py-1.5 text-xs md:text-sm font-medium text-[#0d173c]">
              <CheckCircle2 className="h-4 w-4" />
              Complete Solution
            </div>
            <h2 className="text-balance text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
              Everything you need for credentialing
            </h2>
            <p className="text-pretty max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed px-4">
              Comprehensive tools to manage provider credentials, documents, and compliance in one place.
            </p>
          </div>
          <div className="mt-12 md:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="hover-lift border-[#4ea8de]/20 hover:border-[#4ea8de]/40 transition-all group">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20 group-hover:from-[#4ea8de]/30 group-hover:to-[#7bc4e8]/30 transition-all">
                  <FileCheck className="h-6 w-6 text-[#0d173c]" />
                </div>
                <h3 className="text-xl font-semibold">Document Management</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Securely store and organize licenses, certifications, and insurance documents with automatic
                  expiration tracking.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-[#4ea8de]/20 hover:border-[#4ea8de]/40 transition-all group">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20 group-hover:from-[#4ea8de]/30 group-hover:to-[#7bc4e8]/30 transition-all">
                  <Shield className="h-6 w-6 text-[#0d173c]" />
                </div>
                <h3 className="text-xl font-semibold">License Verification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Automated verification against state licensing boards to ensure all credentials are valid and
                  up-to-date.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-[#4ea8de]/20 hover:border-[#4ea8de]/40 transition-all group">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20 group-hover:from-[#4ea8de]/30 group-hover:to-[#7bc4e8]/30 transition-all">
                  <Clock className="h-6 w-6 text-[#0d173c]" />
                </div>
                <h3 className="text-xl font-semibold">Expiration Alerts</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get notified 90, 60, and 30 days before credentials expire so you never miss a renewal deadline.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-[#4ea8de]/20 hover:border-[#4ea8de]/40 transition-all group">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20 group-hover:from-[#4ea8de]/30 group-hover:to-[#7bc4e8]/30 transition-all">
                  <Users className="h-6 w-6 text-[#0d173c]" />
                </div>
                <h3 className="text-xl font-semibold">Provider Portal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Self-service portal for providers to upload documents, update information, and track their
                  credentialing status.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-[#4ea8de]/20 hover:border-[#4ea8de]/40 transition-all group">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20 group-hover:from-[#4ea8de]/30 group-hover:to-[#7bc4e8]/30 transition-all">
                  <CheckCircle2 className="h-6 w-6 text-[#0d173c]" />
                </div>
                <h3 className="text-xl font-semibold">Compliance Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time compliance dashboard showing credential status across your entire provider network.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift border-[#4ea8de]/20 hover:border-[#4ea8de]/40 transition-all group">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ea8de]/20 to-[#7bc4e8]/20 group-hover:from-[#4ea8de]/30 group-hover:to-[#7bc4e8]/30 transition-all">
                  <Shield className="h-6 w-6 text-[#0d173c]" />
                </div>
                <h3 className="text-xl font-semibold">Secure & HIPAA Compliant</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enterprise-grade security with encryption at rest and in transit. Fully HIPAA compliant
                  infrastructure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24">
        <div className=" px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-balance text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="text-pretty max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed px-4">
              Get started in minutes with our simple three-step process.
            </p>
          </div>
          <div className="mt-12 md:mt-16 grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d173c] to-[#1a2b5f] text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold">Add Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Invite providers to create accounts and enter their NPI, specialty, and contact information.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a2b5f] to-[#4ea8de] text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold">Upload Documents</h3>
              <p className="text-muted-foreground leading-relaxed">
                Providers upload licenses, certifications, and insurance documents through the secure portal.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4ea8de] to-[#7bc4e8] text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold">Stay Compliant</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automated verification and alerts keep everyone compliant. Review and approve documents from your admin
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d173c] via-[#1a2b5f] to-[#0d173c]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className=" relative flex flex-col items-center gap-8 text-center px-4 md:px-6">
          <h2 className="text-balance text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-white">
            Ready to streamline your credentialing?
          </h2>
          <p className="text-pretty max-w-2xl text-base md:text-lg text-white/80 leading-relaxed">
            Join healthcare organizations that trust CredentialFlow to keep their providers compliant.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full gap-2 bg-white text-[#0d173c] hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className=" flex flex-col items-center justify-between gap-6 sm:flex-row px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#0d173c] to-[#4ea8de]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">CredentialFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 CredentialFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
