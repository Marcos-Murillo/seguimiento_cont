'use client'

import { useState, useEffect, useCallback } from 'react'
import { type Contractor, type EstadoCuota } from '@/lib/types'
import { getContractors, createContractor, updateContractor, deleteContractor } from '@/lib/firebase-db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { SidePanel, SidePanelContent, SidePanelHeader, SidePanelFooter, SidePanelTitle, SidePanelDescription } from '@/components/ui/side-panel'
import { PaymentHistoryPanel } from '@/components/payment-history-panel'
import {
  MoreHorizontal, Eye, Pencil, Trash2, Search, Plus, Filter, ExternalLink,
  CheckCircle, XCircle, Clock, User, FileText, CreditCard, ClipboardList,
  FolderOpen, Landmark, MessageSquare, Hash, Calendar, UserCheck2,
  Link2, ShieldCheck, Receipt, History,
} from 'lucide-react'
import { getEstadoCuotaLabel, getEstadoCuotaColor, ESTADO_CUOTA_LABELS } from '@/lib/estado-utils'

void 0 // removed mock imports

function getStatusBadge(status: string, isEstadoCuota = false) {
  if (isEstadoCuota) {
    const label = getEstadoCuotaLabel(status as EstadoCuota)
    const className = getEstadoCuotaColor(status as EstadoCuota)
    return <Badge variant="outline" className={className}>{label}</Badge>
  }
  
  const map: Record<string, { label: string; className: string }> = {
    activo:     { label: 'Activo',     className: 'bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400' },
    inactivo:   { label: 'Inactivo',   className: 'bg-muted text-muted-foreground border-border' },
    suspendido: { label: 'Suspendido', className: 'bg-red-500/10 text-red-700 border-red-400/30 dark:text-red-400' },
  }
  const cfg = map[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
}

function getProcessIcon(status: string) {
  const s = status.toLowerCase()
  if (s === 'aprobado') return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
  if (s === 'rechazado') return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
}

type FormData = Omit<Contractor, 'id' | 'no'>

const emptyForm = (): FormData => ({
  cedula: '', nombre: '', contratoNo: '', objetoContractual: '', egreso: '',
  cuotaNo: 1, total: 0, informeSupervision: '', deuv: '',
  seguimientoSP: { noCP: '', noSP: '', fechaElaboracion: '' },
  consolidacionDocumentos: { fechaElaboracion: '', fecha: '' },
  fechaEnvioPresupuesto: '', fechaEntrega: '', fechaElaboracionDFUV: '', fechaAprobacion: '',
  contratacionCRD: { fechaRemisionInformes: '', doc: '', enlace: '' },
  supervisor: '', estadoCuota: 'pendiente', estadoCuenta: 'activo',
  observaciones: '', revisado: false, valorCuota: 0,
  documentosBase: { poliza: '', evidencias: '', pactadas: '' },
  procesoPago: { cuenta979001: '', cuenta979003: '', cuenta979005: '', cuenta979006: '' },
})

// ─── ContractorDialog (diseño unificado vista + edición) ─────────────────────
function ContractorDialog({ contractor, mode, open, onOpenChange, onSave }: {
  contractor: Contractor | null
  mode: 'view' | 'edit'
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave?: (data: Contractor) => void
}) {
  const [editing, setEditing] = useState(mode === 'edit')
  const [form, setForm] = useState<Contractor | null>(contractor)
  const [historialOpen, setHistorialOpen] = useState(false)

  if (contractor && form?.id !== contractor.id) { setForm(contractor); setHistorialOpen(false) }
  if (!form) return null

  const set = (field: keyof Contractor, value: unknown) =>
    setForm(prev => prev ? { ...prev, [field]: value } : prev)

  const SH = ({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
    </div>
  )

  const F = ({ label, value, field, icon: Icon, span2, span3, children }: {
    label: string; value?: string | number; field?: keyof Contractor
    icon?: React.ElementType; span2?: boolean; span3?: boolean; children?: React.ReactNode
  }) => (
    <div className={span3 ? 'col-span-3' : span2 ? 'col-span-2' : ''}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      {children ? (
        <div className="text-base font-semibold text-foreground leading-snug">{children}</div>
      ) : editing && field ? (
        <Input className="h-8 text-sm" value={String(value ?? '')} onChange={e => set(field, e.target.value)} />
      ) : (
        <div className="text-base font-semibold text-foreground leading-snug">{value || '—'}</div>
      )}
    </div>
  )

  return (
    <SidePanel open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setHistorialOpen(false) }}>
      <SidePanelContent>
        {/* Sub-panel historial */}
        <PaymentHistoryPanel
          open={historialOpen}
          onClose={() => setHistorialOpen(false)}
          historial={form.historialCuotas ?? []}
          nombreContratista={form.nombre}
        />

        <SidePanelHeader>
          <div className="flex items-start gap-3 pr-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistorialOpen(v => !v)}
                    className="h-7 px-2.5 text-xs gap-1.5 border-amber-400/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                  >
                    <History className="h-3.5 w-3.5" />
                    Historial
                  </Button>
                </div>
                {!editing && (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Actualizar
                  </Button>
                )}
              </div>
              <SidePanelTitle className="text-xl font-bold leading-tight mt-1">{form.nombre}</SidePanelTitle>
              <SidePanelDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-sm font-medium">{form.contratoNo}</span>
                <span className="text-muted-foreground">·</span>
                {getStatusBadge(form.estadoCuenta)}
                <span className="text-muted-foreground">·</span>
                {getStatusBadge(form.estadoCuota, true)}
              </SidePanelDescription>
            </div>
          </div>
        </SidePanelHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            <div className="space-y-3">
              <SH icon={User} title="Datos Generales" color="bg-blue-500/10 text-blue-700 dark:text-blue-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                <F icon={Hash} label="No." value={form.no} />
                <F icon={Hash} label="Cédula" value={form.cedula} field="cedula" />
                <F icon={User} label="Nombre Completo" value={form.nombre} field="nombre" span3 />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={FileText} title="Información Contractual" color="bg-purple-500/10 text-purple-700 dark:text-purple-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                <F icon={FileText} label="Contrato No." value={form.contratoNo} field="contratoNo" />
                <F icon={Receipt} label="Egreso" value={form.egreso} field="egreso" />
                <F icon={ClipboardList} label="Objeto Contractual" value={form.objetoContractual} field="objetoContractual" span3 />
                <F icon={UserCheck2} label="Supervisor" value={form.supervisor} field="supervisor" span3 />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={CreditCard} title="Estado de Pagos" color="bg-green-500/10 text-green-700 dark:text-green-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                {/* Campo Cuota No. con Select */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Cuota No.</p>
                  </div>
                  {editing ? (
                    <Select value={String(form.cuotaNo)} onValueChange={v => set('cuotaNo', Number(v))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: form.numeroCuotas || Math.ceil(form.total / form.valorCuota) }, (_, i) => i + 1).map(n => (
                          <SelectItem key={n} value={String(n)}>
                            Cuota {n}
                            {n === form.cuotaNo && ' (Actual)'}
                            {form.historialCuotas?.some(h => h.cuotaNo === n && h.estadoCuota === 'pagado') && ' ✓'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.cuotaNo}</div>
                  )}
                </div>
                <F icon={CreditCard} label="Valor Cuota" value={form.valorCuota.toLocaleString('es-CO')} field="valorCuota" />
                <F icon={CreditCard} label="Total" value={form.total.toLocaleString('es-CO')} field="total" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado Cuota</p>
                  {editing ? (
                    <Select value={form.estadoCuota} onValueChange={v => set('estadoCuota', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ESTADO_CUOTA_LABELS) as EstadoCuota[]).map(s => 
                          <SelectItem key={s} value={s}>{ESTADO_CUOTA_LABELS[s]}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  ) : <div className="text-base font-semibold">{getStatusBadge(form.estadoCuota, true)}</div>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado Cuenta</p>
                  {editing ? (
                    <Select value={form.estadoCuenta} onValueChange={v => set('estadoCuenta', v)}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{['activo','inactivo','suspendido'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : <div className="text-base font-semibold">{getStatusBadge(form.estadoCuenta)}</div>}
                </div>
                <F icon={ShieldCheck} label="Revisado">
                  <Badge variant={form.revisado ? 'default' : 'secondary'}>{form.revisado ? 'Sí' : 'No'}</Badge>
                </F>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={ClipboardList} title="Seguimiento Documental" color="bg-orange-500/10 text-orange-700 dark:text-orange-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                <F icon={ClipboardList} label="Informe Supervisión" value={form.informeSupervision} field="informeSupervision" />
                <F icon={FileText} label="DEUV" value={form.deuv} field="deuv" />
                <F icon={Calendar} label="Fecha Elaboración DFUV" value={form.fechaElaboracionDFUV} field="fechaElaboracionDFUV" />
                <F icon={Calendar} label="Fecha Aprobación" value={form.fechaAprobacion || (editing ? '' : 'Pendiente')} field="fechaAprobacion" />
                
                {/* No. CP - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">No. CP</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.seguimientoSP.noCP} 
                      onChange={e => setForm(prev => prev ? { ...prev, seguimientoSP: { ...prev.seguimientoSP, noCP: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.seguimientoSP.noCP || '—'}</div>
                  )}
                </div>

                {/* No. SP - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">No. SP</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.seguimientoSP.noSP} 
                      onChange={e => setForm(prev => prev ? { ...prev, seguimientoSP: { ...prev.seguimientoSP, noSP: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.seguimientoSP.noSP || '—'}</div>
                  )}
                </div>

                {/* Fecha Elaboración SP - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Fecha Elaboración SP</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.seguimientoSP.fechaElaboracion} 
                      onChange={e => setForm(prev => prev ? { ...prev, seguimientoSP: { ...prev.seguimientoSP, fechaElaboracion: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.seguimientoSP.fechaElaboracion || '—'}</div>
                  )}
                </div>

                <F icon={Calendar} label="Fecha Envío Presupuesto" value={form.fechaEnvioPresupuesto} field="fechaEnvioPresupuesto" />
                <F icon={Calendar} label="Fecha Entrega" value={form.fechaEntrega} field="fechaEntrega" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={Landmark} title="Contratación CRD" color="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                {/* Fecha Remisión de Informes - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Fecha Remisión de Informes</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.contratacionCRD.fechaRemisionInformes} 
                      onChange={e => setForm(prev => prev ? { ...prev, contratacionCRD: { ...prev.contratacionCRD, fechaRemisionInformes: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.contratacionCRD.fechaRemisionInformes || '—'}</div>
                  )}
                </div>

                {/* DOC - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">DOC</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.contratacionCRD.doc} 
                      onChange={e => setForm(prev => prev ? { ...prev, contratacionCRD: { ...prev.contratacionCRD, doc: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.contratacionCRD.doc || '—'}</div>
                  )}
                </div>

                {/* Enlace - ahora editable */}
                <div className="col-span-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Enlace</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.contratacionCRD.enlace} 
                      onChange={e => setForm(prev => prev ? { ...prev, contratacionCRD: { ...prev.contratacionCRD, enlace: e.target.value } } : prev)} 
                      placeholder="https://..." />
                  ) : form.contratacionCRD.enlace ? (
                    <a href={form.contratacionCRD.enlace} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1.5 text-base font-semibold">
                      Ver documento <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">—</div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={FolderOpen} title="Documentos Base — Póliza" color="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                {/* Póliza - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Póliza</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.documentosBase.poliza} 
                      onChange={e => setForm(prev => prev ? { ...prev, documentosBase: { ...prev.documentosBase, poliza: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.documentosBase.poliza || '—'}</div>
                  )}
                </div>

                {/* Evidencias - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Evidencias</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.documentosBase.evidencias} 
                      onChange={e => setForm(prev => prev ? { ...prev, documentosBase: { ...prev.documentosBase, evidencias: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.documentosBase.evidencias || '—'}</div>
                  )}
                </div>

                {/* Pactadas - ahora editable */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Pactadas</p>
                  </div>
                  {editing ? (
                    <Input className="h-8 text-sm" value={form.documentosBase.pactadas} 
                      onChange={e => setForm(prev => prev ? { ...prev, documentosBase: { ...prev.documentosBase, pactadas: e.target.value } } : prev)} />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.documentosBase.pactadas || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={Landmark} title="Proceso de Pago" color="bg-pink-500/10 text-pink-700 dark:text-pink-400" />
              <div className="grid grid-cols-2 gap-3 px-1">
                {Object.entries(form.procesoPago).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
                    {getProcessIcon(val)}
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">{key}</p>
                      <p className="text-base font-semibold">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <SH icon={MessageSquare} title="Observaciones" color="bg-muted text-muted-foreground" />
              {editing ? (
                <Input className="text-sm" value={form.observaciones} onChange={e => set('observaciones', e.target.value)} />
              ) : (
                <p className="text-base text-foreground leading-relaxed px-1">{form.observaciones || 'Sin observaciones registradas.'}</p>
              )}
            </div>

          </div>
        </div>

        {editing && (
          <SidePanelFooter>
            <Button variant="outline" onClick={() => { setEditing(false); setForm(contractor) }}>Cancelar</Button>
            <Button onClick={async () => { 
              try {
                await onSave?.(form)
                setEditing(false)
                onOpenChange(false)
              } catch (error) {
                // El error ya se mostró en handleSave, solo evitamos cerrar el dialog
                console.error('Error al guardar:', error)
              }
            }}>Guardar actualización</Button>
          </SidePanelFooter>
        )}
      </SidePanelContent>
    </SidePanel>
  )
}

// ─── Dialog Nuevo Contrato ───────────────────────────────────────────────────
function NewContractDialog({ open, onOpenChange, onSave }: {
  open: boolean; onOpenChange: (v: boolean) => void; onSave: (data: Contractor) => void
}) {
  const [form, setForm] = useState<FormData>(emptyForm())
  const [approvedUsers, setApprovedUsers] = useState<{ id: string; name: string; cedula: string }[]>([])

  // Carga usuarios aprobados cuando se abre el dialog
  useEffect(() => {
    if (!open) return
    fetch('/api/usuarios')
      .then(r => r.json())
      .then(data => setApprovedUsers(Array.isArray(data) ? data : []))
      .catch(() => setApprovedUsers([]))
  }, [open])

  const set = (field: keyof FormData, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    try {
      await onSave({ ...form, id: Date.now().toString(), no: 0 })
      setForm(emptyForm())
      onOpenChange(false)
    } catch (error) {
      // El error ya se mostró en handleNew, solo evitamos cerrar el dialog
      console.error('Error al crear:', error)
    }
  }

  // Helper para renderizar campos — NO es un componente React, es una función que devuelve JSX
  // Esto evita el problema de pérdida de foco al redefinir componentes en cada render
  const field = (label: string, key: keyof FormData, type = 'text', span2 = false) => (
    <div className={span2 ? 'col-span-2' : ''}>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input type={type} className="h-7 text-sm mt-0.5"
        value={String((form as Record<string, unknown>)[key] ?? '')}
        onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)} />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border">
          <DialogTitle>Nuevo Contrato</DialogTitle>
          <DialogDescription>Completa la información del nuevo contrato</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh]">
          <div className="px-6 py-4 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md mb-2">Contratista</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                  <Label className="text-[10px] text-muted-foreground">Contratista</Label>
                  <Select value={form.nombre} onValueChange={v => {
                    const found = approvedUsers.find(c => c.name === v)
                    setForm(prev => ({ ...prev, nombre: v, cedula: found?.cedula ?? prev.cedula }))
                  }}>
                    <SelectTrigger className="h-7 text-sm mt-0.5">
                      <SelectValue placeholder="Seleccionar contratista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedUsers.length === 0
                        ? <SelectItem value="__none__" disabled>Sin contratistas aprobados</SelectItem>
                        : approvedUsers.map(c => (
                            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                {field('Cédula', 'cedula')}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-md mb-2">Información Contractual</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {field('Contrato No.', 'contratoNo')}
                {field('Egreso', 'egreso')}
                {field('Objeto Contractual', 'objetoContractual', 'text', true)}
                {field('Supervisor', 'supervisor', 'text', true)}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-md mb-2">Pagos</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {field('Cuota No.', 'cuotaNo', 'number')}
                {field('Valor Cuota', 'valorCuota', 'number')}
                {field('Total', 'total', 'number')}
                <div>
                  <Label className="text-[10px] text-muted-foreground">Estado Cuota</Label>
                  <Select value={form.estadoCuota} onValueChange={v => set('estadoCuota', v)}>
                    <SelectTrigger className="h-7 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ESTADO_CUOTA_LABELS) as EstadoCuota[]).map(s => 
                        <SelectItem key={s} value={s}>{ESTADO_CUOTA_LABELS[s]}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Estado Cuenta</Label>
                  <Select value={form.estadoCuenta} onValueChange={v => set('estadoCuenta', v)}>
                    <SelectTrigger className="h-7 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{['activo','inactivo','suspendido'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-md mb-2">Fechas y Documentos</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {field('Fecha Entrega', 'fechaEntrega', 'date')}
                {field('Fecha Envío Presupuesto', 'fechaEnvioPresupuesto', 'date')}
                {field('Fecha Elaboración DFUV', 'fechaElaboracionDFUV', 'date')}
                {field('Fecha Aprobación', 'fechaAprobacion', 'date')}
                {field('Informe Supervisión', 'informeSupervision')}
                {field('DEUV', 'deuv')}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded-md mb-2">Observaciones</p>
              <Input className="text-sm" value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)} placeholder="Observaciones adicionales..." />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.nombre || !form.contratoNo}>Guardar contrato</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function ContratistasPage() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Carga inicial desde Firestore, con fallback a mock si está vacío
  const loadContractors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getContractors()
      setContractors(data)
    } catch {
      setContractors([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadContractors() }, [loadContractors])

  const filtered = contractors.filter(c => {
    const matchSearch =
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cedula.includes(searchQuery) ||
      c.contratoNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.estadoCuota === statusFilter
    return matchSearch && matchStatus
  })

  const openView = (c: Contractor) => { setSelectedContractor(c); setDialogMode('view'); setDialogOpen(true) }
  const openEdit = (c: Contractor) => { setSelectedContractor(c); setDialogMode('edit'); setDialogOpen(true) }

  const handleSave = async (updated: Contractor) => {
    try {
      // Pasamos el contratista anterior para que updateContractor pueda construir el historial y validar
      const previous = contractors.find(c => c.id === updated.id)
      await updateContractor(updated.id, updated, previous)
      
      // Recargar los datos desde Firebase para obtener los cambios automáticos
      await loadContractors()
      
      // Mostrar mensaje de éxito
      alert('Contrato actualizado exitosamente')
    } catch (error) {
      // Mostrar error de validación al usuario
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el contrato'
      alert(errorMessage)
      throw error // Re-lanzar para que el dialog no se cierre
    }
  }

  const handleNew = async (c: Contractor) => {
    try {
      const { id: _id, ...data } = c
      void _id
      const newId = await createContractor(data)
      setContractors(prev => [...prev, { ...c, id: newId }])
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
      setContractors(prev => prev.filter(c => c.id !== id))
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
                <Input placeholder="Buscar..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} className="pl-8 h-8 text-sm" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-8 text-sm">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {(Object.keys(ESTADO_CUOTA_LABELS) as EstadoCuota[]).map(s => 
                    <SelectItem key={s} value={s}>{ESTADO_CUOTA_LABELS[s]}</SelectItem>
                  )}
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
              ) : filtered.map(c => (
                <TableRow key={c.id} className="text-sm">
                  <TableCell className="font-medium">{c.no}</TableCell>
                  <TableCell className="font-mono text-xs">{c.cedula}</TableCell>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell className="font-mono text-xs">{c.contratoNo}</TableCell>
                  <TableCell className="text-center">{c.cuotaNo}</TableCell>
                  <TableCell className="text-right">${c.total.toLocaleString('es-CO')}</TableCell>
                  <TableCell>{getStatusBadge(c.estadoCuota, true)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleDelete(c.id)}
                          className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Borrar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <ContractorDialog
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
