'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Plus, MoreHorizontal, Trash2, Shield, ShieldCheck, AlertCircle } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'super_admin'
  createdAt: { seconds: number } | null
  lastLogin: { seconds: number } | null
}

function formatDate(ts: unknown) {
  if (!ts) return 'Nunca'
  try {
    let ms: number
    if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
      ms = (ts as { seconds: number }).seconds * 1000
    } else if (typeof ts === 'string' || typeof ts === 'number') {
      ms = new Date(ts).getTime()
    } else {
      return 'Nunca'
    }
    if (isNaN(ms)) return 'Nunca'
    return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(ms))
  } catch {
    return 'Nunca'
  }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function AdministradoresPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admins')
      const data = await res.json()
      if (!res.ok) {
        console.error('Error cargando admins:', data)
        setAdmins([])
      } else {
        setAdmins(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetch admins:', err)
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = admins.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear'); return }
      setAdmins(prev => [{ ...data, createdAt: null, lastLogin: null }, ...prev])
      setForm({ name: '', email: '', password: '' })
      setDialogOpen(false)
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (admin: AdminUser) => {
    if (admin.role === 'super_admin') return
    if (!confirm(`¿Eliminar a ${admin.name}?`)) return
    try {
      await fetch('/api/admins', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: admin.id }),
      })
      setAdmins(prev => prev.filter(a => a.id !== admin.id))
    } catch {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administradores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona los usuarios administradores del sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); setError('') }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> Nuevo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Administrador</DialogTitle>
              <DialogDescription>El nuevo admin podrá gestionar contratistas y aprobaciones.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" placeholder="Nombre del administrador"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="admin@empresa.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña temporal</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={saving || !form.name || !form.email || form.password.length < 6}>
                {saving ? 'Creando...' : 'Crear Administrador'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Super Administradores</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{admins.filter(a => a.role === 'super_admin').length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Acceso completo al sistema</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{admins.filter(a => a.role === 'admin').length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Gestión de contratistas</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Lista de Administradores</CardTitle>
              <CardDescription className="text-xs">{filtered.length} registros</CardDescription>
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Cargando administradores...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent text-xs">
                  <TableHead className="font-semibold">Administrador</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Rol</TableHead>
                  <TableHead className="font-semibold">Creado</TableHead>
                  <TableHead className="font-semibold">Último acceso</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
                      No hay administradores registrados
                    </TableCell>
                  </TableRow>
                ) : filtered.map(admin => (
                  <TableRow key={admin.id} className="group text-sm">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(admin.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{admin.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        admin.role === 'super_admin'
                          ? 'bg-primary/10 text-primary border-primary/30 text-xs'
                          : 'bg-muted text-muted-foreground border-border text-xs'
                      }>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(admin.createdAt)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(admin.lastLogin)}</TableCell>
                    <TableCell>
                      {admin.role !== 'super_admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(admin)}
                              className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
