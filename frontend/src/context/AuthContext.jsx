import { createContext, useContext, useState, useEffect } from "react"
import api from "@/lib/axios"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while checking existing session

  // On app load, check if a valid session cookie already exists
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me")
        setUser(res.data.user)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password })
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password })
    return res.data
  }

  const logout = async () => {
    await api.post("/auth/logout")
    setUser(null)
  }

  const refreshUser = async () => {
  const res = await api.get("/auth/me")
  setUser(res.data.user)
}

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)