const axios = require('axios');
const crypto = require('crypto');

class AadhaarService {
  constructor() {
    this.clientId = process.env.CASHFREE_CLIENT_ID;
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET;
    this.environment = process.env.CASHFREE_ENV || 'sandbox';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Cashfree credentials not configured');
    }

    this.baseUrl = this.environment === 'production'
      ? 'https://api.cashfree.com/verification'
      : 'https://sandbox.cashfree.com/verification';
  }

  getHeaders() {
    return {
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret,
      'Content-Type': 'application/json'
    };
  }

  async verifyAccount(verificationId, mobileNumber) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/digilocker/verify-account`,
        {
          verification_id: verificationId,
          mobile_number: mobileNumber
        },
        { headers: this.getHeaders() }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify DigiLocker account'
      };
    }
  }

  /**
   * Generate the DigiLocker consent URL.
   * Cashfree API: Create URL [citation:1]
   * URL is valid for 10 minutes.
   */
  async createConsentUrl(verificationId) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/digilocker`,
        {
          verification_id: verificationId,
          document_requested: ['AADHAAR']
        },
        { headers: this.getHeaders() }
      );
      return { success: true, url: response.data.url, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create consent URL'
      };
    }
  }

  /**
   * Get verification status by verification_id.
   * Cashfree API: Get Verification Status [citation:1]
   */
  async getStatus(verificationId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/digilocker/status`,
        {
          params: { verification_id: verificationId },
          headers: this.getHeaders()
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get status'
      };
    }
  }

  /**
   * Fetch the verified document once status is AUTHENTICATED.
   * Cashfree API: Get Document [citation:1]
   */
  async getDocument(verificationId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/digilocker/document`,
        {
          params: { verification_id: verificationId },
          headers: this.getHeaders()
        }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to retrieve document'
      };
    }
  }
}

module.exports = new AadhaarService();