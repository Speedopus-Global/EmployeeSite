import { useState, useEffect } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Camera, Mail, Phone, Lock, X } from "lucide-react"

export default function ProfileTab() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [address, setAddress] = useState("")
  const [picture, setPicture] = useState(null)
  const [preview, setPreview] = useState(null)
  const [markedForRemoval, setMarkedForRemoval] = useState(false)
  const { refreshUser } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile/me")
        setProfile(res.data)
        setAddress(res.data.address || "")
      } catch (err) {
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handlePictureChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPicture(file)
    setPreview(URL.createObjectURL(file))
    setMarkedForRemoval(false)
  }

  const handleRemovePicture = () => {
    setPicture(null)
    setPreview(null)
    setMarkedForRemoval(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("address", address)
    if (markedForRemoval) {
      formData.append("removePicture", "true")
    } else if (picture) {
      formData.append("profilePicture", picture)
    }

    setSaving(true)
    try {
      const res = await api.put("/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setProfile(res.data.user)
      setPicture(null)
      setPreview(null)
      setMarkedForRemoval(false)
      await refreshUser() // keeps sidebar avatar/name in sync immediately
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const initials = (profile?.name || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const avatarSrc = preview || (markedForRemoval ? null : profile?.profilePicture)
  const hasPhoto = Boolean(avatarSrc)

  return (
    <div className="space-y-6">
      {/* Header card with avatar */}
      <Card className="overflow-hidden">
        <div className="h-20 bg-[#0a0a12]" />
        <CardContent className="relative pb-6 pt-0">
          <div className="-mt-10 flex items-end gap-4">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-muted shadow-sm">
                {hasPhoto ? (
                  <img src={avatarSrc} alt={profile?.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand/10 text-lg font-semibold text-brand">
                    {initials || "U"}
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-brand text-white shadow-sm transition-transform hover:scale-105">
                <Camera className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handlePictureChange}
                />
              </label>
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-lg font-semibold leading-tight">{profile?.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-normal capitalize">
                  {profile?.role}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-brand/10 text-xs font-normal capitalize text-brand"
                >
                  {profile?.status}
                </Badge>
              </div>
            </div>
            {hasPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-1 gap-1.5 text-muted-foreground hover:text-destructive"
                onClick={handleRemovePicture}
              >
                <X className="h-3.5 w-3.5" />
                Remove photo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Locked info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
          <CardDescription>These details are managed by your administrator and can't be changed here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{profile?.email}</p>
              </div>
            </div>
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{profile?.phone || "Not set"}</p>
              </div>
            </div>
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Editable info */}
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-base">Personal Details</CardTitle>
            <CardDescription>Update your address and profile picture anytime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your current address"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="bg-brand hover:bg-brand/90" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}