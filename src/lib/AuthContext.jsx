import React, { createContext, useState, useContext, useEffect } from 'react'
import { base44 } from '@/api/base44Client'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me()
      setUser(currentUser)
      setIsAuthenticated(true)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoadingAuth(false)
    }
  }

  const login = async (email, name) => {
    const u = await base44.auth.login(email, name)
    setUser(u)
    setIsAuthenticated(true)
  }

  const logout = (shouldRedirect = true) => {
    setUser(null)
    setIsAuthenticated(false)
    base44.auth.logout(shouldRedirect)
  }

  const navigateToLogin = () => {
    base44.auth.redirectToLogin()
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authError: null,
      isLoadingPublicSettings: false,
      appPublicSettings: null,
      authChecked: isAuthenticated,
      logout,
      navigateToLogin,
      checkUserAuth: checkAuth,
      checkAppState: checkAuth,
      login,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}