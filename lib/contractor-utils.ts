import { type Contractor } from '@/lib/types'
import { getContractors } from '@/lib/firebase-db'

export function cloneContractor(c: Contractor): Contractor {
  return {
    ...c,
    seguimientoSP: { ...c.seguimientoSP },
    consolidacionDocumentos: { ...c.consolidacionDocumentos },
    contratacionCRD: { ...c.contratacionCRD },
    documentosBase: { ...c.documentosBase },
    procesoPago: { ...c.procesoPago },
    historialCuotas: c.historialCuotas
      ? c.historialCuotas.map((h) => ({ ...h, procesoPago: { ...h.procesoPago } }))
      : undefined,
  }
}

/** El contrato ya cumplió todas sus cuotas y la última quedó pagada, o pasó su fecha de fin. */
export function isContractFinished(c: Contractor): boolean {
  if (c.fechaFin && /^\d{4}-\d{2}-\d{2}/.test(c.fechaFin)) {
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (c.fechaFin.slice(0, 10) < iso) return true
  }
  const n = cuotasSelectCount(c)
  return n > 0 && c.cuotaNo >= n && c.estadoCuota === 'pagado'
}

function createdAtMillis(c: Contractor): number {
  const raw = (c as Contractor & { createdAt?: { toMillis?: () => number; seconds?: number } | string | number }).createdAt
  if (raw == null) return 0
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    const t = Date.parse(raw)
    return Number.isNaN(t) ? 0 : t
  }
  if (typeof raw.toMillis === 'function') return raw.toMillis()
  if (typeof raw.seconds === 'number') return raw.seconds * 1000
  return 0
}

function compareContracts(a: Contractor, b: Contractor): number {
  const aDone = isContractFinished(a) ? 1 : 0
  const bDone = isContractFinished(b) ? 1 : 0
  if (aDone !== bDone) return aDone - bDone
  const byDate = createdAtMillis(b) - createdAtMillis(a)
  if (byDate !== 0) return byDate
  return (b.no || 0) - (a.no || 0)
}

/** Contratos de una cédula. Primero los vigentes, después los que ya terminaron. */
export function contractsForCedula(list: Contractor[], cedula?: string): Contractor[] {
  const mine = cedula ? list.filter((c) => c.cedula === cedula) : []
  return [...mine].sort(compareContracts)
}

/** Contrato vigente de una cédula. Si ya hay uno nuevo, no se muestra el que terminó. */
export function pickCurrentContract(list: Contractor[], cedula?: string): Contractor | null {
  return contractsForCedula(list, cedula)[0] ?? null
}

/** Opciones del select de cuota (evita división por cero e Infinity). */
export function cuotasSelectCount(c: Pick<Contractor, 'numeroCuotas' | 'total' | 'valorCuota'>): number {
  const nStored = c.numeroCuotas
  if (nStored != null && Number.isFinite(nStored) && nStored > 0) {
    return Math.min(Math.max(1, Math.floor(nStored)), 999)
  }
  const v = c.valorCuota
  const t = c.total
  if (v > 0 && Number.isFinite(v) && Number.isFinite(t) && t >= 0) {
    return Math.min(Math.max(1, Math.ceil(t / v)), 999)
  }
  return 1
}

export async function fetchContractorsList(): Promise<Contractor[]> {
  try {
    return await getContractors()
  } catch {
    return []
  }
}
