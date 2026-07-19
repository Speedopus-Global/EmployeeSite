import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import AttendanceButton from "@/components/AttendanceButton"
import UploadDrawingDialog from "@/components/UploadDrawingDialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"
import { Eye } from "lucide-react"

const getViewUrl = (id) =>
  `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/drawings/${id}/view`

function statusVariant(status) {
  if (status === "approved") return "default"
  if (status === "rejected") return "destructive"
  return "secondary"
}

function StatCard({ label, value, accent = false }) {
  return (
    <Card
      className={`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        accent ? "border-brand/30 bg-brand/[0.03]" : ""
      }`}
    >
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-3xl font-semibold ${accent ? "text-brand" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

export default function DashboardTab() {
  const [drawings, setDrawings] = useState([])
  const [loading, setLoading] = useState(true)

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

  const total = drawings.length
  const pending = drawings.filter((d) => d.status === "pending").length
  const approved = drawings.filter((d) => d.status === "approved").length
  const rejected = drawings.filter((d) => d.status === "rejected").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total Uploads" value={total} />
          <StatCard label="Pending" value={pending} accent={pending > 0} />
          <StatCard label="Approved" value={approved} />
          <StatCard label="Rejected" value={rejected} />
        </div>
      </div>

      <div className="flex justify-end">
        <AttendanceButton />
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
                  <TableHead className="text-right">Action</TableHead>
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
                      <Badge
                        variant={statusVariant(d.status)}
                        className={d.status === "approved" ? "bg-brand hover:bg-brand" : ""}
                      >
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hover:text-brand"
                        onClick={() => window.open(getViewUrl(d._id), "_blank")}
                      >
                        <Eye className="mr-1 h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}