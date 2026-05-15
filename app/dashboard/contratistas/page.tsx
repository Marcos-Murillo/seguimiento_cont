'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Contractor, type EstadoCuota } from '@/lib/types'
import { createContractor, updateContractor, deleteContractor } from '@/lib/firebase-db'
import { fetchContractorsList } from '@/lib/contractor-utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ContractorStatusBadge } from '@/components/contratistas/contractor-display'
import { ContractorDetailPanel } from '@/components/contratistas/contractor-detail-panel'
import { NewContractDialog } from '@/components/contratistas/new-contract-dialog'
import { MoreHorizontal, Eye, Pencil, Trash2, Search, Plus, Filter } from 'lucide-react'
import { ESTADO_CUOTA_LABELS } from '@/lib/estado-utils'

export default function ContratistasPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    void fetchContractorsList().then((data) => {
      if (cancelled) return
      setContractors(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const loadContractors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchContractorsList()
      setContractors(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const filtered = contractors.filter((c) => {
    const matchSearch =
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cedula.includes(searchQuery) ||
      c.contratoNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.estadoCuota === statusFilter
    return matchSearch && matchStatus
  })

  const openView = (c: Contractor) => {
    setSelectedContractor(c)
    setDialogMode('view')
    setDialogOpen(true)
  }
  const openEdit = (c: Contractor) => {
    setSelectedContractor(c)
    setDialogMode('edit')
    setDialogOpen(true)
  }

  const handleSave = async (updated: Contractor) => {
    try {
      const previous = contractors.find((c) => c.id === updated.id)
      await updateContractor(updated.id, updated, previous)
      await loadContractors()
      alert('Contrato actualizado exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el contrato'
      alert(errorMessage)
      throw error
    }
  }

  const handleNew = async (c: Contractor) => {
    try {
      const { id: _id, ...data } = c
      void _id
      const newId = await createContractor(data)
      setContractors((prev) => [...prev, { ...c, id: newId }])
      alert('Contrato creado exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el contrato'
      alert(errorMessage)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este contrato?')) return
    try {
      await deleteContractor(id)
      setContractors((prev) => prev.filter((c) => c.id !== id))
      alert('Contrato eliminado exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el contrato'
      alert(errorMessage)
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Contratistas</h1>
          <p className="text-sm text-muted-foreground">Gestión de contratos</p>
        </div>
        <Button size="sm" onClick={() => setNewOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Nuevo Contrato
        </Button>
      </div>

      <Card className="flex-1 border-border/50 shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-semibold">Lista de Contratos</CardTitle>
              <CardDescription className="text-xs">{filtered.length} registros</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(Object.keys(ESTADO_CUOTA_LABELS) as EstadoCuota[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {ESTADO_CUOTA_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              Cargando contratos...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent text-xs">
                  <TableHead className="w-10 font-semibold">No.</TableHead>
                  <TableHead className="font-semibold">Cédula</TableHead>
                  <TableHead className="font-semibold">Contratista</TableHead>
                  <TableHead className="font-semibold">Contrato No.</TableHead>
                  <TableHead className="font-semibold text-center">Cuota</TableHead>
                  <TableHead className="font-semibold text-right">Total</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">F. Entrega</TableHead>
                  <TableHead className="font-semibold">F. Presupuesto</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-sm">
                      No se encontraron contratos
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id} className="text-sm">
                      <TableCell className="font-medium">{c.no}</TableCell>
                      <TableCell className="font-mono text-xs">{c.cedula}</TableCell>
                      <TableCell className="font-medium">{c.nombre}</TableCell>
                      <TableCell className="font-mono text-xs">{c.contratoNo}</TableCell>
                      <TableCell className="text-center">{c.cuotaNo}</TableCell>
                      <TableCell className="text-right">${c.total.toLocaleString('es-CO')}</TableCell>
                      <TableCell>
                        <ContractorStatusBadge status={c.estadoCuota} isEstadoCuota />
                      </TableCell>
                      <TableCell className="text-xs">{c.fechaEntrega}</TableCell>
                      <TableCell className="text-xs">{c.fechaEnvioPresupuesto}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openView(c)}>
                              <Eye className="mr-2 h-4 w-4" /> Ver información
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(c)}>
                              <Pencil className="mr-2 h-4 w-4" /> Actualizar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(c.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Borrar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ContractorDetailPanel
        key={dialogOpen && selectedContractor ? selectedContractor.id : 'closed'}
        contractor={selectedContractor}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
      <NewContractDialog open={newOpen} onOpenChange={setNewOpen} onSave={handleNew} />
    </div>
  )
}
