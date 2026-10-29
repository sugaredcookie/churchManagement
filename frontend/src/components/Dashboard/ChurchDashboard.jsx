import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import churchService from '../../services/churchService'
import consentService from '../../services/consentService'
import { 
  FiUser, 
  FiCheckCircle, 
  FiFileText, 
  FiAlertCircle,
  FiUsers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiSave,
  FiRefreshCw,
  FiUserPlus,
  FiShield,
  FiClock,
  FiXCircle,
  FiLogOut,
  FiHome
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const ChurchDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [consent, setConsent] = useState(null)
  
  // Member management states
  const [members, setMembers] = useState([])
  const [memberStats, setMemberStats] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  
  const [stats, setStats] = useState([
    { label: 'Profile Complete', value: 0, icon: FiUser, color: 'text-blue-600' },
    { label: 'Consent Form', value: 0, icon: FiFileText, color: 'text-green-600' },
    { label: 'Total Members', value: 0, icon: FiUsers, color: 'text-purple-600' },
    { label: 'Account Status', value: 'Active', icon: FiCheckCircle, color: 'text-green-600' },
  ])

  useEffect(() => {
    loadData()
    loadMembers()
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

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await churchService.getMembers()
      if (response.success) {
        setMembers(response.data)
        setMemberStats(response.stats)
        // Update total members stat
        setStats(prev => prev.map(stat => 
          stat.label === 'Total Members' ? { ...stat, value: response.data.length } : stat
        ))
      }
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      const response = await churchService.addMember({
        name: formData.name,
        email: formData.email
      })

      if (response.success) {
        toast.success('Member added successfully! An email has been sent with login credentials.')
        setShowAddModal(false)
        setFormData({ name: '', email: '' })
        await loadMembers()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) {
      return
    }

    try {
      const response = await churchService.deleteMember(memberId)
      if (response.success) {
        toast.success('Member removed successfully')
        await loadMembers()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to remove member')
    }
  }

  const handleEditMember = async (e) => {
    e.preventDefault()
    
    if (!selectedMember) return

    setSubmitting(true)

    try {
      const response = await churchService.updateMember(selectedMember._id, {
        name: selectedMember.name,
        email: selectedMember.email,
        isActive: selectedMember.isActive
      })

      if (response.success) {
        toast.success('Member updated successfully')
        setShowEditModal(false)
        setSelectedMember(null)
        await loadMembers()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update member')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
            <FiCheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        )
      case 'PENDING':
        return (
          <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs">
            <FiClock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'FAILED':
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">
            <FiXCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        )
      default:
        return (
          <span className="flex items-center text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs">
            <FiAlertCircle className="w-3 h-3 mr-1" />
            Not Verified
          </span>
        )
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const quickActions = [
    { title: 'Update Profile', description: 'Keep your church information up to date', action: () => navigate('/profile'), icon: FiUser },
    { title: 'Consent Form', description: consent ? 'View your submitted form' : 'Submit your consent form', action: () => navigate('/consent'), icon: FiFileText },
    { title: 'Add Member', description: 'Add a new member to your church', action: () => setShowAddModal(true), icon: FiUserPlus },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.churchName || user?.churchName}
            </h1>
            <p className="text-gray-600 mt-2">Manage your church dashboard and settings</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors border border-gray-300 rounded-lg hover:border-red-300"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
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
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
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

      {/* Members Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiUsers className="w-6 h-6 text-primary-600 mr-2" />
            Members ({members.length})
          </h2>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={loadMembers}
              className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        {/* Member Stats Cards */}
        {memberStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{memberStats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">Verified</p>
              <p className="text-xl font-bold text-green-600">{memberStats.verified}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{memberStats.pending}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500">Not Verified</p>
              <p className="text-xl font-bold text-gray-600">{memberStats.notVerified}</p>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Yet</h3>
              <p className="text-gray-500 mb-4">
                Start adding members to your church by clicking the "Add Member" button.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
              >
                <FiUserPlus className="inline w-4 h-4 mr-2" />
                Add Your First Member
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-500">
                No members match your search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aadhaar Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <motion.tr
                        key={member._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                              {!member.isActive && (
                                <span className="text-xs text-red-500">Inactive</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(member.aadhaarVerification?.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedMember(member)
                              setShowEditModal(true)
                            }}
                            className="text-primary-600 hover:text-primary-900 mr-3"
                            title="Edit Member"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member._id, member.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove Member"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {members.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing {filteredMembers.length} of {members.length} members
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiUserPlus className="w-6 h-6 text-primary-600 mr-2" />
                Add New Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter member's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter member's email address"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  A welcome email with login credentials will be sent to this address.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-2">
                  <FiShield className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">What happens next?</p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Member receives welcome email with temporary password</li>
                      <li>• Member logs in and completes Aadhaar verification</li>
                      <li>• Member can access their dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="w-4 h-4" />
                      <span>Add Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FiEdit2 className="w-6 h-6 text-primary-600 mr-2" />
                Edit Member
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedMember(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember({
                    ...selectedMember,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter member's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={selectedMember.email}
                  onChange={(e) => setSelectedMember({
                    ...selectedMember,
                    email: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter member's email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={selectedMember.isActive !== false}
                      onChange={() => setSelectedMember({
                        ...selectedMember,
                        isActive: true
                      })}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={selectedMember.isActive === false}
                      onChange={() => setSelectedMember({
                        ...selectedMember,
                        isActive: false
                      })}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Aadhaar Status:</strong>{' '}
                  {getStatusBadge(selectedMember.aadhaarVerification?.status)}
                </p>
                {selectedMember.aadhaarVerification?.verifiedAt && (
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Verified On:</strong>{' '}
                    {new Date(selectedMember.aadhaarVerification.verifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedMember(null)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ChurchDashboard