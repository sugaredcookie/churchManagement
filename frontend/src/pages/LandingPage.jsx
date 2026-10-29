import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiUsers, FiShield, FiMail, FiArrowRight } from 'react-icons/fi'
import { GiChurch } from 'react-icons/gi'

const LandingPage = () => {
  const features = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Member Management',
      description: 'Easily manage church members, track attendance, and maintain communication.',
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with role-based access and data protection.',
    },
    {
      icon: <FiMail className="w-8 h-8" />,
      title: 'Automated Communication',
      description: 'Send automated emails, notifications, and updates to your congregation.',
    },
    {
      icon: <GiChurch className="w-8 h-8" />,
      title: 'Church Management',
      description: 'Complete tools for managing events, donations, and church operations.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-accent-100/50 blur-3xl" />
        <div className="relative">
          {/* Navbar */}
          <nav className="glass-effect fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <GiChurch className="w-8 h-8 text-primary-600" />
                  <span className="ml-2 text-xl font-bold gradient-text">ChurchMS</span>
                </div>
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="pt-32 pb-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">Modern Church</span>
                <br />
                <span className="text-gray-800">Management System</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Streamline your church operations with our comprehensive management platform.
                From member tracking to event management, we've got you covered.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:scale-105 inline-flex items-center"
                >
                  Start Free Trial
                  <FiArrowRight className="ml-2" />
                </Link>
                <button className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-all">
                  Learn More
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            {/* <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20"
            >
              {[
                { label: 'Happy Churches', value: '500+' },
                { label: 'Members Managed', value: '50K+' },
                { label: 'Countries', value: '25+' },
                { label: 'Support', value: '24/7' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                  <div className="text-gray-600 mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div> */}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your church effectively</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover-lift cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of churches already using our platform
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-600 rounded-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Sign Up Now
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage