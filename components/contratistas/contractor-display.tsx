'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { type EstadoCuota } from '@/lib/types'
import { getEstadoCuotaLabel, getEstadoCuotaColor } from '@/lib/estado-utils'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function contractorEstadoCuentaBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    activo: { label: 'Activo', className: 'bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400' },
    inactivo: { label: 'Inactivo', className: 'bg-muted text-muted-foreground border-border' },
    suspendido: { label: 'Suspendido', className: 'bg-red-500/10 text-red-700 border-red-400/30 dark:text-red-400' },
  }
  const cfg = map[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
}

export function contractorEstadoCuotaBadge(status: string) {
  const label = getEstadoCuotaLabel(status as EstadoCuota)
  const className = getEstadoCuotaColor(status as EstadoCuota)
  return <Badge variant="outline" className={className}>{label}</Badge>
}

export const ContractorStatusBadge = memo(function ContractorStatusBadge({
  status,
  isEstadoCuota = false,
}: {
  status: string
  isEstadoCuota?: boolean
}) {
  if (isEstadoCuota) return contractorEstadoCuotaBadge(status)
  return contractorEstadoCuentaBadge(status)
})

export function procesoPagoIcon(status: string) {
  const s = status.toLowerCase()
  if (s === 'aprobado') return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
  if (s === 'rechazado') return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
}

export const ProcesoPagoCell = memo(function ProcesoPagoCell({
  cuentaKey,
  value,
}: {
  cuentaKey: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
      {procesoPagoIcon(value)}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate">{cuentaKey}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  )
})
