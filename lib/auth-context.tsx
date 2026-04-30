'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type User, type UserRole } from './types'


interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for development - will be replaced with Firebase
const mockUsers: Record<string, { password: string; user: User }> = {
  'superadmin@empresa.com': {
    password: 'admin123',
    user: {
      id: 'super-1',
      email: 'superadmin@empresa.com',
      name: 'Super Administrador',
      role: 'super_admin',
      approvalStatus: 'approved',
      createdAt: new Date()
    }
  },
  'admin@empresa.com': {
    password: 'admin123',
    user: {
      id: 'admin-1',
      email: 'admin@empresa.com',
      name: 'Administrador',
      role: 'admin',
      approvalStatus: 'approved',
      createdAt: new Date()
    }
  },
  'contratista@empresa.com': {
    password: 'contra123',
    user: {
      id: '1',
      email: 'contratista@empresa.com',
      name: 'Juan Carlos Pérez García',
      role: 'contractor',
      cedula: '1234567890',
      approvalStatus: 'approved',
      createdAt: new Date()
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockUser = mockUsers[email.toLowerCase()]
    
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user)
      setIsLoading(false)
      return true
    }
    
    setIsLoading(false)
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
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

export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    contractor: 'Contratista'
  }
  return roleNames[role]
}
