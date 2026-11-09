import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export default function NotificationBell({
  employees,
  leaves = [],
  onGoTo,
}) {
  const pendingEmployees = employees
    .filter((e) => e.status === "pending")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const pendingLeaves = leaves.filter((leave) => leave.status === "pending")
  const total = pendingEmployees.length + pendingLeaves.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />

          {total > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1.5 -top-1.5 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]"
            >
              {total > 9 ? "9+" : total}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {total === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            You're all caught up
          </div>
        ) : (
          <>
            {pendingEmployees.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Pending Approvals ({pendingEmployees.length})
                </DropdownMenuLabel>

                {pendingEmployees.slice(0, 5).map((e) => (
                  <DropdownMenuItem
                    key={e._id}
                    onClick={() => onGoTo("employees")}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">{e.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {e.email}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
            {pendingLeaves.length > 0 && (
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  Leave Requests ({pendingLeaves.length})
                </DropdownMenuLabel>
                {pendingLeaves.slice(0, 5).map((leave) => (
                  <DropdownMenuItem
                    key={leave._id}
                    onClick={() => onGoTo("leave")}
                    className="flex flex-col items-start"
                  >
                    <span className="font-medium">{leave.employee?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {leave.leaveType} leave · {new Date(leave.startDate).toLocaleDateString()}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}