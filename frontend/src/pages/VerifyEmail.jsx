import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [otp, setOtp] = useState(searchParams.get("otp") || "")
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await api.post("/auth/verify-otp", { email, otp })
      toast.success(res.data.message || "Email verified")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email first")
      return
    }
    setResending(true)
    try {
      const res = await api.post("/auth/resend-otp", { email })
      toast.success(res.data.message || "New OTP sent")
      setCooldown(60) // 60s cooldown before allowing another resend
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend OTP")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>Enter the OTP sent to your email address</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={resending || cooldown > 0}
              onClick={handleResend}
            >
              {resending
                ? "Sending..."
                : cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : "Resend OTP"}
            </Button>

            <p className="text-sm text-muted-foreground">
              <Link to="/login" className="text-primary underline">Back to login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}