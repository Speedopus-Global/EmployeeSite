import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EmployeesTab from "@/components/admin/EmployeesTab"
import NotificationBell from "@/components/admin/NotificationBell"
import Logo from "@/components/Logo"
import AttendanceTab from "@/components/admin/AttendanceTab"
import LeaveTab from "@/components/admin/LeaveTab"

function StatCard({ label, value, accent = false }) {
  return (
    <Card
      className={`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        accent ? "border-brand/30 bg-brand/[0.03]" : ""
      }`}
    >
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-3xl font-semibold ${accent ? "text-brand" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [attendanceToday, setAttendanceToday] = useState([])
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("employees")
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const seenEmployeeIds = useRef(new Set())
  const seenLeaveIds = useRef(new Set())
  const isFirstLoad = useRef(true)

  const fetchAll = useCallback(async () => {
    try {
      const [empRes, attRes, leaveRes] = await Promise.all([
        api.get("/employees"),
        api.get("/attendance/all"),
        api.get("/leaves"),
      ])
      setEmployees(empRes.data)
      setAttendanceToday(attRes.data)
      setLeaves(leaveRes.data)

      const pendingEmp = empRes.data.filter((e) => e.status === "pending")
      const pendingLeaves = leaveRes.data.filter((leave) => leave.status === "pending")

      if (!isFirstLoad.current) {
        const newEmp = pendingEmp.filter((e) => !seenEmployeeIds.current.has(e._id))
        newEmp.forEach((e) => toast.info(`New registration: ${e.name}`))
        pendingLeaves
          .filter((leave) => !seenLeaveIds.current.has(leave._id))
          .forEach((leave) => toast.info(`New leave request from ${leave.employee?.name}`))
      }

      seenEmployeeIds.current = new Set(pendingEmp.map((e) => e._id))
      seenLeaveIds.current = new Set(pendingLeaves.map((leave) => leave._id))
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

  const totalEmployees = employees.length
  const pendingApprovals = employees.filter((e) => e.status === "pending").length
  const pendingLeaves = leaves.filter((leave) => leave.status === "pending").length

  const handleLeaveDecision = async (id, status, remarks) => {
    try {
      await api.put(`/leaves/${id}/decision`, { status, remarks })
      toast.success(`Leave request ${status}`)
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update leave request")
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div className="h-6 w-px bg-border" />
          <div>
            <p className="text-sm font-medium leading-none">Admin</p>
            <p className="mt-1 text-xs text-muted-foreground">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell employees={employees} leaves={leaves} onGoTo={setActiveTab} />
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Employees" value={totalEmployees} />
          <StatCard label="Pending Approvals" value={pendingApprovals} accent={pendingApprovals > 0} />
          <StatCard label="Today's Attendance" value={attendanceToday.length} />
          <StatCard label="Pending Leaves" value={pendingLeaves} accent={pendingLeaves > 0} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="h-11 rounded-full bg-muted p-1">
            <TabsTrigger
              value="employees"
              className="rounded-full transition-all duration-200 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Employees
            </TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-full transition-all duration-200 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-sm">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave" className="rounded-full transition-all duration-200 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-sm">
              Leave Requests
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

          <TabsContent value="attendance" className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
            <AttendanceTab
              attendance={attendanceToday}
              employees={employees}
              loading={loading}
            />
        </TabsContent>
        </Tabs>
        {activeTab === "leave" && (
          <LeaveTab leaves={leaves} loading={loading} onDecision={handleLeaveDecision} />
        )}
      </main>
    </div>
  )
}