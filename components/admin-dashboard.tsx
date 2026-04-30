'use client'

import { type User, mockContractors, mockPendingUsers } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users, DollarSign, Clock, CheckCircle2, XCircle, AlertTriangle,
  FileWarning, CalendarClock, TrendingUp, ShieldAlert, FileX, Link,
  BadgeCheck, CircleDot,
} from 'lucide-react'

interface AdminDashboardProps { user: User }

const today = new Date('2026-04-28')

function parseDate(str: string): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

function diffDays(date: Date): number {
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const c = mockContractors

  // ── Financieras ──────────────────────────────────────────────────────────
  const totalActivos     = c.filter(x => x.estadoCuenta === 'activo').reduce((s, x) => s + x.total, 0)
  const totalPagado      = c.filter(x => x.estadoCuota === 'pagado').reduce((s, x) => s + x.valorCuota, 0)
  const totalPendiente   = c.filter(x => x.estadoCuota === 'pendiente' || x.estadoCuota === 'en_proceso').reduce((s, x) => s + x.valorCuota, 0)
  const valorPromCuota   = c.length ? Math.round(c.reduce((s, x) => s + x.valorCuota, 0) / c.length) : 0
  const totalComprometido = c.reduce((s, x) => s + x.total, 0)

  // ── Estado de pagos ──────────────────────────────────────────────────────
  const porEstado = {
    pendiente:  c.filter(x => x.estadoCuota === 'pendiente').length,
    en_proceso: c.filter(x => x.estadoCuota === 'en_proceso').length,
    pagado:     c.filter(x => x.estadoCuota === 'pagado').length,
    rechazado:  c.filter(x => x.estadoCuota === 'rechazado').length,
  }
  const alDia    = c.filter(x => x.estadoCuota === 'pagado' || x.estadoCuota === 'en_proceso').length
  const atrasado = c.filter(x => x.estadoCuota === 'pendiente' || x.estadoCuota === 'rechazado').length
  const pctAlDia = c.length ? Math.round((alDia / c.length) * 100) : 0

  // ── Documentación ────────────────────────────────────────────────────────
  const sinInforme    = c.filter(x => !x.informeSupervision || x.informeSupervision === 'Pendiente').length
  const sinAprobacion = c.filter(x => !x.fechaAprobacion).length
  const sinEnlaceCRD  = c.filter(x => !x.contratacionCRD.enlace).length

  // ── Alertas ──────────────────────────────────────────────────────────────
  const proximosVencer = c.filter(x => {
    const d = parseDate(x.fechaEntrega)
    if (!d) return false
    const diff = diffDays(d)
    return diff >= 0 && diff <= 7
  })
  const rechazados   = c.filter(x => x.estadoCuota === 'rechazado')
  const suspendidos  = c.filter(x => x.estadoCuenta === 'suspendido')

  // ── Proceso de pago ──────────────────────────────────────────────────────
  const todasAprobadas = c.filter(x =>
    Object.values(x.procesoPago).every(v => v.toLowerCase() === 'aprobado' || v.toLowerCase() === 'n/a')
  ).length
  const conPendientesPago = c.filter(x =>
    Object.values(x.procesoPago).some(v => v.toLowerCase() === 'pendiente')
  ).length
  const conRechazadosPago = c.filter(x =>
    Object.values(x.procesoPago).some(v => v.toLowerCase() === 'rechazado')
  ).length

  const fmt = (n: number) => `$${n.toLocaleString('es-CO')}`

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenido, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen general del sistema de seguimiento de contratistas</p>
      </div>

      {/* ── Alertas activas ─────────────────────────────────────────────── */}
      {(proximosVencer.length > 0 || rechazados.length > 0 || suspendidos.length > 0 || mockPendingUsers.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alertas</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {proximosVencer.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-yellow-400/40 bg-yellow-500/10">
                <CalendarClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Entregas próximas</p>
                  <p className="text-xs text-muted-foreground">{proximosVencer.length} contrato(s) vencen en los próximos 7 días</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {proximosVencer.map(x => (
                      <Badge key={x.id} variant="outline" className="text-[10px] border-yellow-400/40 text-yellow-700 dark:text-yellow-400">{x.nombre.split(' ')[0]}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {rechazados.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-red-400/40 bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Pagos rechazados</p>
                  <p className="text-xs text-muted-foreground">{rechazados.length} contrato(s) requieren atención inmediata</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {rechazados.map(x => (
                      <Badge key={x.id} variant="outline" className="text-[10px] border-red-400/40 text-red-700 dark:text-red-400">{x.nombre.split(' ')[0]}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {suspendidos.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-orange-400/40 bg-orange-500/10">
                <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Contratos suspendidos</p>
                  <p className="text-xs text-muted-foreground">{suspendidos.length} cuenta(s) suspendida(s)</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {suspendidos.map(x => (
                      <Badge key={x.id} variant="outline" className="text-[10px] border-orange-400/40 text-orange-700 dark:text-orange-400">{x.nombre.split(' ')[0]}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {mockPendingUsers.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-400/40 bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Aprobaciones pendientes</p>
                  <p className="text-xs text-muted-foreground">{mockPendingUsers.length} usuario(s) esperan aprobación de acceso</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Financieras ─────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Financiero</p>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={TrendingUp} label="Total comprometido" value={fmt(totalComprometido)} color="text-primary" />
          <StatCard icon={DollarSign} label="Contratos activos" value={fmt(totalActivos)} sub="valor total" color="text-green-600 dark:text-green-400" />
          <StatCard icon={CheckCircle2} label="Cuotas pagadas" value={fmt(totalPagado)} sub="acumulado" color="text-green-600 dark:text-green-400" />
          <StatCard icon={Clock} label="Por cobrar" value={fmt(totalPendiente)} sub="pendiente + en proceso" color="text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-2 max-w-sm">
          <StatCard icon={DollarSign} label="Valor promedio cuota" value={fmt(valorPromCuota)} color="text-muted-foreground" />
        </div>
      </div>

      {/* ── Estado de pagos ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado de Pagos</p>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Clock} label="Pendientes" value={porEstado.pendiente} sub="cuotas" color="text-yellow-600 dark:text-yellow-400" />
          <StatCard icon={CircleDot} label="En proceso" value={porEstado.en_proceso} sub="cuotas" color="text-blue-600 dark:text-blue-400" />
          <StatCard icon={CheckCircle2} label="Pagados" value={porEstado.pagado} sub="cuotas" color="text-green-600 dark:text-green-400" />
          <StatCard icon={XCircle} label="Rechazados" value={porEstado.rechazado} sub="cuotas" color="text-red-600 dark:text-red-400" />
        </div>
        {/* Barra de progreso al día */}
        <div className="p-4 rounded-lg border border-border/50 bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Contratos al día</p>
            <span className="text-sm font-bold">{pctAlDia}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pctAlDia}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
            <span>{alDia} al día</span>
            <span>{atrasado} con retraso</span>
          </div>
        </div>
      </div>

      {/* ── Documentación ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documentación</p>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <DocAlert icon={FileWarning} label="Sin informe de supervisión" count={sinInforme} total={c.length}
            color={sinInforme > 0 ? 'border-orange-400/40 bg-orange-500/10 text-orange-700 dark:text-orange-400' : 'border-green-400/40 bg-green-500/10 text-green-700 dark:text-green-400'} />
          <DocAlert icon={FileX} label="Sin fecha de aprobación" count={sinAprobacion} total={c.length}
            color={sinAprobacion > 0 ? 'border-yellow-400/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' : 'border-green-400/40 bg-green-500/10 text-green-700 dark:text-green-400'} />
          <DocAlert icon={Link} label="Sin enlace CRD" count={sinEnlaceCRD} total={c.length}
            color={sinEnlaceCRD > 0 ? 'border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-400' : 'border-green-400/40 bg-green-500/10 text-green-700 dark:text-green-400'} />
        </div>
      </div>

      {/* ── Proceso de pago ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proceso de Pago</p>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <StatCard icon={BadgeCheck} label="Proceso completo" value={todasAprobadas} sub="contratos con todo aprobado" color="text-green-600 dark:text-green-400" />
          <StatCard icon={AlertTriangle} label="Con cuentas pendientes" value={conPendientesPago} sub="requieren seguimiento" color="text-yellow-600 dark:text-yellow-400" />
          <StatCard icon={XCircle} label="Con cuentas rechazadas" value={conRechazadosPago} sub="requieren corrección" color="text-red-600 dark:text-red-400" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 shrink-0 ${color ?? 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className={`text-2xl font-bold ${color ?? 'text-foreground'}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function DocAlert({ icon: Icon, label, count, total, color }: {
  icon: React.ElementType; label: string; count: number; total: number; color: string
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${color}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs opacity-80">{count === 0 ? 'Todo en orden' : `${count} de ${total} contratos`}</p>
      </div>
      <span className="ml-auto text-2xl font-bold shrink-0">{count}</span>
    </div>
  )
}
