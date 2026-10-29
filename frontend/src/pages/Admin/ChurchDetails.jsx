import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../../components/Layout/Navbar'
import adminService from '../../services/adminService'
import Button from '../../components/Common/Button'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiGlobe, FiFileText, FiCheckCircle, FiCalendar } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ChurchDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [church, setChurch] = useState(null)
  const [consent, setConsent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChurchDetails()
  }, [id])

  const loadChurchDetails = async () => {
    setLoading(true)
    try {
      const response = await adminService.getChurchById(id)
      setChurch(response.data.church)
      setConsent(response.data.consentForm)
    } catch (error) {
      toast.error('Failed to load church details')
      navigate('/admin/churches')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      await adminService.toggleChurchStatus(id, !church.isActive)
      toast.success(`Church ${!church.isActive ? 'enabled' : 'disabled'} successfully`)
      loadChurchDetails()
    } catch (error) {
      toast.error('Failed to update church status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!church) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-600">Church not found</p>
        </div>
      </div>
    )
  }

  const infoSections = [
    {
      title: 'Church Information',
      items: [
        { label: 'Church Name', value: church.churchName, icon: FiHome },
        { label: 'Pastor Name', value: church.pastorName, icon: FiUser },
        { label: 'Email Address', value: church.email, icon: FiMail },
        { label: 'Phone Number', value: church.phoneNumber, icon: FiPhone },
      ],
    },
    {
      title: 'Location',
      items: [
        { label: 'Address', value: church.address, icon: FiMapPin },
        { label: 'City', value: church.city, icon: FiGlobe },
        { label: 'State', value: church.state, icon: FiGlobe },
      ],
    },
    {
      title: 'Account Information',
      items: [
        { label: 'Role', value: church.role?.toUpperCase(), icon: FiUser },
        { label: 'Status', value: church.isActive ? 'Active' : 'Inactive', icon: FiCheckCircle },
        { label: 'Member Since', value: new Date(church.createdAt).toLocaleDateString(), icon: FiCalendar },
        { label: 'Last Login', value: church.lastLogin ? new Date(church.lastLogin).toLocaleDateString() : 'Never', icon: FiCalendar },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/admin/churches')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Churches</span>
          </motion.button>

          {/* Church Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">{church.churchName}</h1>
                  <p className="text-white/80 mt-1">Church Details Overview</p>
                </div>
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    church.isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {church.isActive ? 'Disable Account' : 'Enable Account'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {infoSections.map((section, idx) => (
                <div key={idx}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {section.items.map((item, itemIdx) => {
                      const Icon = item.icon
                      return (
                        <div key={itemIdx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Icon className="w-5 h-5 text-primary-600 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-gray-900 font-medium">{item.value || 'Not provided'}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Consent Form Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FiFileText className="w-5 h-5 mr-2 text-primary-600" />
                  Consent Form
                </h2>
                {consent ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3 mb-4">
                      <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-green-800 font-medium">Form Submitted</p>
                        <p className="text-green-600 text-sm">
                          Submitted on {new Date(consent.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Representative</p>
                        <p className="text-gray-900">{consent.representativeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Designation</p>
                        <p className="text-gray-900">{consent.designation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact Number</p>
                        <p className="text-gray-900">{consent.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Signature</p>
                        <p className="text-gray-900">{consent.signatureName}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">Consent form not yet submitted</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ChurchDetails