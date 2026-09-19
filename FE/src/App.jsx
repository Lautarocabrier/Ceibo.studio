import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { apiRequest, TOKEN_KEY } from './services/api'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SuperAdmin from './pages/SuperAdmin'
import CustomerAdmin from './pages/CustomerAdmin'
import PublicFeedback from './pages/PublicFeedback'

export default function App() {
  const [user, setUser] = useState(null)
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsRestoring(false)
      return
    }
    apiRequest('/auth/me')
      .then((payload) => setUser(payload.user))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsRestoring(false))
  }, [])

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  if (isRestoring) return <div className="loading-screen">Cargando sesión...</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute user={user?.role === 'SUPERADMIN' ? user : null}>
              <SuperAdmin user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer"
          element={
            <ProtectedRoute user={user?.role === 'CUSTOMER' ? user : null}>
              <CustomerAdmin user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/:view"
          element={
            <ProtectedRoute user={user?.role === 'CUSTOMER' ? user : null}>
              <CustomerAdmin user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        <Route path="/qr/:token" element={<PublicFeedback />} />
        <Route
          path="*"
          element={<Navigate to={user ? (user.role === 'SUPERADMIN' ? '/superadmin' : '/customer') : '/'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
