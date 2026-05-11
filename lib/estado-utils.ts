import { type EstadoCuota } from './types'

export const ESTADO_CUOTA_LABELS: Record<EstadoCuota, string> = {
  pendiente_informe_contratista: 'Pendiente informe de actividades (contratista)',
  pendiente_informe_supervision: 'Pendiente informe de supervisión',
  gestion_documentos_pago: 'Gestión documentos para pago en trámite',
  enviado_presupuesto: 'Enviado a Presupuesto',
  remitido_pagaduria: 'Remitido a Pagaduría',
  pagado: 'Pagado',
}

export const ESTADO_CUOTA_COLORS: Record<EstadoCuota, string> = {
  pendiente_informe_contratista: 'bg-yellow-500/10 text-yellow-700 border-yellow-400/30 dark:text-yellow-400',
  pendiente_informe_supervision: 'bg-orange-500/10 text-orange-700 border-orange-400/30 dark:text-orange-400',
  gestion_documentos_pago: 'bg-blue-500/10 text-blue-700 border-blue-400/30 dark:text-blue-400',
  enviado_presupuesto: 'bg-indigo-500/10 text-indigo-700 border-indigo-400/30 dark:text-indigo-400',
  remitido_pagaduria: 'bg-purple-500/10 text-purple-700 border-purple-400/30 dark:text-purple-400',
  pagado: 'bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400',
}

export function getEstadoCuotaLabel(estado: EstadoCuota): string {
  return ESTADO_CUOTA_LABELS[estado] || estado
}

export function getEstadoCuotaColor(estado: EstadoCuota): string {
  return ESTADO_CUOTA_COLORS[estado] || 'bg-muted text-muted-foreground'
}
