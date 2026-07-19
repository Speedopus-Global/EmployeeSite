import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Logo from "@/components/Logo"
import {
  ShieldCheck,
  Clock,
  FileCheck2,
  Eye,
  EyeOff,
} from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = await login(email, password)

      toast.success("Logged in successfully")

      if (user.role === "employee" && !user.isProfileComplete) {
        navigate("/complete-profile")
      } else {
        navigate(user.role === "admin" ? "/admin" : "/employee")
      }
    } catch (err) {
      const data = err.response?.data

      if (data?.needsVerification) {
        toast.error("Please verify your email first")
        navigate(`/verify-email?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(data?.message || "Login failed")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Logo size={32} showText={false} />
          <div className="h-6 w-px bg-border" />
          <div>
            <p className="text-sm font-semibold leading-none">SpeedOpus Global</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Employee Site</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="hidden w-1/2 flex-col justify-between border-r bg-slate-950 px-14 py-16 lg:flex">
          <div>
            <Logo size={40} showText={false} />
          </div>

          <div className="space-y-6">
            <h2 className="max-w-md text-3xl font-semibold leading-tight text-white">
              One platform for your entire workflow.
            </h2>

            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Track attendance, submit drawings for review, and stay in sync
              with the team—all from a single, secure workspace.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                </div>
                Secure, role-based access
              </div>

              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Clock className="h-4 w-4 text-brand" />
                </div>
                Real-time attendance tracking
              </div>

              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <FileCheck2 className="h-4 w-4 text-brand" />
                </div>
                Streamlined drawing approvals
              </div>
            </div>
          </div>

          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} SpeedOpus Global. All rights reserved.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col items-center text-center lg:hidden">
              <Logo size={48} showText={false} />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                SpeedOpus Global
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Employee Login
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@speedopus.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-brand hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">
                New to SpeedOpus
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/register">Create an employee account</Link>
            </Button>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              By signing in, you agree to SpeedOpus Global's internal usage
              policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}