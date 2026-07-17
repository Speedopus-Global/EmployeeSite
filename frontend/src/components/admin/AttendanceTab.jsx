import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

function formatTime(iso) {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { dateStyle: "medium" })
}

function formatDuration(hours) {
  if (!hours || hours <= 0) return "—"

  const totalMinutes = Math.round(hours * 60)

  if (totalMinutes < 60) {
    return `${totalMinutes}m`
  }

  const wholeHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60

  return remainingMinutes > 0 ? `${wholeHours}h ${remainingMinutes}m` : `${wholeHours}h`
}

export default function AttendanceTab({ attendance, employees, loading }) {
  const [employeeFilter, setEmployeeFilter] = useState("all")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  const employeeList = employees.filter((e) => e.role !== "admin")

  const filtered = useMemo(() => {
    return attendance
      .filter((a) => (employeeFilter === "all" ? true : a.employee?._id === employeeFilter))
      .filter((a) => (fromDate ? a.date >= fromDate : true))
      .filter((a) => (toDate ? a.date <= toDate : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [attendance, employeeFilter, fromDate, toDate])

  const clearFilters = () => {
    setEmployeeFilter("all")
    setFromDate("")
    setToDate("")
  }

  // Per-employee history + stats for the drill-down dialog
  const employeeHistory = useMemo(() => {
    if (!selectedEmployee) return []
    return attendance
      .filter((a) => a.employee?._id === selectedEmployee._id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [attendance, selectedEmployee])

  const employeeStats = useMemo(() => {
    const totalDays = employeeHistory.length
    const totalHours = employeeHistory.reduce((sum, r) => sum + (r.workingHours || 0), 0)
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0
    return { totalDays, totalHours: totalHours.toFixed(1), avgHours }
  }, [employeeHistory])

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Attendance Tracker</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-44">
                    <SelectValue placeholder="All employees">
                    {employeeFilter === "all"
                        ? "All employees"
                        : employeeList.find((e) => e._id === employeeFilter)?.name || "All employees"}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    {employeeList.map((e) => (
                    <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
          {(employeeFilter !== "all" || fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No attendance records match these filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Logout</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow
                  key={a._id}
                  className="cursor-pointer"
                  onClick={() => setSelectedEmployee(a.employee)}
                >
                  <TableCell className="font-medium hover:text-brand">
                    {a.employee?.name || "—"}
                  </TableCell>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell>{formatTime(a.loginTime)}</TableCell>
                  <TableCell>{formatTime(a.logoutTime)}</TableCell>
                  <TableCell>{formatDuration(a.workingHours)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEmployee?.name}'s Attendance History</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Days Present</p>
              <p className="text-xl font-semibold">{employeeStats.totalDays}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Total Hours</p>
              <p className="text-xl font-semibold">{employeeStats.totalHours}h</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Avg Hours/Day</p>
              <p className="text-xl font-semibold">{employeeStats.avgHours}h</p>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Logout</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeHistory.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell>{formatDate(a.date)}</TableCell>
                    <TableCell>{formatTime(a.loginTime)}</TableCell>
                    <TableCell>{formatTime(a.logoutTime)}</TableCell>
                    <TableCell>{formatDuration(a.workingHours)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}