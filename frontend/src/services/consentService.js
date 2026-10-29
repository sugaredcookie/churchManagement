import api from './api'

const consentService = {
  getConsent: async () => {
    try {
      const response = await api.get('/consent')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  createConsent: async (data) => {
    try {
      const response = await api.post('/consent', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  updateConsent: async (data) => {
    try {
      const response = await api.put('/consent', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default consentService