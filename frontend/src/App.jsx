import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/Common/PrivateRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ConsentFormPage from './pages/ConsentFormPage'
import ManageChurches from './pages/Admin/ManageChurches'
import ChurchDetails from './pages/Admin/ChurchDetails'
import CreateAdmin from './pages/Admin/CreateAdmin'

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/consent" element={<PrivateRoute><ConsentFormPage /></PrivateRoute>} />
        <Route path="/admin/churches" element={<PrivateRoute adminOnly><ManageChurches /></PrivateRoute>} />
        <Route path="/admin/churches/:id" element={<PrivateRoute adminOnly><ChurchDetails /></PrivateRoute>} />
        <Route path="/admin/create-admin" element={<PrivateRoute adminOnly><CreateAdmin /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App