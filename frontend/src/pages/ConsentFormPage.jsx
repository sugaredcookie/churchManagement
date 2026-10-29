import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Navbar from '../components/Layout/Navbar'
import consentService from '../services/consentService'
import { 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiCalendar, 
  FiUsers,
  FiCheckCircle,
  FiFileText,
  FiSave,
  FiEdit2,
  FiAlertCircle,
  FiLock,
  FiPhoneCall,
  FiMapPin,
  FiShield,
  FiPenTool  // Changed from FiSignature to FiPenTool
} from 'react-icons/fi'
import toast from 'react-hot-toast'

const ConsentFormPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [existingConsent, setExistingConsent] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    ageGroup: '',
    gender: '',
    basedIn: '',
    representativeName: '',
    designation: '',
    contactNumber: '',
    agreementAccepted1: false,
    agreementAccepted2: false,
    agreementAccepted3: false,
    agreementAccepted4: false,
    agreementAccepted5: false,
    agreementAccepted6: false,
    aadhaarConsent: false,
    signatureName: '',
  })

  useEffect(() => {
    checkExistingConsent()
  }, [])

  const checkExistingConsent = async () => {
    try {
      const response = await consentService.getConsent()
      setExistingConsent(response.data)
      setFormData({
        fullName: response.data.fullName || '',
        mobileNumber: response.data.mobileNumber || '',
        email: response.data.email || '',
        ageGroup: response.data.ageGroup || '',
        gender: response.data.gender || '',
        basedIn: response.data.basedIn || '',
        representativeName: response.data.representativeName || '',
        designation: response.data.designation || '',
        contactNumber: response.data.contactNumber || '',
        agreementAccepted1: response.data.agreementAccepted1 || false,
        agreementAccepted2: response.data.agreementAccepted2 || false,
        agreementAccepted3: response.data.agreementAccepted3 || false,
        agreementAccepted4: response.data.agreementAccepted4 || false,
        agreementAccepted5: response.data.agreementAccepted5 || false,
        agreementAccepted6: response.data.agreementAccepted6 || false,
        aadhaarConsent: response.data.aadhaarConsent || false,
        signatureName: response.data.signatureName || '',
      })
      setIsEditing(false)
    } catch (error) {
      // No consent form found
      setExistingConsent(null)
      setIsEditing(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const isAllRequiredChecked = () => {
    return formData.agreementAccepted1 &&
           formData.agreementAccepted2 &&
           formData.agreementAccepted3 &&
           formData.agreementAccepted4 &&
           formData.agreementAccepted5 &&
           formData.agreementAccepted6 &&
           formData.aadhaarConsent
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAllRequiredChecked()) {
      toast.error('You must accept all the agreements and provide Aadhaar eSign consent')
      return
    }

    if (formData.signatureName !== formData.fullName) {
      toast.error('Signature name must match your full name')
      return
    }

    if (!formData.fullName || !formData.mobileNumber || !formData.email) {
      toast.error('Please fill in all your personal details')
      return
    }

    setSaving(true)
    try {
      const consentData = {
        ...formData,
        churchName: user?.churchName,
        church: user?.id,
        submittedAt: new Date(),
      }
      
      if (existingConsent) {
        await consentService.updateConsent(consentData)
        toast.success('Consent form updated successfully!')
      } else {
        await consentService.createConsent(consentData)
        toast.success('Consent form submitted successfully!')
      }
      setIsEditing(false)
      checkExistingConsent()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit consent form')
    } finally {
      setSaving(false)
    }
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

  const ageGroups = ['18 to 25 years', '26 to 35 years', '36 to 45 years', '46 to 60 years', '60+ years']
  const genders = ['Male', 'Female', 'Other']

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Consent & Acknowledgement Form</h1>
                <p className="text-gray-600 mt-2">
                  Please complete this form to confirm your voluntary participation
                </p>
              </div>
              {existingConsent && !isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                >
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit Form</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Status Banner */}
          {existingConsent && !isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Consent Form Submitted</p>
                  <p className="text-green-600 text-sm">
                    Submitted on {new Date(existingConsent.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            {isEditing ? (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Personal Details Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiUser className="w-6 h-6 text-primary-600 mr-2" />
                    Your Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your mobile number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Group *
                      </label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          name="ageGroup"
                          value={formData.ageGroup}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select age group</option>
                          {ageGroups.map(age => (
                            <option key={age} value={age}>{age}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <div className="relative">
                        <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select gender</option>
                          {genders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Based In (City, Area) *
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="basedIn"
                          value={formData.basedIn}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., Kandivali, west"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Church Representative Section */}
                <div className="mb-8 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiUsers className="w-6 h-6 text-primary-600 mr-2" />
                    Church Representative Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Representative Name *
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="representativeName"
                          value={formData.representativeName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter representative name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation *
                      </label>
                      <div className="relative">
                        <FiPenTool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., Pastor, Secretary, Administrator"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <div className="relative">
                        <FiPhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter contact number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent & Acknowledgement Section */}
                <div className="mb-8 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiFileText className="w-6 h-6 text-primary-600 mr-2" />
                    Consent & Acknowledgement
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="agreementAccepted1"
                        checked={formData.agreementAccepted1}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 text-sm leading-relaxed">
                        I confirm that I am visiting / attending religious activities, services, prayers, worship and programmes entirely of my own free will, without any coercion, deceit, force, allurement, inducement, undue influence, misrepresentation, or fraudulent means from any church leader, member, or person associated with the Fellowship.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="agreementAccepted2"
                        checked={formData.agreementAccepted2}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 text-sm leading-relaxed">
                        I confirm that my participation in worship, prayer, Bible study, counselling, or any other spiritual activity is entirely voluntary and based on my personal faith and conviction.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="agreementAccepted3"
                        checked={formData.agreementAccepted3}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 text-sm leading-relaxed">
                        I confirm that I have not been promised, nor have I received, any allurement in the form of money, gifts, food, employment, free education, better lifestyle, or any other material or non-material benefit as an inducement to attend or participate.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="agreementAccepted4"
                        checked={formData.agreementAccepted4}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 text-sm leading-relaxed">
                        I confirm that any offering, tithes, or donation I choose to make is voluntary and made of my own free will, without any pressure or obligation.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="agreementAccepted5"
                        checked={formData.agreementAccepted5}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 text-sm leading-relaxed">
                        I understand that I am free to attend or stop attending at any time, and to make my own faith decisions without any pressure from anyone.
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        name="agreementAccepted6"
                        checked={formData.agreementAccepted6}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 text-sm leading-relaxed">
                        I consent to my details being recorded and used only for communication and church-related purposes. I understand that this record may be used, if required, for legal or official purposes to confirm that my decisions are voluntary, and that my information will not be shared with third parties except where legally required or on a need-to-know basis.
                      </label>
                    </div>
                  </div>
                </div>

                {/* Aadhaar eSign Section */}
                <div className="mb-8 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiShield className="w-6 h-6 text-primary-600 mr-2" />
                    Aadhaar eSign
                  </h2>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <input
                        type="checkbox"
                        name="aadhaarConsent"
                        checked={formData.aadhaarConsent}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-gray-700 font-medium">
                        By performing digital signature using Aadhaar-based eSign, I confirm that all the above information is true and that I am signing this freely and voluntarily.
                      </label>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> This document will be digitally signed using Aadhaar-based eSign in accordance with the Indian IT Act, 2000 and applicable electronic signature rules, and constitutes a valid electronic record under Indian law.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Digital Signature Section */}
                <div className="mb-8 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FiPenTool className="w-6 h-6 text-primary-600 mr-2" />
                    Digital Signature
                  </h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Signature Name *
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="signatureName"
                          value={formData.signatureName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder="Type your full name as signature"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        By typing your name, you agree that this constitutes an electronic signature and is legally binding.
                        The signature name must match your full name exactly.
                      </p>
                    </div>
                    
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 flex items-start">
                        <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Legal Notice:</strong> This digitally signed document serves as a legally binding agreement.
                          Any false information or misrepresentation may have legal consequences under applicable laws.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {existingConsent && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        checkExistingConsent()
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSave className="w-4 h-4" />
                    )}
                    <span>{existingConsent ? 'Update Consent Form' : 'Submit Consent Form'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8">
                {existingConsent ? (
                  <div className="space-y-8">
                    {/* Personal Details Display */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Details</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="text-gray-900 font-medium">{existingConsent.fullName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Mobile Number</p>
                          <p className="text-gray-900 font-medium">{existingConsent.mobileNumber}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-900 font-medium">{existingConsent.email}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Age Group</p>
                          <p className="text-gray-900 font-medium">{existingConsent.ageGroup}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="text-gray-900 font-medium">{existingConsent.gender}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Based In</p>
                          <p className="text-gray-900 font-medium">{existingConsent.basedIn}</p>
                        </div>
                      </div>
                    </div>

                    {/* Church Representative Details Display */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Church Representative</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Representative Name</p>
                          <p className="text-gray-900 font-medium">{existingConsent.representativeName}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Designation</p>
                          <p className="text-gray-900 font-medium">{existingConsent.designation}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500">Contact Number</p>
                          <p className="text-gray-900 font-medium">{existingConsent.contactNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Consent Status */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Consent Status</h3>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <FiCheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="text-green-800 font-medium">All Agreements Accepted</p>
                            <p className="text-green-600 text-sm">
                              You have accepted all terms and conditions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aadhaar eSign Status */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Aadhaar eSign</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <FiShield className="w-6 h-6 text-blue-600" />
                          <div>
                            <p className="text-blue-800 font-medium">Digital Signature Confirmed</p>
                            <p className="text-blue-600 text-sm">
                              Aadhaar-based eSign consent provided
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Signature */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Signature</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FiPenTool className="w-5 h-5 text-primary-600 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Digitally signed by</p>
                            <p className="text-gray-900 font-medium text-lg">{existingConsent.signatureName}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              This document has been digitally signed in accordance with applicable electronic signature rules
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Consent Form Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Please complete the consent form to confirm your voluntary participation
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all"
                    >
                      Complete Consent Form
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <p className="text-xs text-gray-500 text-center">
              This is a legally binding document. By submitting this form, you confirm that all information provided is true and accurate to the best of your knowledge.
              Any false information may result in legal consequences under applicable laws.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ConsentFormPage