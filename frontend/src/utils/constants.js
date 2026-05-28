export const USER_ROLES = {
  CHURCH: 'church',
  ADMIN: 'admin',
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
  },
  CHURCH: {
    PROFILE: '/church/profile',
    UPDATE_PROFILE: '/church/profile',
  },
  CONSENT: {
    GET: '/consent',
    CREATE: '/consent',
    UPDATE: '/consent',
  },
  ADMIN: {
    CHURCHES: '/admin/churches',
    CREATE_ADMIN: '/admin/create-admin',
  },
}

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}

export const MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  SIGNUP_SUCCESS: 'Account created successfully! Check your email for password.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  CONSENT_SUBMIT_SUCCESS: 'Consent form submitted successfully',
  CONSENT_UPDATE_SUCCESS: 'Consent form updated successfully',
  ADMIN_CREATE_SUCCESS: 'Admin created successfully',
  CHURCH_DELETE_SUCCESS: 'Church deleted successfully',
  CHURCH_STATUS_UPDATE_SUCCESS: 'Church status updated successfully',
}