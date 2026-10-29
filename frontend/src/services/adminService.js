import api from './api'

const adminService = {
  getAllChurches: async (page = 1, limit = 10, status = '') => {
    const params = new URLSearchParams({ page, limit })
    if (status && status !== 'all') params.append('status', status)
    const response = await api.get(`/admin/churches?${params}`)
    return response.data
  },
  
  getChurchById: async (id) => {
    const response = await api.get(`/admin/churches/${id}`)
    return response.data
  },
  
  toggleChurchStatus: async (id, isActive) => {
    const response = await api.patch(`/admin/churches/${id}/status`, { isActive })
    return response.data
  },
  
  deleteChurch: async (id) => {
    const response = await api.delete(`/admin/churches/${id}`)
    return response.data
  },
  
  createAdmin: async (adminData) => {
    const response = await api.post('/admin/create-admin', adminData)
    return response.data
  },
}

export default adminService