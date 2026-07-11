import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EmployeesTab from "@/components/admin/EmployeesTab"
import DrawingsTab from "@/components/admin/DrawingsTab"
import NotificationBell from "@/components/admin/NotificationBell"

function StatCard({ label, value }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [drawings, setDrawings] = useState([])
  const [attendanceToday, setAttendanceToday] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("employees")
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const seenEmployeeIds = useRef(new Set())
  const seenDrawingIds = useRef(new Set())
  const isFirstLoad = useRef(true)

  const fetchAll = useCallback(async () => {
    try {
      const [empRes, drawRes, attRes] = await Promise.all([
        api.get("/employees"),
        api.get("/drawings"),
        api.get("/attendance/all"),
      ])
      setEmployees(empRes.data)
      setDrawings(drawRes.data)
      setAttendanceToday(attRes.data)

      const pendingEmp = empRes.data.filter((e) => e.status === "pending")
      const pendingDraw = drawRes.data.filter((d) => d.status === "pending")

      if (!isFirstLoad.current) {
        const newEmp = pendingEmp.filter((e) => !seenEmployeeIds.current.has(e._id))
        const newDraw = pendingDraw.filter((d) => !seenDrawingIds.current.has(d._id))
        newEmp.forEach((e) => toast.info(`New registration: ${e.name}`))
        newDraw.forEach((d) => toast.info(`New drawing from ${d.employee?.name}: ${d.projectName}`))
      }

      seenEmployeeIds.current = new Set(pendingEmp.map((e) => e._id))
      seenDrawingIds.current = new Set(pendingDraw.map((d) => d._id))
      isFirstLoad.current = false
    } catch (err) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [fetchAll])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const todayStr = new Date().toISOString().split("T")[0]
  const totalEmployees = employees.length
  const pendingApprovals = employees.filter((e) => e.status === "pending").length
  const todaysUploads = drawings.filter(
    (d) => new Date(d.createdAt).toISOString().split("T")[0] === todayStr
  ).length
  const pendingDrawings = drawings.filter((d) => d.status === "pending").length

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold">SpeedOpus Admin</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell employees={employees} drawings={drawings} onGoTo={setActiveTab} />
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Employees" value={totalEmployees} />
          <StatCard label="Pending Approvals" value={pendingApprovals} />
          <StatCard label="Today's Uploads" value={todaysUploads} />
          <StatCard label="Pending Drawing Approvals" value={pendingDrawings} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="h-11 rounded-full bg-muted p-1">
            <TabsTrigger
              value="employees"
              className="rounded-full transition-all duration-200 data-[state=active]:shadow-sm"
            >
              Employees
            </TabsTrigger>
            <TabsTrigger
              value="drawings"
              className="rounded-full transition-all duration-200 data-[state=active]:shadow-sm"
            >
              Drawings
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="employees"
            className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            <EmployeesTab
              employees={employees}
              attendanceToday={attendanceToday}
              loading={loading}
              onRefresh={fetchAll}
            />
          </TabsContent>

          <TabsContent
            value="drawings"
            className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            <DrawingsTab drawings={drawings} loading={loading} onRefresh={fetchAll} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}