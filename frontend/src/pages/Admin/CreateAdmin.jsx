import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Layout/Navbar'
import adminService from '../../services/adminService'
import Button from '../../components/Common/Button'
import Input from '../../components/Common/Input'
import { FiUser, FiMail, FiPhone, FiHome, FiMapPin, FiGlobe, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CreateAdmin = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    churchName: '',
    email: '',
    phoneNumber: '',
    pastorName: '',
    address: '',
    city: '',
    state: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminService.createAdmin(formData)
      toast.success('Admin created successfully! Password has been sent to their email.')
      navigate('/admin/churches')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  const inputFields = [
    { name: 'churchName', label: 'Church/Organization Name', icon: FiUser, type: 'text', placeholder: 'Enter church or organization name' },
    { name: 'email', label: 'Email Address', icon: FiMail, type: 'email', placeholder: 'admin@example.com' },
    { name: 'phoneNumber', label: 'Phone Number', icon: FiPhone, type: 'tel', placeholder: '+1 234 567 8900' },
    { name: 'pastorName', label: 'Pastor/Leader Name', icon: FiUser, type: 'text', placeholder: 'Full name of pastor or leader' },
    { name: 'address', label: 'Address', icon: FiHome, type: 'text', placeholder: 'Street address' },
    { name: 'city', label: 'City', icon: FiMapPin, type: 'text', placeholder: 'City' },
    { name: 'state', label: 'State', icon: FiGlobe, type: 'text', placeholder: 'State' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-6 py-6">
              <div className="flex items-center space-x-3">
                <FiShield className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Create Administrator</h1>
                  <p className="text-white/80 mt-1">Add a new admin to the system</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {inputFields.map((field) => (
                  <div key={field.name} className={field.name === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} *
                    </label>
                    <div className="relative">
                      <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> A secure password will be automatically generated and sent to the admin's email address.
                  The admin can use this password to log in and access the system.
                </p>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/churches')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                >
                  Create Admin
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CreateAdmin