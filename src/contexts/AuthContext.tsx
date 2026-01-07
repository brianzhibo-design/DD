'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth')
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
      return data.authenticated
    } catch {
      setIsAuthenticated(false)
      return false
    }
  }

  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false))
  }, [])

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        return { success: true }
      }
      
      return { success: false, error: data.error || '登录失败' }
    } catch {
      return { success: false, error: '网络错误' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' })
    } finally {
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

