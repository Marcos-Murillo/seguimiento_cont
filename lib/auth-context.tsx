'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { type User, type UserRole } from './types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Convierte FirebaseUser + perfil de Firestore en nuestro tipo User
async function buildUser(fbUser: FirebaseUser): Promise<User> {
  const snap = await getDoc(doc(db, 'usuarios', fbUser.uid))
  if (snap.exists()) {
    const data = snap.data()
    return {
      id: fbUser.uid,
      email: fbUser.email ?? '',
      name: data.name ?? fbUser.displayName ?? '',
      role: (data.role as UserRole) ?? 'contractor',
      cedula: data.cedula,
      approvalStatus: data.approvalStatus ?? 'approved',
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    }
  }
  // Fallback si no existe perfil en Firestore
  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    name: fbUser.displayName ?? fbUser.email ?? '',
    role: 'contractor',
    approvalStatus: 'approved',
    createdAt: new Date(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Escucha cambios de sesión de Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const u = await buildUser(fbUser)
        setUser(u)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    return unsub
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const u = await buildUser(cred.user)
      setUser(u)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function getRoleName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    contractor: 'Contratista',
  }
  return names[role]
}
