import { useState, useEffect } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function AttendanceButton() {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchToday = async () => {
    try {
      const res = await api.get("/attendance/today")
      setRecord(res.data)
    } catch (err) {
      toast.error("Could not load attendance status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchToday()
  }, [])

  const handleClick = async () => {
    setSubmitting(true)
    try {
      if (!record) {
        const res = await api.post("/attendance/login")
        setRecord(res.data)
        toast.success("Attendance marked")
      } else if (!record.logoutTime) {
        const res = await api.post("/attendance/logout")
        setRecord(res.data)
        toast.success("Logged out for the day")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed")
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (iso) =>
    iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"

  if (loading) return <Skeleton className="h-16 w-56" />

  const isDone = record?.logoutTime
  const isLoggedIn = record?.loginTime && !record?.logoutTime

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleClick}
        disabled={submitting || isDone}
        variant={isDone ? "secondary" : isLoggedIn ? "destructive" : "default"}
      >
        {isDone
          ? "Attendance completed"
          : isLoggedIn
          ? submitting ? "Logging out..." : "Mark Logout"
          : submitting ? "Marking..." : "Mark Attendance"}
      </Button>
      {record && (
        <p className="text-xs text-muted-foreground">
          In: {formatTime(record.loginTime)} · Out: {formatTime(record.logoutTime)}
          {record.workingHours > 0 && ` · ${record.workingHours}h`}
        </p>
      )}
    </div>
  )
}