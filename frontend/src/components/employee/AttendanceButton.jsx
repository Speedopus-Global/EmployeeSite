import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { getAttendanceDurations } from "@/lib/attendance"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Play,
  Pause,
  LogOut,
  Clock,
  CheckCircle2,
  Coffee,
  Timer,
  AlertCircle,
  CalendarDays,
} from "lucide-react"

/**
 * Calculates current active work time and break time in seconds.
 * Properly isolates active time from break intervals.
 */
function computeTimes(record) {
  if (!record?.loginTime) {
    return { workSeconds: 0, currentBreakSeconds: 0, totalBreakSeconds: 0 }
  }

  const { workSeconds, breakSeconds } = getAttendanceDurations(record)

  return {
    workSeconds,
    currentBreakSeconds: record.isPaused ? breakSeconds : 0,
    totalBreakSeconds: breakSeconds,
  }
}

/**
 * Formats seconds into standard digital clock format (HH:MM:SS)
 */
function formatDigital(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) totalSeconds = 0
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

/**
 * Formats seconds into human-readable compact duration (e.g. "4h 15m")
 */
function formatHuman(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0m"
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/**
 * Enterprise Shift Tracker & Attendance Control Bar
 */
export default function AttendanceButton({ onAttendanceUpdate, onTimerUpdate }) {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [times, setTimes] = useState({ workSeconds: 0, currentBreakSeconds: 0, totalBreakSeconds: 0 })

  const fetchToday = useCallback(async () => {
    try {
      const res = await api.get("/attendance/today")
      setRecord(res.data)
      onAttendanceUpdate?.(res.data)
    } catch {
      toast.error("Could not load today's attendance")
    } finally {
      setLoading(false)
    }
  }, [onAttendanceUpdate])

  useEffect(() => {
    fetchToday()
  }, [fetchToday])

  useEffect(() => {
    const refreshAtDateBoundary = () => {
      fetchToday()
    }

    const interval = setInterval(refreshAtDateBoundary, 30000)
    return () => clearInterval(interval)
  }, [fetchToday])

  // The timer is derived from timestamps on every tick so it remains correct
  // after tab throttling, delayed renders, and pause/resume transitions.
  useEffect(() => {
    if (!record?.loginTime || record?.logoutTime) {
      const nextTimes = computeTimes(record)
      setTimes(nextTimes)
      onTimerUpdate?.(nextTimes, record)
      return
    }

    const tick = () => {
      const nextTimes = computeTimes(record)
      setTimes(nextTimes)
      onTimerUpdate?.(nextTimes, record)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [record, onTimerUpdate])

  const handleStartShift = async () => {
    setSubmitting(true)
    try {
      const res = await api.post("/attendance/login")
      setRecord(res.data)
      onAttendanceUpdate?.(res.data)
      toast.success("Shift started — have a productive day!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start shift")
    } finally {
      setSubmitting(false)
    }
  }

  const handleTakeBreak = async () => {
    setSubmitting(true)
    try {
      const res = await api.post("/attendance/pause")
      setRecord(res.data)
      onAttendanceUpdate?.(res.data)
      toast.info("Break started — enjoy your break!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to pause shift")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResumeWork = async () => {
    setSubmitting(true)
    try {
      const res = await api.post("/attendance/resume")
      setRecord(res.data)
      onAttendanceUpdate?.(res.data)
      toast.success("Shift resumed — welcome back!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resume shift")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmLogout = async () => {
    setSubmitting(true)
    try {
      const res = await api.post("/attendance/logout")
      setRecord(res.data)
      onAttendanceUpdate?.(res.data)
      setShowLogoutConfirm(false)
      toast.success("Shift ended successfully. See you next time!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end shift")
    } finally {
      setSubmitting(false)
    }
  }

  const formatClockTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"
  const todayLabel = new Intl.DateTimeFormat([], {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  if (loading) {
    return <Skeleton className="h-20 w-full rounded-2xl" />
  }

  const isDone = Boolean(record?.logoutTime)
  const isWorking = Boolean(record?.loginTime && !record?.logoutTime && !record?.isPaused)
  const isPaused = Boolean(record?.loginTime && !record?.logoutTime && record?.isPaused)
  const isNotStarted = !record?.loginTime

  return (
    <>
      <div className="w-full rounded-2xl border bg-card p-4 shadow-xs transition-all duration-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Status Badge & Time Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 border-r pr-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Today
                </p>
                <p className="text-sm font-semibold leading-tight">{todayLabel}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {record?.loginTime
                    ? `Clocked in ${formatClockTime(record.loginTime)}`
                    : "Clock in for today"}
                </p>
              </div>
            </div>

            {/* Status indicator pill */}
            <div className="flex items-center gap-2">
              {isNotStarted && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Shift Not Started
                </span>
              )}

              {isWorking && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Active Working
                </span>
              )}

              {isPaused && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                  </span>
                  On Break (Paused)
                </span>
              )}

              {isDone && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/20 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Shift Completed
                </span>
              )}
            </div>

            {/* Timers & Counters (shown when shift started) */}
            {!isNotStarted && (
              <div className="flex items-center gap-5 divide-x divide-border text-sm">

                {/* Active Work Time */}
                <div className="flex items-center gap-2">
                  <Timer className={`h-4 w-4 ${isWorking ? "text-brand" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Work Time
                    </p>
                    <p className="font-mono text-base font-semibold tracking-tight text-foreground">
                      {formatDigital(times.workSeconds)}
                    </p>
                  </div>
                </div>

                {/* Break Time */}
                <div className="flex items-center gap-2 pl-5">
                  <Coffee className={`h-4 w-4 ${isPaused ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Break Time
                    </p>
                    <p className={`font-mono text-base font-semibold tracking-tight ${isPaused ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                      {formatDigital(times.totalBreakSeconds)}
                    </p>
                  </div>
                </div>

                {/* Clock In / Out Times */}
                <div className="hidden pl-5 md:block">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Clock In
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {formatClockTime(record.loginTime)}
                    {record.logoutTime && ` → ${formatClockTime(record.logoutTime)}`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {isNotStarted && (
              <Button
                onClick={handleStartShift}
                disabled={submitting}
                className="bg-brand text-white shadow-xs hover:bg-brand/90 font-medium"
              >
                <Play className="mr-1.5 h-4 w-4 fill-current" />
                {submitting ? "Clocking In..." : "Clock In"}
              </Button>
            )}

            {isWorking && (
              <>
                <Button
                  variant="outline"
                  onClick={handleTakeBreak}
                  disabled={submitting}
                  className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-400"
                >
                  <Pause className="mr-1.5 h-3.5 w-3.5" />
                  {submitting ? "Pausing..." : "Take Break"}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={submitting}
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Clock Out
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={handleResumeWork}
                  disabled={submitting}
                  className="border border-emerald-500/30 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 font-medium shadow-xs"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                  {submitting ? "Resuming..." : "Resume Work"}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setShowLogoutConfirm(true)}
                  disabled={submitting}
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Clock Out
                </Button>
              </>
            )}

            {isDone && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {formatHuman(times.workSeconds)} worked today
                </span>
                <Button disabled variant="outline" size="sm" className="opacity-80">
                  Completed
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clock Out Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5" />
            </div>
            <DialogTitle>Clock out for the day?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end your shift? Once clocked out, your attendance record for today will be finalized and cannot be reopened.
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 rounded-xl border bg-muted/40 p-3.5 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clock In:</span>
              <span className="font-medium">{formatClockTime(record?.loginTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Work:</span>
              <span className="font-mono font-semibold text-brand">{formatHuman(times.workSeconds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Breaks:</span>
              <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                {formatHuman(times.totalBreakSeconds)}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={submitting}
              onClick={handleConfirmLogout}
            >
              {submitting ? "Clocking Out..." : "Confirm & Clock Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
