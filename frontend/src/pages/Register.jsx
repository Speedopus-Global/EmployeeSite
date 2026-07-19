import { useState , useRef} from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Logo from "@/components/Logo"
import { Users, ClipboardCheck, Mail, Eye, EyeOff } from "lucide-react"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const logoRef = useRef(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success("Registered! Awaiting admin approval.")
      navigate("/login")
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const rotateY = ((x - rect.width / 2) / rect.width) * 20
  const rotateX = ((rect.height / 2 - y) / rect.height) * 20

  if (logoRef.current) {
    logoRef.current.style.transform = `
      perspective(700px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(15px)
      scale(1.08)
    `
  }
}

const handleMouseLeave = () => {
  if (logoRef.current) {
    logoRef.current.style.transform =
      "perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)"
  }
}

  return (
    <div className="flex min-h-screen  bg-muted/30">

      <div className="flex flex-1">
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0a0a12] px-14 py-16 lg:flex">
          <div className="group flex items-center gap-5 cursor-pointer select-none">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="flex items-center justify-center"
          >
            <div
              ref={logoRef}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl transition-all duration-200 ease-out will-change-transform"
            >
              <Logo size={90} showText={false} />
            </div>
          </div>

          <div className="transition-all duration-500 group-hover:translate-x-2">
            <h1 className="text-6xl font-extrabold tracking-tight text-white transition-all duration-500 group-hover:text-brand">
              SpeedOpus
            </h1>

            <div className="flex items-center gap-3">
              <div className="h-[2px] w-16 rounded-full bg-brand transition-all duration-500 group-hover:w-28" />

              <p className="text-lg font-medium uppercase tracking-[0.25em] text-white/70">
                GLOBAL
              </p>
            </div>

            <p className="mt-2 text-base text-white/50">
              Employee Portal
            </p>
          </div>
        </div>

          <div className="relative space-y-6">
            <h2 className="max-w-md text-3xl font-semibold leading-tight text-white">
              Join the team. Start your journey with SpeedOpus.
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Create your employee account to track attendance, submit work for review, and
              stay connected with the rest of the team.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Users className="h-4 w-4 text-brand" />
                </div>
                Quick, admin-approved onboarding
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Mail className="h-4 w-4 text-brand" />
                </div>
                Secure email verification
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <ClipboardCheck className="h-4 w-4 text-brand" />
                </div>
                Guided profile setup on first login
              </div>
            </div>
          </div>

          <p className="relative text-xs text-white/30">
            &copy; {new Date().getFullYear()} SpeedOpus Global. All rights reserved.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm rounded-3xl border bg-background p-8 shadow-xl">
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <div className="rounded-full p-5 shadow-xl ring-1 ring-slate-500">
                <Logo size={70} showText={false} />
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create your account
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Join the SpeedOpus team
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="you@speedopus.com" value={form.email} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} minLength={6} placeholder="At least 6 characters" value={form.password} onChange={handleChange} className="pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} className="pr-10" required />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand hover:bg-brand/90" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">Already registered</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/login">Sign in instead</Link>
            </Button>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Your account will need admin approval and email verification before you can log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}