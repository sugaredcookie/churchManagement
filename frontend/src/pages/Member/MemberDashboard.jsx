import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Navbar from '../../components/Layout/Navbar';
import aadhaarService from '../../services/aadhaarService';
import {
  FiUser,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiExternalLink,
  FiAlertCircle,
  FiLogOut,
  FiInfo,
  FiPhone
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [kyc, setKyc] = useState({ status: 'NOT_VERIFIED' });
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (user?.role && user.role !== 'member') {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'church') navigate('/church/dashboard');
      return;
    }
    fetchStatus();
  }, [user, navigate]);

  const fetchStatus = async () => {
    try {
      const res = await aadhaarService.getVerificationStatus();
      if (res.success) setKyc(res.data);
    } catch (err) {
      // Non-fatal — user may have no KYC record yet
      setKyc({ status: 'NOT_VERIFIED' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    setShowConsent(false);
    setVerifying(true);

    try {
      const res = await aadhaarService.initiateVerification(mobileNumber);

      if (!res.consentUrl) {
        throw new Error('No consent URL returned');
      }

      // Open DigiLocker in new tab
      window.open(res.consentUrl, '_blank', 'noopener,noreferrer');
      toast.success('Complete the verification in the DigiLocker tab');

      setKyc({ ...kyc, status: 'DIGILOCKER_PENDING' });

      // Poll for status updates
      const startTime = Date.now();
      const POLL_MS = 3000;
      const MAX_WAIT = 10 * 60 * 1000; // 10 min = DigiLocker link expiry

      const id = setInterval(async () => {
        if (Date.now() - startTime > MAX_WAIT) {
          clearInterval(id);
          setVerifying(false);
          toast.error('Verification link expired. Please try again.');
          return;
        }

        try {
          const statusRes = await aadhaarService.getVerificationStatus();
          if (!statusRes.success) return;

          setKyc(statusRes.data);
          const s = statusRes.data.status;

          if (s === 'VERIFIED') {
            clearInterval(id);
            setVerifying(false);
            toast.success('Identity verified successfully!');
          } else if (s === 'FAILED' || s === 'CONSENT_DENIED') {
            clearInterval(id);
            setVerifying(false);
            toast.error(
              s === 'CONSENT_DENIED'
                ? 'You denied consent. Verification cancelled.'
                : statusRes.data.failureReason || 'Verification failed.'
            );
          }
        } catch {
          // Ignore transient poll errors
        }
      }, POLL_MS);

      return () => clearInterval(id);
    } catch (err) {
      toast.error(err.message || 'Failed to start verification');
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
            <FiCheckCircle className="w-4 h-4 mr-1" /> Verified
          </span>
        );
      case 'DIGILOCKER_PENDING':
      case 'DIGILOCKER_INITIATED':
        return (
          <span className="flex items-center text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm">
            <FiClock className="w-4 h-4 mr-1" /> Awaiting DigiLocker
          </span>
        );
      case 'FAILED':
      case 'CONSENT_DENIED':
        return (
          <span className="flex items-center text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm">
            <FiXCircle className="w-4 h-4 mr-1" />
            {status === 'CONSENT_DENIED' ? 'Consent Denied' : 'Failed'}
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
            <FiAlertCircle className="w-4 h-4 mr-1" /> Not Verified
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FiUser className="w-8 h-8 text-primary-600 mr-3" />
                  Member Dashboard
                </h1>
                <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Identity Status</p>
                <div className="mt-1">{getStatusBadge(kyc.status)}</div>
              </div>
              {kyc.verifiedAt && (
                <div>
                  <p className="text-sm text-gray-500">Verified On</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(kyc.verifiedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {kyc.verifiedName && (
                <div>
                  <p className="text-sm text-gray-500">Verified Name</p>
                  <p className="text-gray-900 font-medium">{kyc.verifiedName}</p>
                </div>
              )}
              {kyc.maskedAadhaar && (
                <div>
                  <p className="text-sm text-gray-500">Aadhaar</p>
                  <p className="text-gray-900 font-medium">{kyc.maskedAadhaar}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Aadhaar Verification Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FiShield className="w-6 h-6 text-primary-600 mr-2" />
                Identity Verification
              </h2>
            </div>
            <div className="p-6">
              {kyc.status === 'VERIFIED' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-green-800 font-medium text-lg">Identity Verified</p>
                      <p className="text-green-600 text-sm">
                        Your identity has been verified via DigiLocker.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FiInfo className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-blue-800 text-sm font-medium">
                          Verification via DigiLocker (Government of India)
                        </p>
                        <p className="text-blue-700 text-sm mt-1">
                          You'll be redirected to DigiLocker to log in with your Aadhaar-linked mobile
                          and provide consent. Your Aadhaar number is <strong>never stored</strong> on
                          our servers.
                        </p>
                      </div>
                    </div>
                  </div>

                  {kyc.status === 'DIGILOCKER_PENDING' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                      <FiClock className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">Awaiting DigiLocker consent</p>
                        <p className="text-yellow-700 text-sm">
                          Complete the verification in the DigiLocker tab that opened.
                        </p>
                      </div>
                    </div>
                  )}

                  {kyc.status === 'CONSENT_DENIED' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <FiXCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Consent was denied</p>
                        <p className="text-red-700 text-sm">Click below to try again.</p>
                      </div>
                    </div>
                  )}

                  {kyc.status === 'FAILED' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <FiXCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-800 font-medium">Verification failed</p>
                        <p className="text-red-700 text-sm">
                          {kyc.failureReason || 'Please try again.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {kyc.status !== 'DIGILOCKER_PENDING' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number linked to DigiLocker
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '');
                              if (v.length <= 10) setMobileNumber(v);
                            }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                            disabled={verifying}
                          />
                        </div>
                        <button
                          onClick={() => setShowConsent(true)}
                          disabled={verifying || mobileNumber.length !== 10}
                          className={`flex items-center justify-center space-x-2 px-6 py-2 rounded-lg transition-all whitespace-nowrap ${
                            verifying || mobileNumber.length !== 10
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          <FiExternalLink className="w-4 h-4" />
                          <span>{verifying ? 'Waiting...' : 'Verify via DigiLocker'}</span>
                        </button>
                      </div>
                      {mobileNumber && mobileNumber.length > 0 && mobileNumber.length < 10 && (
                        <p className="text-xs text-red-500 mt-1">Please enter all 10 digits</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6"
          >
            <div className="flex items-start space-x-3 mb-4">
              <FiAlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Before you continue</h3>
                <p className="text-sm text-gray-600 mt-1">Please read the following:</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <ul className="text-sm text-amber-900 space-y-2">
                <li>• You will be redirected to <strong>DigiLocker</strong> (Government of India).</li>
                <li>• You'll log in with your Aadhaar-linked mobile number.</li>
                <li>• You'll be asked to share specific Aadhaar details (name, DOB, etc.).</li>
                <li>• Your full Aadhaar number is <strong>never stored</strong> by us.</li>
                <li>• Only your name and masked Aadhaar (last 4 digits) are saved.</li>
                <li>• Verification is handled by <strong>Cashfree Secure ID</strong>.</li>
                <li>• You may deny consent at any time.</li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              By clicking "I Agree & Continue" you provide explicit consent to share your Aadhaar
              information from DigiLocker for identity verification.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConsent(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStartVerification}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                I Agree & Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;