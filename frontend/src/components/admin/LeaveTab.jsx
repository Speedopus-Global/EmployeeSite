import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

function getStatusVariant(status) {
  if (status === "approved") return "default"
  if (status === "rejected") return "destructive"
  return "secondary"
}

function formatDate(value) {
  return new Date(value).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function LeaveTab({ leaves, loading, onDecision }) {
  const [remarks, setRemarks] = useState({})
  const pendingCount = leaves.filter((leave) => leave.status === "pending").length

  return (
    <Card className="mt-4">
      <CardHeader><CardTitle>Leave Requests ({pendingCount} pending)</CardTitle></CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : leaves.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No leave requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>
                      <div>{leave.employee?.name}</div>
                      <div className="text-xs text-muted-foreground">{leave.employee?.email}</div>
                    </TableCell>
                    <TableCell className="capitalize">{leave.leaveType}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal">{leave.reason}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(leave.status)}>{leave.status}</Badge>
                    </TableCell>
                    <TableCell>{leave.adminRemarks || "—"}</TableCell>
                    <TableCell className="space-y-2 text-right">
                      {leave.status === "pending" && (
                        <>
                          <Input
                            placeholder="Optional remarks"
                            value={remarks[leave._id] || ""}
                            onChange={(event) =>
                              setRemarks({ ...remarks, [leave._id]: event.target.value })
                            }
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => onDecision(leave._id, "approved", remarks[leave._id] || "")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onDecision(leave._id, "rejected", remarks[leave._id] || "")}
                            >
                              Reject
                            </Button>
                          </div>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
