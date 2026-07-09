import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import EmployeesTab from "@/components/admin/EmployeesTab"
import DrawingsTab from "@/components/admin/DrawingsTab"

function StatCard({ label, value }) {
  return (
    <Card>
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
    } catch (err) {
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
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
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">CWADMS Admin</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Employees" value={totalEmployees} />
          <StatCard label="Pending Approvals" value={pendingApprovals} />
          <StatCard label="Today's Uploads" value={todaysUploads} />
          <StatCard label="Pending Drawing Approvals" value={pendingDrawings} />
        </div>

        <Tabs defaultValue="employees">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="drawings">Drawings</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <EmployeesTab
              employees={employees}
              attendanceToday={attendanceToday}
              loading={loading}
              onRefresh={fetchAll}
            />
          </TabsContent>

          <TabsContent value="drawings">
            <DrawingsTab drawings={drawings} loading={loading} onRefresh={fetchAll} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}