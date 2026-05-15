'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { type Contractor, type EstadoCuota, type CuotaHistorial } from '@/lib/types'
import { cloneContractor, cuotasSelectCount } from '@/lib/contractor-utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
import { ContractorStatusBadge, ProcesoPagoCell } from '@/components/contratistas/contractor-display'
import { ContractorSectionHeader, ContractorScalarField, ContractorInlineField } from '@/components/contratistas/contractor-field-kit'
import { ESTADO_CUOTA_LABELS } from '@/lib/estado-utils'
import {
  Pencil,
  User,
  FileText,
  CreditCard,
  ClipboardList,
  FolderOpen,
  Landmark,
  MessageSquare,
  Hash,
  Calendar,
  UserCheck2,
  Link2,
  ShieldCheck,
  Receipt,
  History,
  ExternalLink,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

const EMPTY_HISTORIAL: CuotaHistorial[] = []

const ObservacionesInput = memo(function ObservacionesInput({
  value,
  onValue,
}: {
  value: string
  onValue: (v: string) => void
}) {
  return <Input className="text-sm" defaultValue={value} onBlur={(e) => onValue(e.target.value)} />
})

const CuotaNoSelect = memo(function CuotaNoSelect({
  cuotaNo,
  optionNums,
  historialCuotas,
  onPick,
}: {
  cuotaNo: number
  optionNums: number[]
  historialCuotas: CuotaHistorial[] | undefined
  onPick: (n: number) => void
}) {
  const hist = historialCuotas ?? EMPTY_HISTORIAL
  return (
    <Select value={String(cuotaNo)} onValueChange={(v) => onPick(Number(v))}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {optionNums.map((n) => (
          <SelectItem key={n} value={String(n)}>
            Cuota {n}
            {n === cuotaNo && ' (Actual)'}
            {hist.some((h) => h.cuotaNo === n && h.estadoCuota === 'pagado') && ' ✓'}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})

const EstadoCuotaSelect = memo(function EstadoCuotaSelect({
  value,
  onChange,
}: {
  value: EstadoCuota
  onChange: (v: EstadoCuota) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as EstadoCuota)}>
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
  )
})

const EstadoCuentaSelect = memo(function EstadoCuentaSelect({
  value,
  onChange,
}: {
  value: Contractor['estadoCuenta']
  onChange: (v: Contractor['estadoCuenta']) => void
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Contractor['estadoCuenta'])}>
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
  )
})

const CrdEnlaceBlock = memo(function CrdEnlaceBlock({
  editing,
  enlace,
  onEnlace,
}: {
  editing: boolean
  enlace: string
  onEnlace: (v: string) => void
}) {
  return (
    <div className="col-span-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium">Enlace</p>
      </div>
      {editing ? (
        <Input
          className="h-8 text-sm"
          defaultValue={enlace}
          onBlur={(e) => onEnlace(e.target.value)}
          placeholder="https://..."
        />
      ) : enlace ? (
        <a
          href={enlace}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1.5 text-base font-semibold"
        >
          Ver documento <ExternalLink className="h-4 w-4" />
        </a>
      ) : (
        <div className="text-base font-semibold text-foreground leading-snug">—</div>
      )}
    </div>
  )
})

export type ContractorDetailPanelProps = {
  contractor: Contractor | null
  mode: 'view' | 'edit'
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave?: (data: Contractor) => void
}

export function ContractorDetailPanel({
  contractor,
  mode,
  open,
  onOpenChange,
  onSave,
}: ContractorDetailPanelProps) {
  const [editing, setEditing] = useState(mode === 'edit')
  const [form, setForm] = useState<Contractor | null>(() =>
    contractor ? cloneContractor(contractor) : null
  )
  const [historialOpen, setHistorialOpen] = useState(false)

  const setField = useCallback((field: keyof Contractor, value: unknown) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }, [])

  const onSegNoCP = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, seguimientoSP: { ...p.seguimientoSP, noCP: v } } : p))
  }, [])
  const onSegNoSP = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, seguimientoSP: { ...p.seguimientoSP, noSP: v } } : p))
  }, [])
  const onSegFecha = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, seguimientoSP: { ...p.seguimientoSP, fechaElaboracion: v } } : p))
  }, [])

  const onCrdFechaRem = useCallback((v: string) => {
    setForm((p) =>
      p ? { ...p, contratacionCRD: { ...p.contratacionCRD, fechaRemisionInformes: v } } : p
    )
  }, [])
  const onCrdDoc = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, contratacionCRD: { ...p.contratacionCRD, doc: v } } : p))
  }, [])
  const onCrdEnlace = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, contratacionCRD: { ...p.contratacionCRD, enlace: v } } : p))
  }, [])

  const onDocPoliza = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, documentosBase: { ...p.documentosBase, poliza: v } } : p))
  }, [])
  const onDocEvidencias = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, documentosBase: { ...p.documentosBase, evidencias: v } } : p))
  }, [])
  const onDocPactadas = useCallback((v: string) => {
    setForm((p) => (p ? { ...p, documentosBase: { ...p.documentosBase, pactadas: v } } : p))
  }, [])

  const onObservaciones = useCallback((v: string) => {
    setField('observaciones', v)
  }, [setField])

  const onPickCuota = useCallback((n: number) => {
    setField('cuotaNo', n)
  }, [setField])

  const onEstadoCuota = useCallback(
    (v: EstadoCuota) => {
      setField('estadoCuota', v)
    },
    [setField]
  )

  const onEstadoCuenta = useCallback(
    (v: Contractor['estadoCuenta']) => {
      setField('estadoCuenta', v)
    },
    [setField]
  )

  const nCuotas = form?.numeroCuotas
  const totalPago = form?.total ?? 0
  const valorCuotaPago = form?.valorCuota ?? 0

  const cuotaOptionNums = useMemo(() => {
    return Array.from(
      { length: cuotasSelectCount({ numeroCuotas: nCuotas, total: totalPago, valorCuota: valorCuotaPago }) },
      (_, i) => i + 1
    )
  }, [nCuotas, totalPago, valorCuotaPago])

  const historialForPanel = form?.historialCuotas ?? EMPTY_HISTORIAL

  const handlePanelOpenChange = useCallback(
    (v: boolean) => {
      onOpenChange(v)
      if (!v) setHistorialOpen(false)
    },
    [onOpenChange]
  )

  if (!contractor || !form) return null

  return (
    <SidePanel open={open} onOpenChange={handlePanelOpenChange}>
      <SidePanelContent>
        <PaymentHistoryPanel
          open={historialOpen}
          onClose={() => setHistorialOpen(false)}
          historial={historialForPanel}
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
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setHistorialOpen((v) => !v)}
                    className="h-7 px-2.5 text-xs gap-1.5 border-amber-400/50 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
                  >
                    <History className="h-3.5 w-3.5" />
                    Historial
                  </Button>
                </div>
                {!editing && (
                  <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Actualizar
                  </Button>
                )}
              </div>
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
          <div className="px-6 py-5 space-y-6">
            <div className="space-y-3">
              <ContractorSectionHeader
                icon={User}
                title="Datos Generales"
                color="bg-blue-500/10 text-blue-700 dark:text-blue-400"
              />
              <div className="grid grid-cols-3 gap-4 px-1">
                <ContractorScalarField icon={Hash} label="No." editing={editing} value={form.no} onFieldChange={setField} />
                <ContractorScalarField
                  icon={Hash}
                  label="Cédula"
                  editing={editing}
                  value={form.cedula}
                  field="cedula"
                  onFieldChange={setField}
                />
                <ContractorScalarField
                  icon={User}
                  label="Nombre Completo"
                  editing={editing}
                  value={form.nombre}
                  field="nombre"
                  span3
                  onFieldChange={setField}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={FileText}
                title="Información Contractual"
                color="bg-purple-500/10 text-purple-700 dark:text-purple-400"
              />
              <div className="grid grid-cols-3 gap-4 px-1">
                <ContractorScalarField
                  icon={FileText}
                  label="Contrato No."
                  editing={editing}
                  value={form.contratoNo}
                  field="contratoNo"
                  onFieldChange={setField}
                />
                <ContractorScalarField icon={Receipt} label="Egreso" editing={editing} value={form.egreso} field="egreso" onFieldChange={setField} />
                <ContractorScalarField
                  icon={ClipboardList}
                  label="Objeto Contractual"
                  editing={editing}
                  value={form.objetoContractual}
                  field="objetoContractual"
                  span3
                  onFieldChange={setField}
                />
                <ContractorScalarField
                  icon={UserCheck2}
                  label="Supervisor"
                  editing={editing}
                  value={form.supervisor}
                  field="supervisor"
                  span3
                  onFieldChange={setField}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={CreditCard}
                title="Estado de Pagos"
                color="bg-green-500/10 text-green-700 dark:text-green-400"
              />
              <div className="grid grid-cols-3 gap-4 px-1">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">Cuota No.</p>
                  </div>
                  {editing ? (
                    <CuotaNoSelect
                      cuotaNo={form.cuotaNo}
                      optionNums={cuotaOptionNums}
                      historialCuotas={form.historialCuotas}
                      onPick={onPickCuota}
                    />
                  ) : (
                    <div className="text-base font-semibold text-foreground leading-snug">{form.cuotaNo}</div>
                  )}
                </div>
                <ContractorScalarField
                  icon={CreditCard}
                  label="Valor Cuota"
                  editing={editing}
                  value={form.valorCuota}
                  field="valorCuota"
                  numeric
                  onFieldChange={setField}
                />
                <ContractorScalarField
                  icon={CreditCard}
                  label="Total"
                  editing={editing}
                  value={form.total}
                  field="total"
                  numeric
                  onFieldChange={setField}
                />
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado Cuota</p>
                  {editing ? (
                    <EstadoCuotaSelect value={form.estadoCuota} onChange={onEstadoCuota} />
                  ) : (
                    <div className="text-base font-semibold">
                      <ContractorStatusBadge status={form.estadoCuota} isEstadoCuota />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Estado Cuenta</p>
                  {editing ? (
                    <EstadoCuentaSelect value={form.estadoCuenta} onChange={onEstadoCuenta} />
                  ) : (
                    <div className="text-base font-semibold">
                      <ContractorStatusBadge status={form.estadoCuenta} />
                    </div>
                  )}
                </div>
                <ContractorScalarField icon={ShieldCheck} label="Revisado" editing={editing} onFieldChange={setField}>
                  <Badge variant={form.revisado ? 'default' : 'secondary'}>{form.revisado ? 'Sí' : 'No'}</Badge>
                </ContractorScalarField>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={ClipboardList}
                title="Seguimiento Documental"
                color="bg-orange-500/10 text-orange-700 dark:text-orange-400"
              />
              <div className="grid grid-cols-3 gap-4 px-1">
                <ContractorScalarField
                  icon={ClipboardList}
                  label="Informe Supervisión"
                  editing={editing}
                  value={form.informeSupervision}
                  field="informeSupervision"
                  onFieldChange={setField}
                />
                <ContractorScalarField icon={FileText} label="DEUV" editing={editing} value={form.deuv} field="deuv" onFieldChange={setField} />
                <ContractorScalarField
                  icon={Calendar}
                  label="Fecha Elaboración DFUV"
                  editing={editing}
                  value={form.fechaElaboracionDFUV}
                  field="fechaElaboracionDFUV"
                  onFieldChange={setField}
                />
                <ContractorScalarField
                  icon={Calendar}
                  label="Fecha Aprobación"
                  editing={editing}
                  value={form.fechaAprobacion}
                  field="fechaAprobacion"
                  emptyReadLabel="Pendiente"
                  onFieldChange={setField}
                />

                <ContractorInlineField
                  label="No. CP"
                  icon={Hash}
                  editing={editing}
                  value={form.seguimientoSP.noCP}
                  onValueChange={onSegNoCP}
                />
                <ContractorInlineField
                  label="No. SP"
                  icon={Hash}
                  editing={editing}
                  value={form.seguimientoSP.noSP}
                  onValueChange={onSegNoSP}
                />
                <ContractorInlineField
                  label="Fecha Elaboración SP"
                  icon={Calendar}
                  editing={editing}
                  value={form.seguimientoSP.fechaElaboracion}
                  onValueChange={onSegFecha}
                />

                <ContractorScalarField
                  icon={Calendar}
                  label="Fecha Envío Presupuesto"
                  editing={editing}
                  value={form.fechaEnvioPresupuesto}
                  field="fechaEnvioPresupuesto"
                  onFieldChange={setField}
                />
                <ContractorScalarField
                  icon={Calendar}
                  label="Fecha Entrega"
                  editing={editing}
                  value={form.fechaEntrega}
                  field="fechaEntrega"
                  onFieldChange={setField}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={Landmark}
                title="Contratación CRD"
                color="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
              />
              <div className="grid grid-cols-3 gap-4 px-1">
                <ContractorInlineField
                  label="Fecha Remisión de Informes"
                  icon={Calendar}
                  editing={editing}
                  value={form.contratacionCRD.fechaRemisionInformes}
                  onValueChange={onCrdFechaRem}
                />
                <ContractorInlineField label="DOC" icon={FileText} editing={editing} value={form.contratacionCRD.doc} onValueChange={onCrdDoc} />
                <CrdEnlaceBlock editing={editing} enlace={form.contratacionCRD.enlace} onEnlace={onCrdEnlace} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={FolderOpen}
                title="Documentos Base — Póliza"
                color="bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
              />
              <div className="grid grid-cols-3 gap-4 px-1">
                <ContractorInlineField
                  label="Póliza"
                  icon={ShieldCheck}
                  editing={editing}
                  value={form.documentosBase.poliza}
                  onValueChange={onDocPoliza}
                />
                <ContractorInlineField
                  label="Evidencias"
                  icon={FolderOpen}
                  editing={editing}
                  value={form.documentosBase.evidencias}
                  onValueChange={onDocEvidencias}
                />
                <ContractorInlineField
                  label="Pactadas"
                  icon={ClipboardList}
                  editing={editing}
                  value={form.documentosBase.pactadas}
                  onValueChange={onDocPactadas}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={Landmark}
                title="Proceso de Pago"
                color="bg-pink-500/10 text-pink-700 dark:text-pink-400"
              />
              <div className="grid grid-cols-2 gap-3 px-1">
                {Object.entries(form.procesoPago).map(([key, val]) => (
                  <ProcesoPagoCell key={key} cuentaKey={key} value={val} />
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <ContractorSectionHeader
                icon={MessageSquare}
                title="Observaciones"
                color="bg-muted text-muted-foreground"
              />
              {editing ? (
                <ObservacionesInput value={form.observaciones} onValue={onObservaciones} />
              ) : (
                <p className="text-base text-foreground leading-relaxed px-1">
                  {form.observaciones || 'Sin observaciones registradas.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {editing && (
          <SidePanelFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false)
                setForm(cloneContractor(contractor))
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await onSave?.(form)
                  setEditing(false)
                  onOpenChange(false)
                } catch (error) {
                  console.error('Error al guardar:', error)
                }
              }}
            >
              Guardar actualización
            </Button>
          </SidePanelFooter>
        )}
      </SidePanelContent>
    </SidePanel>
  )
}
