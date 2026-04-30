'use client'

import { useAuth } from '@/lib/auth-context'
import { ContractorDashboard } from '@/components/contractor-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  if (user.role === 'contractor') {
    return <ContractorDashboard user={user} />
  }

  return <AdminDashboard user={user} />
}
