import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/Common/PrivateRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Admin Pages
import ManageChurches from './pages/Admin/ManageChurches'
import ChurchDetails from './pages/Admin/ChurchDetails'
import CreateAdmin from './pages/Admin/CreateAdmin'

// Member Pages
import MemberDashboard from './pages/Member/MemberDashboard'

// Profile and Consent Pages (accessible by all roles)
import Profile from './pages/Profile'
import ConsentFormPage from './pages/ConsentFormPage'

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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes - Role-based dashboards */}
        <Route 
          path="/dashboard" 
          element={<PrivateRoute />} 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={<PrivateRoute allowedRoles={['admin']} />} 
        />
        
        <Route 
          path="/church/dashboard" 
          element={<PrivateRoute allowedRoles={['church']} />} 
        />
        
        <Route 
          path="/member/dashboard" 
          element={<PrivateRoute allowedRoles={['member']} />} 
        />

        {/* Admin-only routes */}
        <Route 
          path="/admin/churches" 
          element={<PrivateRoute adminOnly><ManageChurches /></PrivateRoute>} 
        />
        <Route 
          path="/admin/churches/:id" 
          element={<PrivateRoute adminOnly><ChurchDetails /></PrivateRoute>} 
        />
        <Route 
          path="/admin/create-admin" 
          element={<PrivateRoute adminOnly><CreateAdmin /></PrivateRoute>} 
        />

        {/* Profile and Consent - accessible by all authenticated users */}
        <Route 
          path="/profile" 
          element={<PrivateRoute><Profile /></PrivateRoute>} 
        />
        <Route 
          path="/consent" 
          element={<PrivateRoute><ConsentFormPage /></PrivateRoute>} 
        />

        {/* Redirect for any unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App