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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardSidebarProps {
  user: User
  open?: boolean
  onClose?: () => void
}

const contractorLinks = [
  { href: '/dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/contratos', label: 'Historial', icon: FileText },
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

export function DashboardSidebar({ user, open = false, onClose }: DashboardSidebarProps) {
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

  const handleLinkClick = () => {
    onClose?.()
  }

  // Sidebar desktop (siempre visible en pantallas grandes)
  const DesktopSidebar = () => (
    <TooltipProvider delayDuration={100}>
      <aside className="hidden lg:flex w-16 flex-col items-center py-6 gap-2 border-r border-border bg-background shrink-0">
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

  // Sidebar móvil (Sheet desplegable)
  const MobileSidebar = () => (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">Menú</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </Link>
            )
          })}

          <div className="h-px bg-border my-2" />

          <button
            onClick={() => {
              handleLogout()
              onClose?.()
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  )

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  )
}
