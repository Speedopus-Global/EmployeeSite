import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import AttendanceButton from "@/components/AttendanceButton"
import UploadDrawingDialog from "@/components/UploadDrawingDialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"

function statusVariant(status) {
  if (status === "approved") return "default"
  if (status === "rejected") return "destructive"
  return "secondary"
}

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

export default function EmployeeDashboard() {
  const [drawings, setDrawings] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const fetchDrawings = useCallback(async () => {
    try {
      const res = await api.get("/drawings/me")
      setDrawings(res.data)
    } catch (err) {
      toast.error("Failed to load your uploads")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrawings()
  }, [fetchDrawings])

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const total = drawings.length
  const pending = drawings.filter((d) => d.status === "pending").length
  const approved = drawings.filter((d) => d.status === "approved").length
  const rejected = drawings.filter((d) => d.status === "rejected").length

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">CWADMS</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <AttendanceButton />
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Uploads" value={total} />
          <StatCard label="Pending" value={pending} />
          <StatCard label="Approved" value={approved} />
          <StatCard label="Rejected" value={rejected} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Drawings</CardTitle>
            <UploadDrawingDialog onUploaded={fetchDrawings} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : drawings.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No drawings uploaded yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Drawing No.</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drawings.map((d) => (
                    <TableRow key={d._id}>
                      <TableCell>{d.projectName}</TableCell>
                      <TableCell>{d.drawingNumber}</TableCell>
                      <TableCell>
                        {new Date(d.createdAt).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}