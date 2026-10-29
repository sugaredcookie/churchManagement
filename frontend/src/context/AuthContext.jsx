import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import toast from 'react-hot-toast';

// Create and export the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Set default auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const userData = response.data || response.user;
        const token = response.token;
        
        // Store user and token
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.name || userData.email}!`);
        
        // Return success with user data for role-based redirection
        return { 
          success: true, 
          user: userData,
          redirectTo: getRedirectPath(userData.role)
        };
      }
      
      return response;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (formData) => {
    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        toast.success('Church registered successfully! Please check your email for login credentials.');
        return { success: true };
      }
      
      return response;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'church':
        return '/church/dashboard';
      case 'member':
        return '/member/dashboard';
      default:
        return '/dashboard';
    }
  };

  const value = {
    user,
    setUser,
    loading,
    login,
    signup,
    logout,
    getRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth as a named export from here as well for convenience
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};