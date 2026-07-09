import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export default function NotificationBell({
  employees,
  drawings,
  onGoTo,
}) {
  const pendingEmployees = employees
    .filter((e) => e.status === "pending")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const pendingDrawings = drawings
    .filter((d) => d.status === "pending")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const total = pendingEmployees.length + pendingDrawings.length

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

            {pendingDrawings.length > 0 && (
              <>
                {pendingEmployees.length > 0 && (
                  <DropdownMenuSeparator />
                )}

                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    Pending Drawings ({pendingDrawings.length})
                  </DropdownMenuLabel>

                  {pendingDrawings.slice(0, 5).map((d) => (
                    <DropdownMenuItem
                      key={d._id}
                      onClick={() => onGoTo("drawings")}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium">
                        {d.projectName}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {d.employee?.name} · {d.drawingNumber}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}