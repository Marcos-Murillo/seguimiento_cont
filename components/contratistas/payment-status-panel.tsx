'use client'

import { useCallback, useMemo, useState } from 'react'
import { type Contractor, type EstadoCuota, type CuotaHistorial } from '@/lib/types'
import { cloneContractor, cuotasSelectCount, isContractFinished } from '@/lib/contractor-utils'
import { ESTADO_CUOTA_LABELS } from '@/lib/estado-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  SidePanel,
  SidePanelContent,
  SidePanelHeader,
  SidePanelFooter,
  SidePanelTitle,
  SidePanelDescription,
} from '@/components/ui/side-panel'
import { PaymentHistoryPanel } from '@/components/payment-history-panel'
import { ContractorStatusBadge } from '@/components/contratistas/contractor-display'
import { ContractorSectionHeader } from '@/components/contratistas/contractor-field-kit'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Hash, History, User, AlertTriangle, Plus } from 'lucide-react'

const EMPTY_HISTORIAL: CuotaHistorial[] = []

export function PaymentStatusPanel({
  contractor,
  open,
  onOpenChange,
  onSave,
  onCreateNew,
}: {
  contractor: Contractor | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave?: (data: Contractor) => void | Promise<void>
  onCreateNew?: (contractor: Contractor) => void
}) {
  const [form, setForm] = useState<Contractor | null>(() => (contractor ? cloneContractor(contractor) : null))
  const [historialOpen, setHistorialOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const setField = useCallback((field: keyof Contractor, value: unknown) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }, [])

  const nCuotas = form?.numeroCuotas
  const totalPago = form?.total ?? 0
  const valorCuotaPago = form?.valorCuota ?? 0
  const cuotaOptionNums = useMemo(() => {
    return Array.from(
      { length: cuotasSelectCount({ numeroCuotas: nCuotas, total: totalPago, valorCuota: valorCuotaPago }) },
      (_, i) => i + 1
    )
  }, [nCuotas, totalPago, valorCuotaPago])

  const handleOpenChange = useCallback(
    (v: boolean) => {
      onOpenChange(v)
      if (!v) setHistorialOpen(false)
    },
    [onOpenChange]
  )

  if (!contractor || !form) return null

  const finished = isContractFinished(contractor)
  const historial = form.historialCuotas ?? EMPTY_HISTORIAL

  return (
    <SidePanel open={open} onOpenChange={handleOpenChange}>
      <SidePanelContent>
        <PaymentHistoryPanel
          open={historialOpen}
          onClose={() => setHistorialOpen(false)}
          historial={historial}
          nombreContratista={form.nombre}
        />

        <SidePanelHeader>
          <div className="flex items-start gap-3 pr-8">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-6 w-6 text-green-700 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHistorialOpen((v) => !v)}
                className="h-7 px-2.5 text-xs gap-1.5 border-amber-400/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
              >
                <History className="h-3.5 w-3.5" />
                Historial
              </Button>
              <SidePanelTitle className="text-xl font-bold leading-tight mt-1">{form.nombre}</SidePanelTitle>
              <SidePanelDescription className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-sm font-medium">{form.contratoNo}</span>
                <span className="text-muted-foreground">·</span>
                <ContractorStatusBadge status={form.estadoCuenta} />
                <span className="text-muted-foreground">·</span>
                <ContractorStatusBadge status={form.estadoCuota} isEstadoCuota />
              </SidePanelDescription>
            </div>
          </div>
        </SidePanelHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {finished && (
              <Alert className="border-amber-400/50 bg-amber-500/10">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Este contrato ya terminó.</p>
                  <p className="mt-1 text-sm">
                    Las cuotas de este contrato se agotaron. Para seguir con la persona hay que crear un contrato nuevo, desde cero.
                  </p>
                  {onCreateNew && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3"
                      onClick={() => onCreateNew(contractor)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Crear nuevo contrato
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cédula</p>
                  <p className="font-mono font-medium truncate">{form.cedula || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Cuotas del contrato</p>
                  <p className="font-medium">
                    {form.cuotaNo} / {cuotaOptionNums.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={CreditCard}
                title="Estado de Pagos"
                color="bg-green-500/10 text-green-700 dark:text-green-400"
              />
              <p className="text-xs text-muted-foreground px-1">
                Al guardar una cuota como pagada, el sistema avanza a la siguiente. En la última cuota el contrato queda cerrado.
              </p>
              <div className="grid grid-cols-2 gap-4 px-1">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Cuota No.</p>
                  <Select value={String(form.cuotaNo)} onValueChange={(v) => setField('cuotaNo', Number(v))}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cuotaOptionNums.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          Cuota {n}
                          {n === form.cuotaNo && ' (Actual)'}
                          {historial.some((h) => h.cuotaNo === n && h.estadoCuota === 'pagado') && ' ✓'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Valor cuota</p>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    value={Number.isFinite(form.valorCuota) ? form.valorCuota : ''}
                    onChange={(e) => setField('valorCuota', e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Total</p>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    value={Number.isFinite(form.total) ? form.total : ''}
                    onChange={(e) => setField('total', e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado cuota</p>
                  <Select value={form.estadoCuota} onValueChange={(v) => setField('estadoCuota', v as EstadoCuota)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ESTADO_CUOTA_LABELS) as EstadoCuota[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {ESTADO_CUOTA_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado cuenta</p>
                  <Select
                    value={form.estadoCuenta}
                    onValueChange={(v) => setField('estadoCuenta', v as Contractor['estadoCuenta'])}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(['activo', 'inactivo', 'suspendido'] as const).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Revisado</p>
                  <Select
                    value={form.revisado ? 'si' : 'no'}
                    onValueChange={(v) => setField('revisado', v === 'si')}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SidePanelFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true)
              try {
                await onSave?.(form)
                handleOpenChange(false)
              } catch (error) {
                console.error('Error al guardar estado de pago:', error)
              } finally {
                setSaving(false)
              }
            }}
          >
            {saving ? 'Guardando...' : 'Guardar estado de pago'}
          </Button>
        </SidePanelFooter>
      </SidePanelContent>
    </SidePanel>
  )
}
