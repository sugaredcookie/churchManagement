import api from './api'

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      // Ensure the response includes user data with role
      if (response.data.success) {
        return {
          success: true,
          token: response.data.token,
          user: response.data.data || response.data.user,
          data: response.data.data || response.data.user
        }
      }
      
      return response.data
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' }
    }
  },

  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default authService;