import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import EmployeeDashboard from "@/pages/EmployeeDashboard"
import AdminDashboard from "@/pages/AdminDashboard"
import CompleteProfile from "@/pages/CompleteProfile"
import VerifyEmail from "@/pages/VerifyEmail"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"
import NotFound from "@/pages/NotFound"
import ProtectedRoute from "@/routes/ProtectedRoutes"
import RootRedirect from "@/routes/RootRedirect"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/complete-profile" element={
            <ProtectedRoute allowedRoles={["employee"]} skipProfileCheck>
              <CompleteProfile />
            </ProtectedRoute>
          } />

          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App