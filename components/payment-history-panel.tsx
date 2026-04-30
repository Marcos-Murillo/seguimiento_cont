'use client'

import { type CuotaHistorial } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { X, History, CreditCard, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentHistoryPanelProps {
  open: boolean
  onClose: () => void
  historial: CuotaHistorial[]
  nombreContratista: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  pendiente:  { label: 'Pendiente',  className: 'bg-yellow-500/15 text-yellow-700 border-yellow-400/40 dark:text-yellow-400' },
  en_proceso: { label: 'En Proceso', className: 'bg-blue-500/15 text-blue-700 border-blue-400/40 dark:text-blue-400' },
  pagado:     { label: 'Pagado',     className: 'bg-green-500/15 text-green-700 border-green-400/40 dark:text-green-400' },
  rechazado:  { label: 'Rechazado',  className: 'bg-red-500/15 text-red-700 border-red-400/40 dark:text-red-400' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusMap[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 ${cfg.className}`}>{cfg.label}</Badge>
}

function ProcessIcon({ status }: { status: string }) {
  const s = status.toLowerCase()
  if (s === 'aprobado') return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
  if (s === 'rechazado') return <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
  if (s === 'n/a') return <span className="h-3.5 w-3.5 shrink-0 text-muted-foreground text-xs font-bold">—</span>
  return <Clock className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
}

const cuentaLabels: Record<string, string> = {
  cuenta979001: '979001',
  cuenta979003: '979003',
  cuenta979005: '979005',
  cuenta979006: '979006',
}

export function PaymentHistoryPanel({ open, onClose, historial, nombreContratista }: PaymentHistoryPanelProps) {
  if (!open) return null

  return (
    // Panel fijo a la izquierda del card principal (que está en right-4)
    // El card principal tiene w-[50vw] min-w-[480px], así que posicionamos este a su izquierda
    <div
      className={cn(
        'fixed top-4 bottom-4 z-50',
        'w-[320px]',
        'bg-card border border-border rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        'animate-in slide-in-from-right-8 fade-in-0 duration-300',
      )}
      style={{ right: 'calc(50vw + 1rem)' }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <History className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold">Historial de Pagos</p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{nombreContratista}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar historial</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
            <CreditCard className="h-8 w-8 opacity-40" />
            <p className="text-sm">Sin historial registrado</p>
          </div>
        ) : (
          historial.map((cuota, idx) => (
            <div key={cuota.cuotaNo}>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{cuota.cuotaNo}</span>
                    </div>
                    <span className="text-sm font-semibold">Cuota {cuota.cuotaNo}</span>
                  </div>
                  <StatusBadge status={cuota.estadoCuota} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Valor pagado</p>
                    <p className="text-sm font-bold">
                      {cuota.valorPagado > 0 ? `$${cuota.valorPagado.toLocaleString('es-CO')}` : '—'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Fecha pago</p>
                    </div>
                    <p className="text-sm font-semibold">{cuota.fechaPago || '—'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Proceso de pago</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(cuota.procesoPago).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-1.5 bg-background/60 rounded-md px-2 py-1.5 border border-border/50">
                        <ProcessIcon status={val} />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground leading-none">{cuentaLabels[key] ?? key}</p>
                          <p className="text-xs font-medium truncate">{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {cuota.observaciones && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Observaciones</p>
                    <p className="text-xs text-foreground leading-relaxed">{cuota.observaciones}</p>
                  </div>
                )}
              </div>
              {idx < historial.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="w-px h-3 bg-border" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
