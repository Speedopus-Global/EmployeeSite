import { toast } from "sonner"
import api from "@/lib/axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"

function statusVariant(status) {
  if (status === "active") return "default"
  if (status === "rejected" || status === "deactivated") return "destructive"
  return "secondary"
}

function formatTime(iso) {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
}

export default function EmployeesTab({ employees, attendanceToday, loading, onRefresh }) {
  const todayStr = new Date().toISOString().split("T")[0]

  const getTodayAttendance = (employeeId) =>
    attendanceToday.find(
      (a) => a.employee?._id === employeeId && a.date === todayStr
    )

  const handleAction = async (id, action) => {
    try {
      await api.put(`/employees/${id}/${action}`)
      toast.success(`Employee ${action}d`)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed")
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Employee Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : employees.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No employees yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Today's Login</TableHead>
                <TableHead>Today's Logout</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const att = getTodayAttendance(emp._id)
                return (
                  <TableRow key={emp._id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(emp.status)}>{emp.status}</Badge>
                    </TableCell>
                    <TableCell>{formatTime(att?.loginTime)}</TableCell>
                    <TableCell>{formatTime(att?.logoutTime)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {emp.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => handleAction(emp._id, "approve")}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(emp._id, "reject")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {emp.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(emp._id, "deactivate")}
                        >
                          Deactivate
                        </Button>
                      )}
                      {emp.status === "deactivated" && (
                        <Button size="sm" onClick={() => handleAction(emp._id, "activate")}>
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}