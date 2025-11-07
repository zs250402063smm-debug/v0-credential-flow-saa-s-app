"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Award, MapPin } from "lucide-react"

interface ProviderProfileProps {
  provider: any
  profile: any
}

export function ProviderProfile({ provider, profile }: ProviderProfileProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="group transition-all hover:shadow-lg hover:border-[#4ea8de]/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2 transition-transform group-hover:scale-110">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
            <p className="font-medium text-lg">{profile.full_name || "—"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email</Label>
            <p className="font-medium">{profile.email}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Account Type</Label>
            <Badge variant="secondary" className="font-medium">
              {profile.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="group transition-all hover:shadow-lg hover:border-[#4ea8de]/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2 transition-transform group-hover:scale-110">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Provider Information</CardTitle>
              <CardDescription>Your professional details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">NPI Number</Label>
            <p className="font-medium text-lg">{provider.npi}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Specialty</Label>
            <p className="font-medium">{provider.specialty}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</Label>
            <p className="font-medium">{provider.phone || "—"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
            <Badge className="font-medium">{provider.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {(provider.address || provider.city || provider.state) && (
        <Card className="md:col-span-2 group transition-all hover:shadow-lg hover:border-[#4ea8de]/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-[#0D173C] to-[#4ea8de] p-2 transition-transform group-hover:scale-110">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Address</CardTitle>
                <CardDescription>Your practice location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {provider.address && <p className="font-medium">{provider.address}</p>}
              {(provider.city || provider.state || provider.zip) && (
                <p className="text-muted-foreground">
                  {provider.city}
                  {provider.city && provider.state && ", "}
                  {provider.state} {provider.zip}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
