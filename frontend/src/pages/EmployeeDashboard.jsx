import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import Logo from "@/components/Logo"
import DashboardTab from "@/components/employee/DashboardTab"
import AttendanceTab from "@/components/employee/employee-AttendanceTab"
import ProfileTab from "@/components/employee/ProfileTab"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Clock, UserRound, LogOut, Menu, X } from "lucide-react"

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "attendance", label: "My Attendance", icon: Clock },
  { id: "profile", label: "Profile", icon: UserRound },
]

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const initials = (user?.name || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <Logo size={32} showText={false} />
        <div>
          <p className="text-sm font-semibold leading-none">SpeedOpus</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Employee</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id)
              setMobileNavOpen(false)
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-brand text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="border-t px-3 py-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
            {initials || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none">{user?.name}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-background shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <Logo size={28} showText={false} />
            <span className="text-sm font-semibold">SpeedOpus</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {activeTab === "dashboard" && "Overview of your drawings and activity"}
              {activeTab === "attendance" && "Your logged hours and attendance history"}
              {activeTab === "profile" && "Manage your personal information"}
            </p>
          </div>

          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "attendance" && <AttendanceTab />}
          {activeTab === "profile" && <ProfileTab />}
        </main>
      </div>
    </div>
  )
}