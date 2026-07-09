import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import EmployeeDashboard from "@/pages/EmployeeDashboard"
import ProtectedRoute from "@/routes/ProtectedRoutes"


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
         <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App