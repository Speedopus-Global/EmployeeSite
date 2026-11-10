import { useCallback, useEffect, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, FileCheck2, XCircle } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const LEAVE_TYPES = ["annual", "sick", "personal", "emergency", "other"]

function getStatusVariant(status) {
  if (status === "approved") return "default"
  if (status === "rejected") return "destructive"
  return "secondary"
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  return end >= start ? Math.floor((end - start) / 86400000) + 1 : 0
}

function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function toDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatInputDate(value) {
  const date = parseDate(value)
  return date
    ? date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : ""
}

function getCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - firstDay.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function DateRangeCalendar({ form, activeField, onSelect, onClose }) {
  const selectedDate = parseDate(form[activeField])
  const [monthDate, setMonthDate] = useState(
    () => selectedDate || parseDate(form.startDate) || new Date()
  )
  const calendarRef = useRef(null)
  const days = getCalendarDays(monthDate)
  const startDate = parseDate(form.startDate)
  const endDate = parseDate(form.endDate)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!calendarRef.current?.contains(event.target)) onClose()
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [onClose])

  const moveMonth = (amount) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  return (
    <div
      ref={calendarRef}
      className="absolute left-0 top-full z-20 mt-2 w-full min-w-[19rem] rounded-2xl border bg-background p-4 shadow-lg sm:w-[21rem]"
      role="dialog"
      aria-label="Choose leave dates"
    >
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => moveMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-lg font-semibold">
          {monthDate.toLocaleDateString([], { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => moveMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day} className="py-1">{day}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
        {days.map((date) => {
          const value = toDateValue(date)
          const isCurrentMonth = date.getMonth() === monthDate.getMonth()
          const isStart = value === form.startDate
          const isEnd = value === form.endDate
          const isInRange = startDate && endDate && date >= startDate && date <= endDate
          const isActive = isStart || isEnd

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              className={`relative flex h-10 items-center justify-center text-sm transition-colors ${
                isInRange ? "bg-brand/15" : ""
              } ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`}
              aria-label={date.toLocaleDateString()}
              aria-pressed={isActive}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-brand font-semibold text-white"
                    : isCurrentMonth
                      ? "text-foreground hover:bg-muted"
                      : "text-muted-foreground/50"
                }`}
              >
                {date.getDate()}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>{activeField === "startDate" ? "Select the first day" : "Select the last day"}</span>
        <button
          type="button"
          className="font-medium text-brand hover:underline"
          onClick={() => {
            onSelect(toDateValue(new Date()))
            setMonthDate(new Date())
          }}
        >
          Today
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="flex items-center gap-3 border-r px-4 py-1 last:border-r-0">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-lg font-semibold leading-none">{value}</p>
      </div>
    </div>
  )
}

function LeaveForm({ onCreated }) {
  const [form, setForm] = useState({
    leaveType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [activeField, setActiveField] = useState("startDate")
  const duration = getDuration(form.startDate, form.endDate)

  const openCalendar = (field) => {
    setActiveField(field)
    setCalendarOpen(true)
  }

  const handleDateSelect = (value) => {
    if (activeField === "startDate") {
      setForm({ ...form, startDate: value, endDate: "" })
      setActiveField("endDate")
      return
    }

    if (form.startDate && value < form.startDate) {
      setForm({ ...form, startDate: value, endDate: form.startDate })
    } else {
      setForm({ ...form, endDate: value })
      setCalendarOpen(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!duration) {
      toast.error("Choose a valid date range")
      return
    }

    setSubmitting(true)
    try {
      await api.post("/leaves", form)
      setForm({ leaveType: "annual", startDate: "", endDate: "", reason: "" })
      toast.success("Leave request submitted")
      onCreated()
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit leave request")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="overflow-visible border-border/80 shadow-sm">
      <CardHeader className="border-b px-7 py-6">
        <div>
          <CardTitle className="text-lg">New leave request</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the dates and add a short note for your manager.
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-7 pb-7 pt-7">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
            <div className="space-y-2">
            <Label htmlFor="leaveType">Leave type</Label>
            <select
              id="leaveType"
              value={form.leaveType}
              onChange={(event) => setForm({ ...form, leaveType: event.target.value })}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            >
              {LEAVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type[0].toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative space-y-2">
              <Label htmlFor="startDate">From</Label>
              <button
                id="startDate"
                type="button"
                onClick={() => openCalendar("startDate")}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm outline-none transition-colors hover:border-brand focus:border-ring focus:ring-2 focus:ring-ring/20"
                aria-haspopup="dialog"
                aria-expanded={calendarOpen && activeField === "startDate"}
              >
                <span className={form.startDate ? "text-foreground" : "text-muted-foreground"}>
                  {formatInputDate(form.startDate) || "Select date"}
                </span>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </button>
              {calendarOpen && activeField === "startDate" && (
                <DateRangeCalendar
                  form={form}
                  activeField={activeField}
                  onSelect={handleDateSelect}
                  onClose={() => setCalendarOpen(false)}
                />
              )}
            </div>
            <div className="relative space-y-2">
              <Label htmlFor="endDate">To</Label>
              <button
                id="endDate"
                type="button"
                onClick={() => openCalendar("endDate")}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm outline-none transition-colors hover:border-brand focus:border-ring focus:ring-2 focus:ring-ring/20"
                aria-haspopup="dialog"
                aria-expanded={calendarOpen && activeField === "endDate"}
              >
                <span className={form.endDate ? "text-foreground" : "text-muted-foreground"}>
                  {formatInputDate(form.endDate) || "Select date"}
                </span>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </button>
              {calendarOpen && activeField === "endDate" && (
                <DateRangeCalendar
                  form={form}
                  activeField={activeField}
                  onSelect={handleDateSelect}
                  onClose={() => setCalendarOpen(false)}
                />
              )}
            </div>
            </div>
          </div>

          <div className="flex min-h-10 items-center rounded-lg border bg-muted/30 px-3 text-sm text-muted-foreground">
            <Clock3 className="mr-2 h-4 w-4" />
            {duration ? `${duration} ${duration === 1 ? "day" : "days"} requested` : "Choose a date range"}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              required
              maxLength={1000}
              value={form.reason}
              placeholder="Add a short note for your manager"
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
            />
          </div>

          <div className="flex justify-end border-t pt-5">
          <Button type="submit" disabled={submitting} className="min-w-44">
            {submitting ? "Submitting..." : "Submit leave request"}
          </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function LeaveHistory({ leaves }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="border-b px-6 py-5">
        <CardTitle className="text-base">Your submitted requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {leaves.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Your submitted leave requests will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => {
                  const start = new Date(leave.startDate).toISOString().slice(0, 10)
                  const end = new Date(leave.endDate).toISOString().slice(0, 10)
                  return (
                    <TableRow key={leave._id}>
                      <TableCell className="capitalize">{leave.leaveType}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(start)} - {formatDate(end)}
                      </TableCell>
                      <TableCell>{getDuration(start, end)} days</TableCell>
                      <TableCell className="max-w-xs whitespace-normal">{leave.reason}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
                      </TableCell>
                      <TableCell>{leave.adminRemarks || "—"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const statusesRef = useRef({})

  const fetchLeaves = useCallback(async () => {
    try {
      const response = await api.get("/leaves/me")
      response.data.forEach((leave) => {
        if (statusesRef.current[leave._id] && statusesRef.current[leave._id] !== leave.status) {
          toast.info(`Your leave request was ${leave.status}`)
        }
      })
      setLeaves(response.data)
      statusesRef.current = Object.fromEntries(
        response.data.map((leave) => [leave._id, leave.status])
      )
    } catch {
      toast.error("Failed to load your leave requests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaves()
    const interval = setInterval(fetchLeaves, 15000)
    return () => clearInterval(interval)
  }, [fetchLeaves])

  const pendingCount = leaves.filter((leave) => leave.status === "pending").length
  const approvedCount = leaves.filter((leave) => leave.status === "approved").length
  const rejectedCount = leaves.filter((leave) => leave.status === "rejected").length

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="rounded-xl border bg-background px-5 py-4">
        <p className="text-sm font-medium">Time off overview</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your leave activity or submit a new request below.
        </p>
      </div>

      <div className="grid grid-cols-2 divide-x rounded-xl border bg-background py-4 md:grid-cols-4">
        <SummaryCard label="Total requests" value={leaves.length} icon={CalendarDays} tone="bg-brand/10 text-brand" />
        <SummaryCard label="Pending" value={pendingCount} icon={Clock3} tone="bg-amber-500/10 text-amber-600" />
        <SummaryCard label="Approved" value={approvedCount} icon={FileCheck2} tone="bg-emerald-500/10 text-emerald-600" />
        <SummaryCard label="Rejected" value={rejectedCount} icon={XCircle} tone="bg-red-500/10 text-red-600" />
      </div>

      <LeaveForm onCreated={fetchLeaves} />
      {loading ? <Skeleton className="h-72 w-full rounded-xl" /> : <LeaveHistory leaves={leaves} />}
    </div>
  )
}
