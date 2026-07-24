import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const bootstrapSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await authService.getSession()
      const sessionUser = response?.data?.user || null
      setUser(sessionUser)
      return sessionUser
    } catch (err) {
      setUser(null)
      setError(null) // Don't show error for initial session check
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    bootstrapSession()
  }, [bootstrapSession])

  const login = useCallback(async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      const sessionUser = response?.data?.user || null
      setUser(sessionUser)
      return response
    } catch (err) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    setLoading(true)
    try {
      const response = await authService.register(payload)
      const sessionUser = response?.data?.user || null
      setUser(sessionUser)
      return response
    } catch (err) {
      setError(err.message || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    try {
      await authService.logout()
    } catch (err) {
      // Logout should work even if the server call fails
    } finally {
      setUser(null)
    }
  }, [])

  const logoutAll = useCallback(async () => {
    setError(null)
    try {
      await authService.logoutAll()
    } catch (err) {
      // Continue even if server call fails
    } finally {
      setUser(null)
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    setError(null)
    try {
      const response = await authService.forgotPassword(email)
      return response
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
      throw err
    }
  }, [])

  const resetPassword = useCallback(async (userId, secret, password, confirmPassword) => {
    setError(null)
    try {
      const response = await authService.resetPassword(userId, secret, password, confirmPassword)
      return response
    } catch (err) {
      setError(err.message || 'Password reset failed')
      throw err
    }
  }, [])

  const sendVerification = useCallback(async () => {
    setError(null)
    try {
      const response = await authService.sendVerificationEmail()
      return response
    } catch (err) {
      setError(err.message || 'Failed to send verification email')
      throw err
    }
  }, [])

  const confirmVerification = useCallback(async (userId, secret) => {
    setError(null)
    try {
      const response = await authService.confirmVerification(userId, secret)
      return response
    } catch (err) {
      setError(err.message || 'Email verification failed')
      throw err
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    setError(null)
    try {
      const response = await authService.updateProfile(data)
      if (response?.data?.user) {
        setUser(prev => ({ ...prev, ...response.data.user }))
      }
      return response
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      throw err
    }
  }, [])

  const refreshUser = useCallback(async () => {
    setError(null)
    try {
      const response = await authService.getMe()
      const currentUser = response?.data?.user || null
      setUser(currentUser)
      return currentUser
    } catch (err) {
      setUser(null)
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isAuthenticated = !!user

  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
    sendVerification,
    confirmVerification,
    updateProfile,
    refreshUser,
    clearError,
    bootstrapSession,
  }), [
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    logoutAll,
    forgotPassword,
    resetPassword,
    sendVerification,
    confirmVerification,
    updateProfile,
    refreshUser,
    clearError,
    bootstrapSession,
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
