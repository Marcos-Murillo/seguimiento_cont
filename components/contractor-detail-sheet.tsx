'use client'

import { useState } from 'react'
import { type Contractor, type EstadoCuota } from '@/lib/types'
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelTitle,
  SidePanelDescription,
} from '@/components/ui/side-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PaymentHistoryPanel } from '@/components/payment-history-panel'
import {
  User, FileText, CreditCard, ClipboardList,
  FolderOpen, Landmark, MessageSquare, ExternalLink,
  CheckCircle2, XCircle, Clock, Hash, Calendar,
  UserCheck, Link2, ShieldCheck, Receipt, History,
} from 'lucide-react'
import { getEstadoCuotaLabel, getEstadoCuotaColor } from '@/lib/estado-utils'

interface ContractorDetailSheetProps {
  contractor: Contractor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusMap: Record<string, { label: string; className: string }> = {
  activo:     { label: 'Activo',     className: 'bg-green-500/15 text-green-700 border-green-400/40 dark:text-green-400' },
  inactivo:   { label: 'Inactivo',   className: 'bg-muted text-muted-foreground border-border' },
  suspendido: { label: 'Suspendido', className: 'bg-red-500/15 text-red-700 border-red-400/40 dark:text-red-400' },
}

function StatusBadge({ status, isEstadoCuota = false }: { status: string; isEstadoCuota?: boolean }) {
  if (isEstadoCuota) {
    const label = getEstadoCuotaLabel(status as EstadoCuota)
    const className = getEstadoCuotaColor(status as EstadoCuota)
    return <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 ${className}`}>{label}</Badge>
  }
  
  const cfg = statusMap[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 ${cfg.className}`}>{cfg.label}</Badge>
}

function ProcessIcon({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === 'aprobado') return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
  if (s === 'rechazado') return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
}

function SectionHeader({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${color}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
    </div>
  )
}

function Field({ label, value, icon: Icon, span2 }: {
  label: string
  value: React.ReactNode
  icon?: React.ElementType
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
      <div className="text-base font-semibold text-foreground leading-snug">{value || '—'}</div>
    </div>
  )
}

export function ContractorDetailSheet({ contractor, open, onOpenChange }: ContractorDetailSheetProps) {
  const [historialOpen, setHistorialOpen] = useState(false)

  if (!contractor) return null

  return (
    <SidePanel open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setHistorialOpen(false) }}>
      <SidePanelContent>
        {/* Sub-panel de historial (sale por la izquierda del card) */}
        <PaymentHistoryPanel
          open={historialOpen}
          onClose={() => setHistorialOpen(false)}
          historial={contractor.historialCuotas ?? []}
          nombreContratista={contractor.nombre}
        />

        {/* Header */}
        <SidePanelHeader>
          <div className="flex items-start gap-3 pr-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistorialOpen((v) => !v)}
                  className="h-7 px-2.5 text-xs gap-1.5 border-amber-400/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                >
                  <History className="h-3.5 w-3.5" />
                  Historial
                </Button>
              </div>
              <SidePanelTitle className="text-xl font-bold leading-tight mt-1">{contractor.nombre}</SidePanelTitle>
              <SidePanelDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-sm font-medium">{contractor.contratoNo}</span>
                <span className="text-muted-foreground">·</span>
                <StatusBadge status={contractor.estadoCuenta} />
                <span className="text-muted-foreground">·</span>
                <StatusBadge status={contractor.estadoCuota} isEstadoCuota />
              </SidePanelDescription>
            </div>
          </div>
        </SidePanelHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Datos Generales */}
            <div className="space-y-3">
              <SectionHeader icon={User} title="Datos Generales" color="bg-blue-500/10 text-blue-700 dark:text-blue-400" />
              <div className="grid grid-cols-2 gap-4 px-1">
                <Field icon={Hash} label="No." value={contractor.no} />
                <Field icon={Hash} label="Cédula" value={contractor.cedula} />
                <Field icon={User} label="Nombre Completo" value={contractor.nombre} span2 />
              </div>
            </div>

            <Separator />

            {/* Información Contractual */}
            <div className="space-y-3">
              <SectionHeader icon={FileText} title="Información Contractual" color="bg-purple-500/10 text-purple-700 dark:text-purple-400" />
              <div className="grid grid-cols-2 gap-4 px-1">
                <Field icon={FileText} label="Contrato No." value={contractor.contratoNo} />
                <Field icon={Receipt} label="Egreso" value={contractor.egreso} />
                <Field icon={ClipboardList} label="Objeto Contractual" value={contractor.objetoContractual} span2 />
                <Field icon={UserCheck} label="Supervisor" value={contractor.supervisor} span2 />
              </div>
            </div>

            <Separator />

            {/* Estado de Pagos */}
            <div className="space-y-3">
              <SectionHeader icon={CreditCard} title="Estado de Pagos" color="bg-green-500/10 text-green-700 dark:text-green-400" />
              <div className="grid grid-cols-2 gap-4 px-1">
                <Field icon={Hash} label="Cuota No." value={contractor.cuotaNo} />
                <Field icon={CreditCard} label="Valor Cuota" value={`$${contractor.valorCuota.toLocaleString('es-CO')}`} />
                <Field icon={CreditCard} label="Total" value={`$${contractor.total.toLocaleString('es-CO')}`} />
                <Field icon={ShieldCheck} label="Revisado" value={
                  <Badge variant={contractor.revisado ? 'default' : 'secondary'} className="text-sm">
                    {contractor.revisado ? 'Sí' : 'No'}
                  </Badge>
                } />
                <Field label="Estado Cuota" value={<StatusBadge status={contractor.estadoCuota} isEstadoCuota />} />
                <Field label="Estado Cuenta" value={<StatusBadge status={contractor.estadoCuenta} />} />
              </div>
            </div>

            <Separator />

            {/* Seguimiento Documental */}
            <div className="space-y-3">
              <SectionHeader icon={ClipboardList} title="Seguimiento Documental" color="bg-orange-500/10 text-orange-700 dark:text-orange-400" />
              <div className="grid grid-cols-2 gap-4 px-1">
                <Field icon={ClipboardList} label="Informe Supervisión" value={contractor.informeSupervision} />
                <Field icon={FileText} label="DEUV" value={contractor.deuv} />
                <Field icon={Calendar} label="Fecha Elaboración DFUV" value={contractor.fechaElaboracionDFUV} />
                <Field icon={Calendar} label="Fecha Aprobación" value={contractor.fechaAprobacion || 'Pendiente'} />
                <Field icon={Hash} label="No. CP" value={contractor.seguimientoSP.noCP} />
                <Field icon={Hash} label="No. SP" value={contractor.seguimientoSP.noSP} />
                <Field icon={Calendar} label="Fecha Elaboración SP" value={contractor.seguimientoSP.fechaElaboracion} />
                <Field icon={Calendar} label="Fecha Envío Presupuesto" value={contractor.fechaEnvioPresupuesto} />
                <Field icon={Calendar} label="Fecha Entrega" value={contractor.fechaEntrega} />
              </div>
            </div>

            <Separator />

            {/* Contratación CRD */}
            <div className="space-y-3">
              <SectionHeader icon={Landmark} title="Contratación CRD" color="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400" />
              <div className="grid grid-cols-2 gap-4 px-1">
                <Field icon={Calendar} label="Fecha Remisión de Informes" value={contractor.contratacionCRD.fechaRemisionInformes} />
                <Field icon={FileText} label="DOC" value={contractor.contratacionCRD.doc} />
                <Field icon={Link2} label="Enlace" span2 value={
                  contractor.contratacionCRD.enlace ? (
                    <a href={contractor.contratacionCRD.enlace} target="_blank" rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1.5 text-base font-semibold">
                      Ver documento <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : '—'
                } />
              </div>
            </div>

            <Separator />

            {/* Documentos Base */}
            <div className="space-y-3">
              <SectionHeader icon={FolderOpen} title="Documentos Base — Póliza" color="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400" />
              <div className="grid grid-cols-3 gap-4 px-1">
                <Field icon={ShieldCheck} label="Póliza" value={contractor.documentosBase.poliza} />
                <Field icon={FolderOpen} label="Evidencias" value={contractor.documentosBase.evidencias} />
                <Field icon={ClipboardList} label="Pactadas" value={contractor.documentosBase.pactadas} />
              </div>
            </div>

            <Separator />

            {/* Proceso de Pago */}
            <div className="space-y-3">
              <SectionHeader icon={Landmark} title="Proceso de Pago" color="bg-pink-500/10 text-pink-700 dark:text-pink-400" />
              <div className="grid grid-cols-2 gap-3 px-1">
                {Object.entries(contractor.procesoPago).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
                    <ProcessIcon status={val} />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">{key}</p>
                      <p className="text-base font-semibold">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Observaciones */}
            <div className="space-y-3">
              <SectionHeader icon={MessageSquare} title="Observaciones" color="bg-muted text-muted-foreground" />
              <p className="text-base text-foreground leading-relaxed px-1">
                {contractor.observaciones || 'Sin observaciones registradas.'}
              </p>
            </div>

          </div>
        </div>
      </SidePanelContent>
    </SidePanel>
  )
}
