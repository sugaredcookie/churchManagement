import api from './api';

const aadhaarService = {
  /**
   * Initiate DigiLocker-based Aadhaar verification.
   * @param {string} mobileNumber - 10-digit mobile number linked to DigiLocker
   */
  initiateVerification: async (mobileNumber) => {
    try {
      const response = await api.post('/aadhaar/initiate', { mobileNumber });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  /**
   * Get current KYC / verification status.
   */
  getVerificationStatus: async () => {
    try {
      const response = await api.get('/aadhaar/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  }
};

export default aadhaarService;