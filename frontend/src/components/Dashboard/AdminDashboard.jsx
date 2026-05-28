import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FiUsers, FiUserPlus, FiShield, FiActivity, FiEye, FiTrendingUp } from 'react-icons/fi'
import adminService from '../../services/adminService'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalChurches: 0,
    activeChurches: 0,
    inactiveChurches: 0,
    consentSubmitted: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await adminService.getAllChurches(1, 100)
      const churches = response.data
      const active = churches.filter(c => c.isActive).length
      const consentSubmitted = churches.filter(c => c.consentFormSubmitted).length
      
      setStats({
        totalChurches: response.pagination?.total || churches.length,
        activeChurches: active,
        inactiveChurches: churches.length - active,
        consentSubmitted: consentSubmitted,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Churches',
      value: stats.totalChurches,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Churches',
      value: stats.activeChurches,
      icon: FiActivity,
      color: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Consent Submitted',
      value: stats.consentSubmitted,
      icon: FiShield,
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Completion Rate',
      value: stats.totalChurches ? Math.round((stats.consentSubmitted / stats.totalChurches) * 100) : 0,
      icon: FiTrendingUp,
      color: 'from-orange-500 to-orange-600',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      suffix: '%',
    },
  ]

  const quickActions = [
    {
      title: 'Manage Churches',
      description: 'View and manage all registered churches',
      icon: FiUsers,
      action: () => navigate('/admin/churches'),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Create Admin',
      description: 'Add new administrator accounts',
      icon: FiUserPlus,
      action: () => navigate('/admin/create-admin'),
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of church management system</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span className={`text-2xl font-bold ${stat.iconColor}`}>
                  {stat.value}{stat.suffix || ''}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm">{stat.title}</h3>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.action}
                className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all"
              >
                <div className={`${action.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-gray-600">{action.description}</p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((_, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">System ready and monitoring</p>
                  <p className="text-xs text-gray-400">Just now</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard