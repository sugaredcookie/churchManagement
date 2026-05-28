import api from './api'

const churchService = {
  getProfile: async () => {
    const response = await api.get('/church/profile')
    return response.data
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/church/profile', profileData)
    return response.data
  },
}

export default churchService