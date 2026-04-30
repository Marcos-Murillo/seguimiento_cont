'use client'

import { useState, useEffect } from 'react'
import { type User, type Contractor } from '@/lib/types'
import { getContractors } from '@/lib/firebase-db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ContractorDashboardProps { user: User }

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    pendiente:  { label: 'Pendiente',  className: 'bg-yellow-500/10 text-yellow-700 border-yellow-400/30 dark:text-yellow-400' },
    en_proceso: { label: 'En Proceso', className: 'bg-blue-500/10 text-blue-700 border-blue-400/30 dark:text-blue-400' },
    pagado:     { label: 'Pagado',     className: 'bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400' },
    rechazado:  { label: 'Rechazado',  className: 'bg-red-500/10 text-red-700 border-red-400/30 dark:text-red-400' },
    activo:     { label: 'Activo',     className: 'bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400' },
    inactivo:   { label: 'Inactivo',   className: 'bg-muted text-muted-foreground border-border' },
    suspendido: { label: 'Suspendido', className: 'bg-red-500/10 text-red-700 border-red-400/30 dark:text-red-400' },
  }
  const cfg = map[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
}

export function ContractorDashboard({ user }: ContractorDashboardProps) {
  const [data, setData] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContractors().then(list => {
      const found = list.find(c => c.cedula === user.cedula) ?? list[0] ?? null
      setData(found)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user.cedula])

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

  const stats = [
    { title: 'Total del Contrato', value: `$${data.total.toLocaleString('es-CO')}`, icon: FileText, desc: 'Valor total pactado' },
    { title: 'Cuota Actual', value: `No. ${data.cuotaNo}`, icon: Clock, desc: `$${data.valorCuota.toLocaleString('es-CO')}` },
    { title: 'Estado de la Cuota', value: getStatusBadge(data.estadoCuota), icon: data.estadoCuota === 'pagado' ? CheckCircle : AlertCircle, desc: 'Estado actual del pago' },
  ]

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bienvenido, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Consulta el estado de tu contrato y pagos</p>
      </div>

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
        <CardContent className="px-4 pb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Objeto Contractual</p>
            <p className="text-sm font-medium">{data.objetoContractual}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Supervisor</p>
            <p className="text-sm font-medium">{data.supervisor}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 border-border/50 shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Seguimiento de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent text-xs">
                <TableHead className="font-semibold">Fecha Entrega</TableHead>
                <TableHead className="font-semibold">No. CP</TableHead>
                <TableHead className="font-semibold">No. SP</TableHead>
                <TableHead className="font-semibold">F. Envío Presupuesto</TableHead>
                <TableHead className="font-semibold">Estado Cuenta</TableHead>
                <TableHead className="font-semibold">Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-sm">
                <TableCell>{data.fechaEntrega || '—'}</TableCell>
                <TableCell>{data.seguimientoSP?.noCP || '—'}</TableCell>
                <TableCell>{data.seguimientoSP?.noSP || '—'}</TableCell>
                <TableCell>{data.fechaEnvioPresupuesto || '—'}</TableCell>
                <TableCell>{getStatusBadge(data.estadoCuenta)}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-xs text-muted-foreground truncate">{data.observaciones || 'Sin observaciones'}</p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Informe de Supervisión</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="text-sm font-medium">{data.informeSupervision || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Elaboración</p>
            <p className="text-sm font-medium">{data.fechaElaboracionDFUV || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Aprobación</p>
            <p className="text-sm font-medium">{data.fechaAprobacion || 'Pendiente'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
