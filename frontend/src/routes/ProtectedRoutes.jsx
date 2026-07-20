import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children, allowedRoles, skipProfileCheck = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  if (!skipProfileCheck && user.role === "employee" && !user.isProfileComplete && !sessionStorage.getItem("profileSetupSkipped")) {
    return <Navigate to="/complete-profile" replace />
  }

  return children
}