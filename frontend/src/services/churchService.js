import api from './api'

const churchService = {
  // Get church profile
  getProfile: async () => {
    try {
      const response = await api.get('/church/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update church profile
  updateProfile: async (data) => {
    try {
      const response = await api.patch('/church/profile', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get all members of the church
  getMembers: async () => {
    try {
      const response = await api.get('/church/members')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Add a new member
  addMember: async (data) => {
    try {
      const response = await api.post('/church/members', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get a specific member
  getMember: async (memberId) => {
    try {
      const response = await api.get(`/church/members/${memberId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Update a member
  updateMember: async (memberId, data) => {
    try {
      const response = await api.patch(`/church/members/${memberId}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Delete a member
  deleteMember: async (memberId) => {
    try {
      const response = await api.delete(`/church/members/${memberId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default churchService