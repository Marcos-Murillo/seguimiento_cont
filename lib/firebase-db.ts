import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'
import { type Contractor, type CuotaHistorial } from './types'

const COL = 'contratistas'

// ── Leer todos ───────────────────────────────────────────────────────────────
export async function getContractors(): Promise<Contractor[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy('no')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Contractor))
}

// ── Leer uno ─────────────────────────────────────────────────────────────────
export async function getContractor(id: string): Promise<Contractor | null> {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Contractor
}

// ── Crear ────────────────────────────────────────────────────────────────────
export async function createContractor(data: Omit<Contractor, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// ── Actualizar — guarda snapshot de la cuota actual en historialCuotas ───────
export async function updateContractor(id: string, updated: Partial<Contractor>, previous?: Contractor): Promise<void> {
  const { id: _id, ...rest } = updated as Contractor
  void _id

  // Si hay datos previos y cambió algo relevante (cuota, estado, valor),
  // guardamos el estado anterior como entrada del historial
  const historialEntry: CuotaHistorial | null = previous ? buildHistorialEntry(previous, updated) : null

  const payload: Record<string, unknown> = { ...rest, updatedAt: serverTimestamp() }

  if (historialEntry) {
    // arrayUnion agrega al array sin duplicar
    payload.historialCuotas = arrayUnion(historialEntry)
  }

  await updateDoc(doc(db, COL, id), payload)
}

function buildHistorialEntry(prev: Contractor, next: Partial<Contractor>): CuotaHistorial | null {
  // Solo registrar si cambió cuota, estado, valor o proceso de pago
  const changed =
    next.cuotaNo !== undefined && next.cuotaNo !== prev.cuotaNo ||
    next.estadoCuota !== undefined && next.estadoCuota !== prev.estadoCuota ||
    next.valorCuota !== undefined && next.valorCuota !== prev.valorCuota ||
    next.procesoPago !== undefined

  if (!changed) return null

  return {
    cuotaNo:     prev.cuotaNo,
    valorPagado: prev.valorCuota,
    estadoCuota: prev.estadoCuota,
    fechaPago:   new Date().toISOString().split('T')[0],
    observaciones: prev.observaciones || '',
    procesoPago: prev.procesoPago,
  }
}

// ── Eliminar ─────────────────────────────────────────────────────────────────
export async function deleteContractor(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}
