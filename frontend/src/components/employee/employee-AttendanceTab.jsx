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
    label: "Duration",
    color: "#2400FF",
  },
}

// Precise formatter — drops down to minutes, then seconds, for short durations
function formatDurationPrecise(hours) {
  if (!hours || hours <= 0) return "0s"

  const totalSeconds = Math.round(hours * 3600)

  if (totalSeconds < 60) {
    return `${totalSeconds}s`
  }

  const totalMinutes = Math.round(hours * 60)

  if (totalMinutes < 60) {
    const seconds = totalSeconds % 60
    return seconds > 0 ? `${totalMinutes}m ${seconds}s` : `${totalMinutes}m`
  }

  const wholeHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = totalMinutes % 60
  return remainingMinutes > 0 ? `${wholeHours}h ${remainingMinutes}m` : `${wholeHours}h`
}

// Simpler formatter for table rows — minutes/hours only, no seconds clutter
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

// Y-axis tick formatter — keeps axis labels compact (e.g. "1h", "30m")
function formatAxisTick(hours) {
  if (hours === 0) return "0"
  if (hours < 1) return `${Math.round(hours * 60)}m`
  return `${hours}h`
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
  const [today, setToday] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const [historyRes, todayRes] = await Promise.all([
          api.get("/attendance/me"),
          api.get("/attendance/today"),
        ])
        setRecords(historyRes.data)
        setToday(todayRes.data)
      } catch (err) {
        toast.error("Failed to load attendance history")
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])


  function LiveSessionCard({ loginTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!loginTime) return
    const tick = () => {
      setElapsed(Math.floor((Date.now() - new Date(loginTime).getTime()) / 1000))
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [loginTime])

  if (!loginTime) return null

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const display = h > 0
    ? `${h}h ${m}m ${s}s`
    : m > 0
    ? `${m}m ${s}s`
    : `${s}s`

  return (
    <Card className="border-brand/30 bg-brand/[0.03]">
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-muted-foreground">Current Session</p>
          <p className="text-2xl font-semibold text-brand">{display}</p>
        </div>
        <div className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-brand" />
      </CardContent>
    </Card>
  )
}

  const stats = useMemo(() => {
    const totalDays = records.length
    const totalHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0)
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0
    return {
      totalDays,
      totalHoursLabel: formatDurationPrecise(totalHours),
      avgHoursLabel: formatDurationPrecise(avgHours),
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
        {today?.loginTime && !today?.logoutTime && (
        <LiveSessionCard loginTime={today.loginTime} />
        )}
        <StatCard label="Days Present" value={stats.totalDays} />
        <StatCard label="Total Time Logged" value={stats.totalHoursLabel} />
        <StatCard label="Average / Day" value={stats.avgHoursLabel} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Hours</CardTitle>
          <CardDescription>Your logged time over the last 14 working days</CardDescription>
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
                  width={36}
                  tickFormatter={formatAxisTick}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(36, 0, 255, 0.06)" }}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => [formatDurationPrecise(value), "Duration"]}
                    />
                  }
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