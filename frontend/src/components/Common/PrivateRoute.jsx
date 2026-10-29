import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Import role-specific dashboards
import AdminDashboard from '../Dashboard/AdminDashboard'
import ChurchDashboard from '../Dashboard/ChurchDashboard'
import MemberDashboard from '../../pages/Member/MemberDashboard'

const PrivateRoute = ({ children, adminOnly, allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If adminOnly is true, only admins can access
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />
  }

  // If children are provided (for specific routes), render them
  if (children) {
    return children
  }

  // Otherwise, render the appropriate dashboard based on role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'church':
      return <ChurchDashboard />
    case 'member':
      return <MemberDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

export default PrivateRoute