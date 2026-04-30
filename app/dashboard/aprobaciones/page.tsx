'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { SidePanel, SidePanelContent, SidePanelHeader, SidePanelTitle, SidePanelDescription } from '@/components/ui/side-panel'
import { Empty } from '@/components/ui/empty'
import { Search, UserCheck, UserX, Clock, CheckCircle, XCircle, Users, Mail, Hash, ShieldCheck, Calendar } from 'lucide-react'

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Solicitud {
  id: string
  name: string
  email: string
  cedula: string
  password: string
  status: string
  createdAt: unknown
}

interface ApprovedUser {
  id: string
  name: string
  email: string
  cedula?: string
  role: string
  approvalStatus: string
  createdAt: unknown
  lastLogin: unknown
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(ts: unknown) {
  if (!ts) return '—'
  try {
    let ms: number
    if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
      ms = (ts as { seconds: number }).seconds * 1000
    } else if (typeof ts === 'string' || typeof ts === 'number') {
      ms = new Date(ts).getTime()
    } else return '—'
    if (isNaN(ms)) return '—'
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(ms))
  } catch { return '—' }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function Field({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      <div className="text-sm font-semibold text-foreground">{value || '—'}</div>
    </div>
  )
}

// ── Panel detalle usuario aprobado ───────────────────────────────────────────
function UserDetailPanel({ user, open, onClose }: { user: ApprovedUser | null; open: boolean; onClose: () => void }) {
  if (!user) return null
  return (
    <SidePanel open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SidePanelContent>
        <SidePanelHeader>
          <div className="flex items-center gap-3 pr-8">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SidePanelTitle className="text-xl font-bold">{user.name}</SidePanelTitle>
              <SidePanelDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400 text-xs">
                  Aprobado
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{user.cedula}</span>
              </SidePanelDescription>
            </div>
          </div>
        </SidePanelHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Users className="h-4 w-4 shrink-0" />
              <span className="text-sm font-bold uppercase tracking-wider">Información Personal</span>
            </div>
            <div className="grid grid-cols-2 gap-4 px-1">
              <Field icon={Hash} label="Cédula" value={user.cedula} />
              <Field icon={Mail} label="Correo electrónico" value={user.email} />
              <Field icon={ShieldCheck} label="Rol" value={user.role === 'contractor' ? 'Contratista' : user.role} />
              <Field icon={ShieldCheck} label="Estado" value={
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400 text-xs">
                  {user.approvalStatus === 'approved' ? 'Aprobado' : user.approvalStatus}
                </Badge>
              } />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="text-sm font-bold uppercase tracking-wider">Actividad</span>
            </div>
            <div className="grid grid-cols-2 gap-4 px-1">
              <Field icon={Calendar} label="Fecha de registro" value={formatDate(user.createdAt)} />
              <Field icon={Calendar} label="Último acceso" value={formatDate(user.lastLogin)} />
            </div>
          </div>
        </div>
      </SidePanelContent>
    </SidePanel>
  )
}

// ── Panel lista usuarios aprobados ───────────────────────────────────────────
function ApprovedUsersPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [users, setUsers] = useState<ApprovedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ApprovedUser | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/usuarios')
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [open])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.cedula ?? '').includes(search)
  )

  return (
    <>
      <SidePanel open={open} onOpenChange={v => { if (!v) onClose() }}>
        <SidePanelContent>
          <SidePanelHeader>
            <div className="pr-8">
              <SidePanelTitle className="text-xl font-bold">Usuarios Aprobados</SidePanelTitle>
              <SidePanelDescription className="mt-1 text-sm text-muted-foreground">
                Contratistas con acceso al sistema
              </SidePanelDescription>
              <div className="relative mt-3">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o cédula..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
          </SidePanelHeader>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Cargando usuarios...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                <Users className="h-8 w-8 opacity-40" />
                <p className="text-sm">Sin resultados</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setSelected(u); setDetailOpen(true) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors text-left"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {getInitials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{u.cedula || u.email}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto shrink-0 bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400 text-[10px]">
                      Activo
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </SidePanelContent>
      </SidePanel>

      <UserDetailPanel
        user={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function AprobacionesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<Solicitud | null>(null)
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null)
  const [processing, setProcessing] = useState(false)
  const [approvedPanelOpen, setApprovedPanelOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/solicitudes')
      const data = await res.json()
      setSolicitudes(data.items ?? [])
    } catch {
      setSolicitudes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = solicitudes.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cedula?.includes(searchQuery)
  )

  const confirmAction = async () => {
    if (!selected || !dialogAction) return
    setProcessing(true)
    try {
      if (dialogAction === 'approve') {
        await fetch('/api/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selected.name,
            email: selected.email,
            password: selected.password,
            role: 'contractor',
            cedula: selected.cedula,
          }),
        })
      }
      await fetch('/api/solicitudes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: dialogAction === 'approve' ? 'approved' : 'rejected' }),
      })
      setSolicitudes(prev => prev.filter(s => s.id !== selected.id))
    } finally {
      setProcessing(false)
      setSelected(null)
      setDialogAction(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aprobaciones Pendientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las solicitudes de acceso de nuevos contratistas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setApprovedPanelOpen(true)}>
          <Users className="mr-1.5 h-4 w-4" /> Ver usuarios aprobados
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{solicitudes.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Solicitudes por revisar</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aprobados hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-0.5">Usuarios aprobados hoy</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rechazados hoy</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-0.5">Usuarios rechazados hoy</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Solicitudes Pendientes</CardTitle>
              <CardDescription className="text-xs">{filtered.length} solicitudes</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Cargando solicitudes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10">
              <Empty>
                <Empty.Icon><UserCheck className="h-10 w-10" /></Empty.Icon>
                <Empty.Title>No hay solicitudes pendientes</Empty.Title>
                <Empty.Description>Todas las solicitudes han sido procesadas.</Empty.Description>
              </Empty>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent text-xs">
                  <TableHead className="font-semibold">Usuario</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Cédula</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="text-sm">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(s.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="font-mono text-xs">{s.cedula || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-400/30 dark:text-yellow-400 text-xs">
                        Pendiente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm"
                          onClick={() => { setSelected(s); setDialogAction('approve') }}
                          className="h-7 text-xs text-green-700 hover:bg-green-500/10 border-green-400/30 dark:text-green-400">
                          <UserCheck className="mr-1 h-3.5 w-3.5" /> Aprobar
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => { setSelected(s); setDialogAction('reject') }}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 border-destructive/30">
                          <UserX className="mr-1 h-3.5 w-3.5" /> Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!dialogAction} onOpenChange={() => { setDialogAction(null); setSelected(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'approve' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'approve'
                ? `Se creará el acceso para ${selected?.name}. Podrá ingresar con su correo y la contraseña que eligió.`
                : `Se rechazará la solicitud de ${selected?.name}. No podrá acceder al sistema.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={processing}
              className={dialogAction === 'reject' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              {processing ? 'Procesando...' : dialogAction === 'approve' ? 'Aprobar' : 'Rechazar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApprovedUsersPanel open={approvedPanelOpen} onClose={() => setApprovedPanelOpen(false)} />
    </div>
  )
}
