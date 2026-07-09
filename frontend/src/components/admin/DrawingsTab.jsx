import { useState } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Eye, Download } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function statusVariant(status) {
  if (status === "approved") return "default"
  if (status === "rejected") return "destructive"
  return "secondary"
}

export default function DrawingsTab({ drawings, loading, onRefresh }) {
  const [selected, setSelected] = useState(null)
  const [remarks, setRemarks] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const openReview = (drawing) => {
    setSelected(drawing)
    setRemarks(drawing.reviewRemarks || "")
  }

  const handleDecision = async (decision) => {
    setSubmitting(true)
    try {
      await api.put(`/drawings/${selected._id}/${decision}`, { remarks })
      toast.success(`Drawing ${decision}d`)
      setSelected(null)
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Drawing Review</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : drawings.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No drawings uploaded yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Drawing No.</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drawings.map((d) => (
                <TableRow key={d._id}>
                  <TableCell>{d.employee?.name}</TableCell>
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
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`${API_BASE}/drawings/${d._id}/view`, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`${API_BASE}/drawings/${d._id}/download`, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => openReview(d)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Drawing</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Employee</p>
                  <p>{selected.employee?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Project</p>
                  <p>{selected.projectName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Drawing No.</p>
                  <p>{selected.drawingNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employee Remarks</p>
                  <p>{selected.remarks || "—"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewRemarks">Review Remarks</Label>
                <Textarea
                  id="reviewRemarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional comment for the employee"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={submitting}
              onClick={() => handleDecision("reject")}
            >
              Reject
            </Button>
            <Button disabled={submitting} onClick={() => handleDecision("approve")}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}