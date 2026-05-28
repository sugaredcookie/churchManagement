import api from './api'

const consentService = {
  getConsent: async () => {
    const response = await api.get('/consent')
    return response.data
  },
  
  createConsent: async (consentData) => {
    const response = await api.post('/consent', consentData)
    return response.data
  },
  
  updateConsent: async (consentData) => {
    const response = await api.put('/consent', consentData)
    return response.data
  },
}

export default consentService