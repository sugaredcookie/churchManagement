import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import churchService from '../../services/churchService'
import consentService from '../../services/consentService'
import { FiUser, FiCheckCircle, FiFileText, FiAlertCircle } from 'react-icons/fi'

const ChurchDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [consent, setConsent] = useState(null)
  const [stats, setStats] = useState([
    { label: 'Profile Complete', value: 0, icon: FiUser, color: 'text-blue-600' },
    { label: 'Consent Form', value: 0, icon: FiFileText, color: 'text-green-600' },
    { label: 'Account Status', value: 'Active', icon: FiCheckCircle, color: 'text-green-600' },
  ])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const profileData = await churchService.getProfile()
      setProfile(profileData.data)
      
      try {
        const consentData = await consentService.getConsent()
        setConsent(consentData.data)
        setStats(prev => prev.map(stat => 
          stat.label === 'Consent Form' ? { ...stat, value: 100 } : stat
        ))
      } catch (error) {
        setStats(prev => prev.map(stat => 
          stat.label === 'Consent Form' ? { ...stat, value: 0 } : stat
        ))
      }

      // Calculate profile completion
      const requiredFields = ['churchName', 'email', 'phoneNumber', 'pastorName', 'address', 'city', 'state']
      const completedFields = requiredFields.filter(field => profileData.data[field])
      const completion = (completedFields.length / requiredFields.length) * 100
      setStats(prev => prev.map(stat => 
        stat.label === 'Profile Complete' ? { ...stat, value: Math.round(completion) } : stat
      ))
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const quickActions = [
    { title: 'Update Profile', description: 'Keep your church information up to date', action: () => navigate('/profile'), icon: FiUser },
    { title: 'Consent Form', description: consent ? 'View your submitted form' : 'Submit your consent form', action: () => navigate('/consent'), icon: FiFileText },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.churchName || user?.churchName}
        </h1>
        <p className="text-gray-600 mt-2">Manage your church dashboard and settings</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              {stat.label === 'Consent Form' && stat.value === 0 && (
                <FiAlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stat.label === 'Account Status' ? stat.value : `${stat.value}%`}
            </h3>
            <p className="text-gray-600 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all"
            >
              <action.icon className="w-8 h-8 text-primary-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-gray-600">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-gray-500 text-center py-8">
            No recent activities to display
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ChurchDashboard