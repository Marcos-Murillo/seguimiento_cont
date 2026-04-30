'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { type User } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'

interface DashboardSidebarProps {
  user: User
}

const contractorLinks = [
  { href: '/dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/contratos', label: 'Mis Contratos', icon: FileText },
]

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/contratistas', label: 'Contratistas', icon: Users },
  { href: '/dashboard/aprobaciones', label: 'Aprobaciones', icon: UserCheck },
]

const superAdminLinks = [
  ...adminLinks,
  { href: '/dashboard/administradores', label: 'Administradores', icon: Settings },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const links =
    user.role === 'contractor'
      ? contractorLinks
      : user.role === 'super_admin'
        ? superAdminLinks
        : adminLinks

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="w-16 flex flex-col items-center py-6 gap-2 border-r border-border bg-background shrink-0">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                    isActive
                      ? 'bg-foreground text-background ring-2 ring-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-medium">
                {link.label}
              </TooltipContent>
            </Tooltip>
          )
        })}

        <div className="w-6 h-px bg-border my-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Cerrar sesión</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs font-medium">
            Cerrar sesión
          </TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}
