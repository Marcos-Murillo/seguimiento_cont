'use client'

import { type User, mockContractors } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ContractorDashboardProps {
  user: User
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pendiente: { 
      label: 'Pendiente', 
      className: 'bg-warning/10 text-warning-foreground border-warning/30' 
    },
    en_proceso: { 
      label: 'En Proceso', 
      className: 'bg-primary/10 text-primary border-primary/30' 
    },
    pagado: { 
      label: 'Pagado', 
      className: 'bg-success/10 text-success border-success/30' 
    },
    rechazado: { 
      label: 'Rechazado', 
      className: 'bg-destructive/10 text-destructive border-destructive/30' 
    },
    activo: { 
      label: 'Activo', 
      className: 'bg-success/10 text-success border-success/30' 
    },
    inactivo: { 
      label: 'Inactivo', 
      className: 'bg-muted text-muted-foreground border-border' 
    },
    suspendido: { 
      label: 'Suspendido', 
      className: 'bg-destructive/10 text-destructive border-destructive/30' 
    },
  }

  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

export function ContractorDashboard({ user }: ContractorDashboardProps) {
  // Get contractor data by cedula
  const contractorData = mockContractors.find(c => c.cedula === user.cedula) || mockContractors[0]

  const stats = [
    {
      title: 'Total del Contrato',
      value: `$${contractorData.total.toLocaleString('es-CO')}`,
      icon: FileText,
      description: 'Valor total pactado'
    },
    {
      title: 'Cuota Actual',
      value: `${contractorData.cuotaNo}`,
      icon: Clock,
      description: `$${contractorData.valorCuota.toLocaleString('es-CO')}`
    },
    {
      title: 'Estado de la Cuota',
      value: getStatusBadge(contractorData.estadoCuota),
      icon: contractorData.estadoCuota === 'pagado' ? CheckCircle : AlertCircle,
      description: 'Estado actual del pago'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {user.name.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí puedes consultar el estado de tu contrato y tus pagos
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contractor info card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Información del Contrato
          </CardTitle>
          <CardDescription>
            Contrato No. {contractorData.contratoNo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Objeto Contractual</p>
              <p className="text-sm font-medium text-foreground">{contractorData.objetoContractual}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Supervisor</p>
              <p className="text-sm font-medium text-foreground">{contractorData.supervisor}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment tracking table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Seguimiento de Pagos
          </CardTitle>
          <CardDescription>
            Información detallada del estado de tus pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Fecha de Entrega</TableHead>
                <TableHead className="font-semibold">No. CP</TableHead>
                <TableHead className="font-semibold">No. SP</TableHead>
                <TableHead className="font-semibold">Fecha Envío a Presupuesto</TableHead>
                <TableHead className="font-semibold">Estado de Cuenta</TableHead>
                <TableHead className="font-semibold">Observaciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{contractorData.fechaEntrega}</TableCell>
                <TableCell>{contractorData.seguimientoSP.noCP}</TableCell>
                <TableCell>{contractorData.seguimientoSP.noSP}</TableCell>
                <TableCell>{contractorData.fechaEnvioPresupuesto}</TableCell>
                <TableCell>{getStatusBadge(contractorData.estadoCuenta)}</TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-muted-foreground truncate">
                    {contractorData.observaciones || 'Sin observaciones'}
                  </p>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supervision report card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Informe de Supervisión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Estado del Informe</p>
              <p className="text-sm font-medium text-foreground">{contractorData.informeSupervision}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha de Elaboración</p>
              <p className="text-sm font-medium text-foreground">{contractorData.fechaElaboracionDFUV}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fecha de Aprobación</p>
              <p className="text-sm font-medium text-foreground">
                {contractorData.fechaAprobacion || 'Pendiente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
