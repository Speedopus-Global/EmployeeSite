import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function RootRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role === "employee" && !user.isProfileComplete && !sessionStorage.getItem("profileSetupSkipped"))
    return <Navigate to="/complete-profile" replace />
  return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />
}