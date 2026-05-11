'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { type Contractor } from '@/lib/types'
import { getContractors } from '@/lib/firebase-db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getEstadoCuotaLabel, getEstadoCuotaColor } from '@/lib/estado-utils'
import { History, FileText, Calendar, DollarSign } from 'lucide-react'

export default function HistorialPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Contractor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    getContractors().then(list => {
      const found = list.find(c => c.cedula === user.cedula) ?? null
      setData(found)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Cargando historial...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No se encontró información de contrato asociada a tu cuenta.
      </div>
    )
  }

  const historial = data.historialCuotas || []

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Historial de Pagos</h1>
        <p className="text-sm text-muted-foreground">Registro de todas las actualizaciones de tu contrato</p>
      </div>

      {/* Resumen del contrato */}
      <div className="grid gap-3 grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Contrato No.</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold">{data.contratoNo}</div>
            <p className="text-xs text-muted-foreground">{data.objetoContractual}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Contrato</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold">${data.total.toLocaleString('es-CO')}</div>
            <p className="text-xs text-muted-foreground">Valor total pactado</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cuotas Pagadas</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {historial.filter(h => h.estadoCuota === 'pagado').length}
            </div>
            <p className="text-xs text-muted-foreground">de {data.numeroCuotas || Math.ceil(data.total / data.valorCuota)} totales</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Supervisor</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold">{data.supervisor}</div>
            <p className="text-xs text-muted-foreground">Responsable</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de historial */}
      <Card className="flex-1 border-border/50 shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Historial de Actualizaciones</CardTitle>
          <CardDescription className="text-xs">
            {historial.length} {historial.length === 1 ? 'registro' : 'registros'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          {historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <History className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">No hay actualizaciones registradas aún</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent text-xs">
                  <TableHead className="font-semibold">Cuota No.</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold text-right">Valor</TableHead>
                  <TableHead className="font-semibold">Fecha Actualización</TableHead>
                  <TableHead className="font-semibold">Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historial.map((h, idx) => (
                  <TableRow key={idx} className="text-sm">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold">{h.cuotaNo}</span>
                        {h.estadoCuota === 'pagado' && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400">
                            ✓ Pagado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getEstadoCuotaColor(h.estadoCuota)}
                      >
                        {getEstadoCuotaLabel(h.estadoCuota)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${data.valorCuota.toLocaleString('es-CO')}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {h.fechaActualizacion ? new Date(h.fechaActualizacion).toLocaleString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                      {h.observaciones || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
