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
