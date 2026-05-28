import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Layout/Navbar'
import adminService from '../../services/adminService'
import Modal from '../../components/Common/Modal'
import Button from '../../components/Common/Button'
import { FiEye, FiToggleLeft, FiToggleRight, FiTrash2, FiSearch, FiUser, FiMail, FiPhone } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ManageChurches = () => {
  const navigate = useNavigate()
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteModal, setDeleteModal] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadChurches()
  }, [currentPage, statusFilter])

  const loadChurches = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllChurches(currentPage, 10, statusFilter)
      setChurches(response.data)
      setTotalPages(response.pagination?.pages || 1)
    } catch (error) {
      toast.error('Failed to load churches')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (church) => {
    try {
      await adminService.toggleChurchStatus(church._id, !church.isActive)
      toast.success(`Church ${!church.isActive ? 'enabled' : 'disabled'} successfully`)
      loadChurches()
    } catch (error) {
      toast.error('Failed to update church status')
    }
  }

  const handleDelete = async (id) => {
    try {
      await adminService.deleteChurch(id)
      toast.success('Church deleted successfully')
      setDeleteModal(null)
      loadChurches()
    } catch (error) {
      toast.error('Failed to delete church')
    }
  }

  const filteredChurches = churches.filter(church =>
    church.churchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.pastorName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900">Manage Churches</h1>
            <p className="text-gray-600 mt-2">View, manage, and monitor all registered churches</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by church name, email, or pastor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </motion.div>

          {/* Churches List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredChurches.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Churches Found</h3>
                <p className="text-gray-600">No churches match your search criteria</p>
              </div>
            ) : (
              filteredChurches.map((church, idx) => (
                <motion.div
                  key={church._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{church.churchName}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${church.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {church.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {church.consentFormSubmitted && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            Consent Submitted
                          </span>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4" />
                          <span>Pastor: {church.pastorName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiMail className="w-4 h-4" />
                          <span>{church.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FiPhone className="w-4 h-4" />
                          <span>{church.phoneNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>{church.city}, {church.state}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/churches/${church._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(church)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={church.isActive ? 'Disable' : 'Enable'}
                      >
                        {church.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => setDeleteModal(church)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Church"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{deleteModal?.churchName}</strong>?
            This action cannot be undone and will permanently remove all associated data.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteModal._id)}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManageChurches