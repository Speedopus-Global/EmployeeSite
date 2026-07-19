import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  hours: {
    label: "Hours",
    color: "#2400FF",
  },
}

function formatDuration(hours) {
  if (!hours || hours <= 0) return "—"
  const totalMinutes = Math.round(hours * 60)
  if (totalMinutes < 60) return `${totalMinutes}m`
  const wholeHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60
  return remainingMinutes > 0 ? `${wholeHours}h ${remainingMinutes}m` : `${wholeHours}h`
}

function formatTime(iso) {
  return iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
}

function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" })
}

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

export default function AttendanceTab() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/me")
        setRecords(res.data)
      } catch (err) {
        toast.error("Failed to load attendance history")
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  const stats = useMemo(() => {
    const totalDays = records.length
    const totalHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0)
    const avgHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0
    return {
      totalDays,
      totalHours: totalHours.toFixed(1),
      avgHours,
    }
  }, [records])

  // Chart wants ascending chronological order, most recent 14 days
  const chartData = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14)
      .map((r) => ({
        date: formatShortDate(r.date),
        hours: r.workingHours || 0,
      }))
  }, [records])

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [records]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Days Present" value={stats.totalDays} />
        <StatCard label="Total Hours Logged" value={`${stats.totalHours}h`} />
        <StatCard label="Average Hours / Day" value={`${stats.avgHours}h`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Hours</CardTitle>
          <CardDescription>Your logged hours over the last 14 working days</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No attendance data yet.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  width={30}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(36, 0, 255, 0.06)" }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedRecords.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No records yet.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
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
                  {sortedRecords.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>{formatShortDate(r.date)}</TableCell>
                      <TableCell>{formatTime(r.loginTime)}</TableCell>
                      <TableCell>{formatTime(r.logoutTime)}</TableCell>
                      <TableCell>{formatDuration(r.workingHours)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}