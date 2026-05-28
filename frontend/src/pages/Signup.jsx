import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiHome, FiGlobe, 
  FiUserPlus, FiArrowLeft 
} from 'react-icons/fi'

const Signup = () => {
  const [formData, setFormData] = useState({
    churchName: '',
    email: '',
    phoneNumber: '',
    pastorName: '',
    address: '',
    city: '',
    state: '',
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await signup(formData)
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const inputFields = [
    { name: 'churchName', label: 'Church Name', icon: FiUser, type: 'text', placeholder: 'Grace Community Church' },
    { name: 'email', label: 'Email Address', icon: FiMail, type: 'email', placeholder: 'contact@church.com' },
    { name: 'phoneNumber', label: 'Phone Number', icon: FiPhone, type: 'tel', placeholder: '+91 9136546325' },
    { name: 'pastorName', label: 'Pastor Name', icon: FiUser, type: 'text', placeholder: 'Pastor John' },
    { name: 'address', label: 'Address', icon: FiHome, type: 'text', placeholder: '123 Main Street' },
    { name: 'city', label: 'City', icon: FiMapPin, type: 'text', placeholder: 'Navi Mumbai' },
    { name: 'state', label: 'State', icon: FiGlobe, type: 'text', placeholder: 'IL' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 px-8 py-6">
            <Link to="/" className="text-white/80 hover:text-white inline-flex items-center mb-4">
              <FiArrowLeft className="mr-2" />
              Back to Home
            </Link>
            <h2 className="text-3xl font-bold text-white text-center">Register Your Church</h2>
            <p className="text-white/80 text-center mt-2">Join our community of churches</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8">
            <div className="grid md:grid-cols-2 gap-6">
              {inputFields.map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.name} className={field.name === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        placeholder={field.placeholder}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiUserPlus className="mr-2" />
                    Register Church
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By registering, you agree to our Terms of Service and Privacy Policy
              </p>
              <p className="mt-2 text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup