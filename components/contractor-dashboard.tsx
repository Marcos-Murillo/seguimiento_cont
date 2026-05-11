'use client'

import { useState, useEffect, useCallback } from 'react'
import { type User, type Contractor, type EstadoCuota } from '@/lib/types'
import { getContractors } from '@/lib/firebase-db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Calendar, DollarSign, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { getEstadoCuotaLabel, getEstadoCuotaColor } from '@/lib/estado-utils'

interface ContractorDashboardProps { user: User }

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

// Calcular progreso del contrato basado en cuotas pagadas
function calcularProgresoCuotas(historial: Contractor['historialCuotas'], numeroCuotas: number): number {
  const cuotasPagadas = historial?.filter(c => c.estadoCuota === 'pagado').length || 0
  return Math.round((cuotasPagadas / numeroCuotas) * 100)
}

// Calcular progreso del tiempo del contrato
function calcularProgresoTiempo(fechaInicio?: string, fechaFin?: string): number {
  if (!fechaInicio || !fechaFin) return 0
  
  const inicio = new Date(fechaInicio).getTime()
  const fin = new Date(fechaFin).getTime()
  const ahora = new Date().getTime()
  
  if (ahora < inicio) return 0
  if (ahora > fin) return 100
  
  const tiempoTotal = fin - inicio
  const tiempoTranscurrido = ahora - inicio
  
  return Math.round((tiempoTranscurrido / tiempoTotal) * 100)
}

export function ContractorDashboard({ user }: ContractorDashboardProps) {
  const [data, setData] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    getContractors().then(list => {
      // Solo buscar el contrato que coincida con la cédula del usuario
      const found = list.find(c => c.cedula === user.cedula) ?? null
      setData(found)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user.cedula])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
      Cargando contrato...
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
      No se encontró información de contrato asociada a tu cuenta.
    </div>
  )

  // Calcular número de cuotas
  const numeroCuotas = data.numeroCuotas || Math.ceil(data.total / data.valorCuota)
  const progresoCuotas = calcularProgresoCuotas(data.historialCuotas, numeroCuotas)
  const progresoTiempo = calcularProgresoTiempo(data.fechaInicio, data.fechaFin)
  
  // Verificar si debe entregar informe
  const debeEntregarInforme = data.estadoCuota === 'pendiente_informe_contratista'

  // Estados del proceso de pago para el stepper
  const estadosProceso: EstadoCuota[] = [
    'pendiente_informe_contratista',
    'pendiente_informe_supervision',
    'gestion_documentos_pago',
    'enviado_presupuesto',
    'remitido_pagaduria',
    'pagado'
  ]
  const currentStepIndex = estadosProceso.indexOf(data.estadoCuota)

  const stats = [
    { title: 'Total del Contrato', value: `${data.total.toLocaleString('es-CO')}`, icon: DollarSign, desc: 'Valor total pactado' },
    { 
      title: 'Cuota Actual', 
      value: (
        <span>
          <span className="text-green-600 dark:text-green-400">{data.cuotaNo}</span>
          <span className="text-muted-foreground">/{numeroCuotas}</span>
        </span>
      ), 
      icon: TrendingUp, 
      desc: `${data.valorCuota.toLocaleString('es-CO')} por cuota` 
    },
    { 
      title: 'Estado de la Cuota', 
      value: (
        <div className="space-y-2">
          {getStatusBadge(data.estadoCuota, true)}
          {/* Mini stepper compacto */}
          <div className="flex items-center gap-0.5">
            {estadosProceso.map((estado, idx) => {
              const isCompleted = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <div
                  key={estado}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-blue-500'
                      : 'bg-muted'
                  }`}
                  title={getEstadoCuotaLabel(estado)}
                />
              )
            })}
          </div>
        </div>
      ), 
      icon: data.estadoCuota === 'pagado' ? CheckCircle : AlertCircle, 
      desc: `Paso ${currentStepIndex + 1} de ${estadosProceso.length}` 
    },
  ]

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bienvenido, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground">Consulta el estado de tu contrato y pagos</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerta si debe entregar informe */}
      {debeEntregarInforme && (
        <Alert className="border-amber-400/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-400 font-medium">
            Debe entregar su Informe mensual al supervisor
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 grid-cols-3">
        {stats.map((s, i) => (
          <Card key={i} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="text-xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Información del Contrato</CardTitle>
          <CardDescription className="text-xs">Contrato No. {data.contratoNo}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Objeto Contractual</p>
            <p className="text-sm font-medium">{data.objetoContractual}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Supervisor</p>
            <p className="text-sm font-medium">{data.supervisor}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de Inicio</p>
            <p className="text-sm font-medium">{data.fechaInicio || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Seguimiento de Pagos con Timeline */}
      <Card className="flex-1 border-border/50 shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Seguimiento de Pagos</CardTitle>
          <CardDescription className="text-xs">Progreso de tu contrato</CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-6">
          
          {/* Timeline de Cuotas Pagadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm font-semibold">Progreso de Pagos</p>
              </div>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">{progresoCuotas}%</span>
            </div>
            <Progress value={progresoCuotas} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{data.historialCuotas?.filter(c => c.estadoCuota === 'pagado').length || 0} cuotas pagadas</span>
              <span>{numeroCuotas} cuotas totales</span>
            </div>
          </div>

          {/* Timeline de Tiempo del Contrato */}
          {data.fechaInicio && data.fechaFin && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-semibold">Tiempo del Contrato</p>
                </div>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progresoTiempo}%</span>
              </div>
              <Progress value={progresoTiempo} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Inicio: {data.fechaInicio}</span>
                <span>Fin: {data.fechaFin}</span>
              </div>
            </div>
          )}

          {/* Timeline Visual del Proceso de Pago */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Estado del Proceso</p>
            <div className="flex items-center gap-2">
              {[
                { key: 'pendiente_informe_contratista', label: 'Informe Contratista', short: 'IC' },
                { key: 'pendiente_informe_supervision', label: 'Informe Supervisión', short: 'IS' },
                { key: 'gestion_documentos_pago', label: 'Gestión Docs', short: 'GD' },
                { key: 'enviado_presupuesto', label: 'Presupuesto', short: 'PR' },
                { key: 'remitido_pagaduria', label: 'Pagaduría', short: 'PG' },
                { key: 'pagado', label: 'Pagado', short: '✓' },
              ].map((step, idx, arr) => {
                const estados: EstadoCuota[] = [
                  'pendiente_informe_contratista',
                  'pendiente_informe_supervision',
                  'gestion_documentos_pago',
                  'enviado_presupuesto',
                  'remitido_pagaduria',
                  'pagado'
                ]
                const currentIndex = estados.indexOf(data.estadoCuota)
                const stepIndex = estados.indexOf(step.key as EstadoCuota)
                const isCompleted = stepIndex < currentIndex
                const isCurrent = stepIndex === currentIndex

                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white ring-4 ring-blue-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                        title={step.label}
                      >
                        {step.short}
                      </div>
                      <p className={`text-[10px] mt-1 text-center leading-tight ${isCurrent ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-0.5 flex-1 -mx-1 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
