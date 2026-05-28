import React, { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import authService from '../services/authService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { token, user } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      toast.success('Welcome back!')
      navigate('/dashboard')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  }

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData)
      const { token, user } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      toast.success('Account created! Check your email for password.')
      navigate('/consent')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}