import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import Logo from "@/components/Logo"
import { ArrowRight, Check, Sparkles } from "lucide-react"

const STEPS = ["welcome", "profile", "done"]

const QUOTES = {
  welcome: "Every great build starts with a single, well-placed line.",
  profile: "The details you add today are the foundation of tomorrow's work.",
  done: "You're all set. Let's make something great together.",
}

function StepDots({ current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => (
        <div
          key={step}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? "w-8 bg-brand" : i < current ? "w-1.5 bg-brand/40" : "w-1.5 bg-muted"
          }`}
        />
      ))}
    </div>
  )
}

export default function CompleteProfile() {
  const [stepIndex, setStepIndex] = useState(0)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [picture, setPicture] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const step = STEPS[stepIndex]

  const handlePictureChange = (e) => {
    const file = e.target.files[0]
    setPicture(file)
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!phone) return toast.error("Phone number is required")

    const formData = new FormData()
    formData.append("phone", phone)
    formData.append("address", address)
    if (picture) formData.append("profilePicture", picture)

    setSubmitting(true)
    try {
      await api.post("/profile/complete", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      await refreshUser()
      setStepIndex(2) // move to "done" step
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile")
    } finally {
      setSubmitting(false)
    }
  }

  const goToDashboard = () => {
    navigate("/employee")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size={44} showText={false} />
        </div>

        <StepDots current={stepIndex} />

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {/* STEP 1 — Welcome */}
            {step === "welcome" && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <Sparkles className="h-6 w-6 text-brand" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand">Step 1 of 3</p>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome to SpeedOpus, {user?.name?.split(" ")[0]}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    We're glad to have you on the team. Let's get your account set up.
                  </p>
                </div>
                <blockquote className="rounded-lg border-l-2 border-brand bg-brand/[0.04] px-4 py-3 text-left text-sm italic text-muted-foreground">
                  "{QUOTES.welcome}"
                </blockquote>
                <Button className="w-full bg-brand hover:bg-brand/90" onClick={() => setStepIndex(1)}>
                  Let's get started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* STEP 2 — Profile form */}
            {step === "profile" && (
              <form
                onSubmit={handleSaveProfile}
                className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 space-y-5"
              >
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium text-brand">Step 2 of 3</p>
                  <h1 className="text-xl font-semibold tracking-tight">Complete your profile</h1>
                  <p className="text-sm text-muted-foreground">Just a couple of details to finish setup</p>
                </div>

                <blockquote className="rounded-lg border-l-2 border-brand bg-brand/[0.04] px-4 py-3 text-sm italic text-muted-foreground">
                  "{QUOTES.profile}"
                </blockquote>

                <div className="flex flex-col items-center gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-brand/20 bg-muted">
                    {preview ? (
                      <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No photo
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handlePictureChange}
                    className="max-w-xs cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address (optional)</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Your current address"
                  />
                </div>

                <Button type="submit" className="w-full bg-brand hover:bg-brand/90" disabled={submitting}>
                  {submitting ? "Saving..." : "Continue"}
                  {!submitting && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Button>
              </form>
            )}

            {/* STEP 3 — Done */}
            {step === "done" && (
              <div className="animate-in fade-in-0 zoom-in-95 duration-300 space-y-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-brand">Step 3 of 3</p>
                  <h1 className="text-2xl font-semibold tracking-tight">You're all set, {user?.name?.split(" ")[0]}</h1>
                  <p className="text-sm text-muted-foreground">
                    Your profile is complete and your account is ready to go.
                  </p>
                </div>
                <blockquote className="rounded-lg border-l-2 border-brand bg-brand/[0.04] px-4 py-3 text-left text-sm italic text-muted-foreground">
                  "{QUOTES.done}"
                </blockquote>
                <Button className="w-full bg-brand hover:bg-brand/90" onClick={goToDashboard}>
                  Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}