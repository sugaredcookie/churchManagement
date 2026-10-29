import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Layout/Navbar'
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiGlobe, FiSave, FiEdit2, FiCheckCircle, FiShield, FiExternalLink, FiAlertCircle } from 'react-icons/fi'
import churchService from '../services/churchService'
import aadhaarService from '../services/aadhaarService'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    churchName: '',
    phoneNumber: '',
    pastorName: '',
    address: '',
    city: '',
    state: '',
  })

  // Aadhaar KYC state (only relevant for members)
  const [kycStatus, setKycStatus] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    loadProfile()
    // Only load KYC status for members
    if (user?.role === 'member') {
      loadKycStatus()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const response = await churchService.getProfile()
      setProfile(response.data)
      setFormData({
        churchName: response.data.churchName,
        phoneNumber: response.data.phoneNumber,
        pastorName: response.data.pastorName,
        address: response.data.address,
        city: response.data.city,
        state: response.data.state,
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadKycStatus = async () => {
    try {
      const res = await aadhaarService.getStatus()
      setKycStatus(res.data)
    } catch (error) {
      // User may not have a KYC record yet — that's fine
      setKycStatus({ status: 'NOT_VERIFIED' })
    }
  }

  const handleStartVerification = async () => {
    setShowConsent(false)
    setVerifying(true)

    try {
      const res = await aadhaarService.initiate()

      if (!res.consentUrl) {
        throw new Error('No consent URL returned from server')
      }

      // Open DigiLocker consent page in a new tab
      window.open(res.consentUrl, '_blank', 'noopener,noreferrer')

      toast.success('Complete the verification in the DigiLocker tab')

      // Poll for status changes
      const startTime = Date.now()
      const POLL_INTERVAL = 3000
      const MAX_WAIT_MS = 10 * 60 * 1000 // DigiLocker link expires in 10 minutes

      const intervalId = setInterval(async () => {
        // Stop after 10 minutes
        if (Date.now() - startTime > MAX_WAIT_MS) {
          clearInterval(intervalId)
          setVerifying(false)
          toast.error('Verification link expired. Please try again.')
          return
        }

        try {
          const statusRes = await aadhaarService.getStatus()
          setKycStatus(statusRes.data)

          const s = statusRes.data?.status

          if (s === 'VERIFIED') {
            clearInterval(intervalId)
            setVerifying(false)
            toast.success('Identity verified successfully!')
          } else if (s === 'FAILED' || s === 'CONSENT_DENIED') {
            clearInterval(intervalId)
            setVerifying(false)
            if (s === 'CONSENT_DENIED') {
              toast.error('You denied consent. Verification cancelled.')
            } else {
              toast.error(statusRes.data?.failureReason || 'Verification failed. Please try again.')
            }
          }
        } catch (err) {
          // Network hiccup — keep polling
          console.warn('Status poll failed, retrying...')
        }
      }, POLL_INTERVAL)

      // Cleanup if component unmounts
      return () => clearInterval(intervalId)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start verification')
      setVerifying(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await churchService.updateProfile(formData)
      setProfile(response.data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const profileFields = [
    { label: 'Church Name', key: 'churchName', icon: FiUser, value: profile?.churchName },
    { label: 'Email Address', key: 'email', icon: FiMail, value: profile?.email, editable: false },
    { label: 'Phone Number', key: 'phoneNumber', icon: FiPhone, value: profile?.phoneNumber },
    { label: 'Pastor Name', key: 'pastorName', icon: FiUser, value: profile?.pastorName },
    { label: 'Address', key: 'address', icon: FiHome, value: profile?.address },
    { label: 'City', key: 'city', icon: FiMapPin, value: profile?.city },
    { label: 'State', key: 'state', icon: FiGlobe, value: profile?.state },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Church Profile</h1>
                <p className="text-gray-600 mt-2">Manage your church information and settings</p>
              </div>
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Status Bar */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="w-5 h-5" />
                  <span className="font-medium">Account Status</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">
                    Role: <span className="font-semibold capitalize">{profile?.role}</span>
                  </span>
                  <span className="text-sm">
                    Status: <span className="font-semibold">{profile?.isActive ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {profileFields.filter(field => field.editable !== false).map((field, idx) => {
                    const Icon = field.icon
                    return (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={field.key === 'address' ? 'md:col-span-2' : ''}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                        </label>
                        <div className="relative">
                          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            name={field.key}
                            value={formData[field.key]}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        churchName: profile.churchName,
                        phoneNumber: profile.phoneNumber,
                        pastorName: profile.pastorName,
                        address: profile.address,
                        city: profile.city,
                        state: profile.state,
                      })
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {profileFields.map((field, idx) => {
                    const Icon = field.icon
                    return (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={field.key === 'address' ? 'md:col-span-2' : ''}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">{field.label}</p>
                            <p className="text-gray-900 font-medium mt-1">
                              {field.value || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Account Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-gray-900 font-medium">{formatDate(profile?.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Login</p>
                      <p className="text-gray-900 font-medium">{formatDate(profile?.lastLogin)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consent Form</p>
                      <p className="text-gray-900 font-medium">
                        {profile?.consentFormSubmitted ? 'Submitted' : 'Not Submitted'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Identity Verification Card — only for members */}
          {user?.role === 'member' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    kycStatus?.status === 'VERIFIED' ? 'bg-green-50' : 'bg-amber-50'
                  }`}>
                    <FiShield className={`w-5 h-5 ${
                      kycStatus?.status === 'VERIFIED' ? 'text-green-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Identity Verification</h3>

                    {kycStatus?.status === 'VERIFIED' && (
                      <>
                        <p className="text-sm text-green-600 mt-1 font-medium">✓ Verified</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {kycStatus.verifiedName && `Name: ${kycStatus.verifiedName}`}
                          {kycStatus.maskedAadhaar && ` • Aadhaar: ${kycStatus.maskedAadhaar}`}
                        </p>
                      </>
                    )}

                    {kycStatus?.status === 'DIGILOCKER_PENDING' && (
                      <>
                        <p className="text-sm text-amber-600 mt-1 font-medium">⏳ Waiting for DigiLocker consent</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Complete the verification in the DigiLocker tab that opened.
                        </p>
                      </>
                    )}

                    {kycStatus?.status === 'CONSENT_DENIED' && (
                      <p className="text-sm text-red-600 mt-1">
                        You denied consent. Click Verify Aadhaar to try again.
                      </p>
                    )}

                    {kycStatus?.status === 'FAILED' && (
                      <p className="text-sm text-red-600 mt-1">
                        {kycStatus.failureReason || 'Verification failed. Please try again.'}
                      </p>
                    )}

                    {(!kycStatus || kycStatus.status === 'NOT_VERIFIED') && (
                      <p className="text-sm text-gray-600 mt-1">
                        Verify your Aadhaar through DigiLocker to confirm your identity.
                        This is required for church membership records.
                      </p>
                    )}
                  </div>
                </div>

                {kycStatus?.status !== 'VERIFIED' && (
                  <button
                    onClick={() => setShowConsent(true)}
                    disabled={verifying}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50"
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>{verifying ? 'Waiting...' : 'Verify Aadhaar'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Consent Modal */}
          {showConsent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-lg w-full p-6"
              >
                <div className="flex items-start space-x-3 mb-4">
                  <FiAlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Before you continue</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Please read and understand the following:
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <ul className="text-sm text-amber-900 space-y-2">
                    <li>• You will be redirected to <strong>DigiLocker</strong>, a Government of India platform.</li>
                    <li>• You will be asked to share your <strong>Aadhaar details</strong> (name, address, date of birth).</li>
                    <li>• Your Aadhaar number will <strong>not be stored</strong> in our database.</li>
                    <li>• Only your name and masked Aadhaar (last 4 digits) will be saved.</li>
                    <li>• This verification is handled by <strong>Cashfree Secure ID</strong>.</li>
                    <li>• You can deny consent at any time.</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  By clicking "I Agree & Continue", you provide explicit consent to share your Aadhaar
                  information from DigiLocker for identity verification.
                </p>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowConsent(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartVerification}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    I Agree & Continue
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Security Notice */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <p className="text-sm text-blue-800">
                <strong>Security Note:</strong> Your password was auto-generated and sent to your email.
                For security reasons, you cannot change your password here. Contact an administrator if you need to reset it.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile