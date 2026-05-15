'use client'

import { useState, useEffect } from 'react'
import { type Contractor, type EstadoCuota } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { ESTADO_CUOTA_LABELS } from '@/lib/estado-utils'

export type FormData = Omit<Contractor, 'id' | 'no'>

export function emptyContractForm(): FormData {
  return {
    cedula: '',
    nombre: '',
    contratoNo: '',
    objetoContractual: '',
    egreso: '',
    cuotaNo: 1,
    total: 0,
    informeSupervision: '',
    deuv: '',
    seguimientoSP: { noCP: '', noSP: '', fechaElaboracion: '' },
    consolidacionDocumentos: { fechaElaboracion: '', fecha: '' },
    fechaEnvioPresupuesto: '',
    fechaEntrega: '',
    fechaElaboracionDFUV: '',
    fechaAprobacion: '',
    contratacionCRD: { fechaRemisionInformes: '', doc: '', enlace: '' },
    supervisor: '',
    estadoCuota: 'pendiente_informe_contratista',
    estadoCuenta: 'activo',
    observaciones: '',
    revisado: false,
    valorCuota: 0,
    documentosBase: { poliza: '', evidencias: '', pactadas: '' },
    procesoPago: { cuenta979001: '', cuenta979003: '', cuenta979005: '', cuenta979006: '' },
  }
}

export function NewContractDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: Contractor) => void
}) {
  const [form, setForm] = useState<FormData>(emptyContractForm)
  const [approvedUsers, setApprovedUsers] = useState<{ id: string; name: string; cedula: string }[]>([])

  useEffect(() => {
    if (!open) return
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then((data) => setApprovedUsers(Array.isArray(data) ? data : []))
      .catch(() => setApprovedUsers([]))
  }, [open])

  const patch = (field: keyof FormData, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    try {
      await onSave({ ...form, id: Date.now().toString(), no: 0 })
      setForm(emptyContractForm())
      onOpenChange(false)
    } catch (error) {
      console.error('Error al crear:', error)
    }
  }

  const field = (label: string, key: keyof FormData, type = 'text', span2 = false) => (
    <div className={span2 ? 'col-span-2' : ''}>
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type={type}
        className="h-7 text-sm mt-0.5"
        value={String((form as Record<string, unknown>)[key] ?? '')}
        onChange={(e) => patch(key, type === 'number' ? Number(e.target.value) : e.target.value)}
      />
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
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md mb-2">
                Contratista
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-2">
                  <Label className="text-[10px] text-muted-foreground">Contratista</Label>
                  <Select
                    value={form.nombre}
                    onValueChange={(v) => {
                      const found = approvedUsers.find((c) => c.name === v)
                      setForm((prev) => ({ ...prev, nombre: v, cedula: found?.cedula ?? prev.cedula }))
                    }}
                  >
                    <SelectTrigger className="h-7 text-sm mt-0.5">
                      <SelectValue placeholder="Seleccionar contratista..." />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedUsers.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          Sin contratistas aprobados
                        </SelectItem>
                      ) : (
                        approvedUsers.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {field('Cédula', 'cedula')}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-md mb-2">
                Información Contractual
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {field('Contrato No.', 'contratoNo')}
                {field('Egreso', 'egreso')}
                {field('Objeto Contractual', 'objetoContractual', 'text', true)}
                {field('Supervisor', 'supervisor', 'text', true)}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-md mb-2">
                Pagos
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {field('Cuota No.', 'cuotaNo', 'number')}
                {field('Valor Cuota', 'valorCuota', 'number')}
                {field('Total', 'total', 'number')}
                <div>
                  <Label className="text-[10px] text-muted-foreground">Estado Cuota</Label>
                  <Select value={form.estadoCuota} onValueChange={(v) => patch('estadoCuota', v)}>
                    <SelectTrigger className="h-7 text-sm mt-0.5">
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
                  <Label className="text-[10px] text-muted-foreground">Estado Cuenta</Label>
                  <Select value={form.estadoCuenta} onValueChange={(v) => patch('estadoCuenta', v)}>
                    <SelectTrigger className="h-7 text-sm mt-0.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['activo', 'inactivo', 'suspendido'].map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-md mb-2">
                Fechas y Documentos
              </p>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded-md mb-2">
                Observaciones
              </p>
              <Input
                className="text-sm"
                value={form.observaciones}
                onChange={(e) => patch('observaciones', e.target.value)}
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="px-6 py-3 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!form.nombre || !form.contratoNo}>
            Guardar contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
