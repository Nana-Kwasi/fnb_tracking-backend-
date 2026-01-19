import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      const parsedUser = JSON.parse(userData)
      // Ensure fNumber exists (handle old data structure)
      if (!parsedUser.fNumber && parsedUser.username) {
        // If old structure exists, clear it and require re-login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      } else {
        setUser(parsedUser)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { username, password })
      // Handle both camelCase (fNumber) and lowercase (fnumber) from backend
      const fNumber = response.data.fNumber || response.data.fnumber || response.data.f_number
      const { token, role } = response.data
      
      if (!fNumber) {
        console.error('fNumber not found in response:', response.data)
      }
      
      localStorage.setItem('token', token)
      const userData = { fNumber, role }
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      return { success: true }
    } catch (error) {
      // Check if account is suspended (403 status)
      if (error.response?.status === 403) {
        return { success: false, suspended: true, error: 'Account suspended' }
      }
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
