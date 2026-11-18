import { useState, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getAttendanceDurations } from "@/lib/attendance"
import AttendanceButton from "@/components/employee/AttendanceButton"
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
    label: "Work time",
    color: "#2400FF",
  },
  breaks: {
    label: "Break time",
    color: "#f59e0b",
  },
}

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

function formatAxisTick(hours) {
  if (hours === 0) return "0"
  if (hours < 1) return `${Math.round(hours * 60)}m`
  return `${hours}h`
}

function MetricCard({ label, value, subtext, accent = false }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-xs">
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 font-mono text-2xl font-semibold tracking-tight ${accent ? "text-brand" : "text-foreground"}`}>
          {value}
        </p>
        {subtext && <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  )
}

export default function AttendanceTab() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [liveAttendance, setLiveAttendance] = useState(null)

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await api.get("/attendance/me")
      setRecords(res.data)
    } catch {
      toast.error("Failed to load attendance history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const handleTimerUpdate = useCallback((times, record) => {
    setLiveAttendance({ times, record })
  }, [])

  const stats = useMemo(() => {
    const liveRecord = liveAttendance?.record
    const isLiveRecord = (record) =>
      Boolean(
        liveRecord &&
        ((liveRecord._id && record._id === liveRecord._id) ||
          (liveRecord.date && record.date === liveRecord.date))
      )
    const historicalRecords = records.filter((record) => !isLiveRecord(record))
    const totals = historicalRecords.reduce(
      (sum, record) => {
        const durations = getAttendanceDurations(record)
        return {
          workSeconds: sum.workSeconds + durations.workSeconds,
          breakSeconds: sum.breakSeconds + durations.breakSeconds,
        }
      },
      { workSeconds: 0, breakSeconds: 0 }
    )

    if (liveRecord) {
      totals.workSeconds += liveAttendance.times.workSeconds
      totals.breakSeconds += liveAttendance.times.totalBreakSeconds
    }

    const totalDays = historicalRecords.length + (liveRecord ? 1 : 0)
    const totalHours = totals.workSeconds / 3600
    const totalBreaks = totals.breakSeconds / 3600
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0
    return {
      totalDays,
      totalHoursLabel: formatDurationPrecise(totalHours),
      totalBreaksLabel: formatDurationPrecise(totalBreaks),
      avgHoursLabel: formatDurationPrecise(avgHours),
    }
  }, [records, liveAttendance])

  // Chart wants ascending chronological order, most recent 14 days
  const chartData = useMemo(() => {
    const liveRecordId = liveAttendance?.record?._id
    const liveRecordDate = liveAttendance?.record?.date
    const isLiveRecord = (record) =>
      Boolean(
        liveAttendance?.record &&
        (record._id === liveRecordId || record.date === liveRecordDate)
      )
    const chartRecords = [...records]
    if (liveAttendance?.record && !chartRecords.some(isLiveRecord)) {
      chartRecords.push(liveAttendance.record)
    }

    return chartRecords
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14)
      .map((r) => ({
        date: formatShortDate(r.date),
        hours: isLiveRecord(r)
          ? liveAttendance.times.workSeconds / 3600
          : getAttendanceDurations(r).workSeconds / 3600,
        breaks: isLiveRecord(r)
          ? liveAttendance.times.totalBreakSeconds / 3600
          : getAttendanceDurations(r).breakSeconds / 3600,
      }))
  }, [records, liveAttendance])

  const sortedRecords = useMemo(() => {
    const liveRecordId = liveAttendance?.record?._id
    return [...records]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((record) =>
        record._id === liveRecordId
          ? { ...record, ...liveAttendance.record, ...liveAttendance.times }
          : record
      )
  }, [records, liveAttendance])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Skeleton className="h-24 w-full" />
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
      {/* Live Shift Tracker Bar */}
      <AttendanceButton
        onAttendanceUpdate={fetchAttendance}
        onTimerUpdate={handleTimerUpdate}
      />

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Days Present" value={stats.totalDays} subtext="Total recorded shifts" />
        <MetricCard label="Total Work Time" value={stats.totalHoursLabel} accent subtext="All completed shifts" />
        <MetricCard label="Total Breaks" value={stats.totalBreaksLabel} subtext="Tracked pause intervals" />
        <MetricCard label="Average / Shift" value={stats.avgHoursLabel} subtext="Productive work time" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Daily work and break time</CardTitle>
              <CardDescription>Compare productive work time with break time for each day</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground" aria-label="Chart legend">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#2400FF]" aria-hidden="true" />
                Work time
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" aria-hidden="true" />
                Break time
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              No attendance data recorded yet.
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
                      formatter={(value, name) => [
                        formatDurationPrecise(value),
                        name === "breaks" ? "Break time" : "Work time",
                      ]}
                    />
                  }
                />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="breaks" fill="var(--color-breaks)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance & Breaks Log</CardTitle>
          <CardDescription>Detailed history of daily work shifts and break durations</CardDescription>
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
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Work Time</TableHead>
                    <TableHead>Break Duration</TableHead>
                    <TableHead className="text-right">Daily Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRecords.map((r) => {
                        const durations = (
                          r._id === liveAttendance?.record?._id ||
                          r.date === liveAttendance?.record?.date
                        )
                          ? {
                              workSeconds: liveAttendance.times.workSeconds,
                              breakSeconds: liveAttendance.times.totalBreakSeconds,
                            }
                          : getAttendanceDurations(r)
                      return (
                      <TableRow key={r._id}>
                      <TableCell className="font-medium">{formatShortDate(r.date)}</TableCell>
                      <TableCell>{formatTime(r.loginTime)}</TableCell>
                      <TableCell>{formatTime(r.logoutTime)}</TableCell>
                      <TableCell className="font-mono font-semibold text-brand">
                        {formatDuration(durations.workSeconds / 3600)}
                      </TableCell>
                      <TableCell>
                        {durations.breakSeconds > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                            {formatDuration(durations.breakSeconds / 3600)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-foreground">
                        {formatDuration((durations.workSeconds + durations.breakSeconds) / 3600)}
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
