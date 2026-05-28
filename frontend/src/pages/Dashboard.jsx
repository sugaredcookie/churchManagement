import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Layout/Navbar'
import ChurchDashboard from '../components/Dashboard/ChurchDashboard'
import AdminDashboard from '../components/Dashboard/AdminDashboard'
import { FiLoader } from 'react-icons/fi'

const Dashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16">
        {user?.role === 'admin' ? <AdminDashboard /> : <ChurchDashboard />}
      </div>
    </div>
  )
}

export default Dashboard