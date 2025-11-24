import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from 'sonner'
import { useAuthStore } from './stores/authStore'
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <AdminLogin />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />} 
          />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#ffffff',
            border: '1px solid #374151',
          },
        }}
      />
    </>
  )
}

export default App
