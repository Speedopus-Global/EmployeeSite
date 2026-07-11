import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import EmployeeDashboard from "@/pages/EmployeeDashboard"
import ProtectedRoute from "@/routes/ProtectedRoutes"
import AdminDashboard from "@/pages/AdminDashboard"
import NotFound from "@/pages/NotFound"
import VerifyEmail from "@/pages/VerifyEmail"
import ForgotPassword from "@/pages/ForgotPassword"
import ResetPassword from "@/pages/ResetPassword"


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
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
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
       
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App