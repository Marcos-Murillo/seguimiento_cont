import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'
import { type Contractor, type CuotaHistorial } from './types'
import { validarCambioCuota, prepararAvanceCuota } from './cuota-validations'

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
  console.log('📝 updateContractor - Inicio:', { id, updated })
  
  // Si no hay datos previos, los obtenemos
  const prev = previous || await getContractor(id)
  if (!prev) throw new Error('Contratista no encontrado')

  console.log('📋 Datos previos:', {
    cuotaNo: prev.cuotaNo,
    estadoCuota: prev.estadoCuota,
    total: prev.total,
    valorCuota: prev.valorCuota
  })

  // Guardar el estado ANTES de preparar el avance (para el historial)
  const historialEntry: CuotaHistorial | null = buildHistorialEntry(prev, updated)
  console.log('📚 Entrada de historial:', historialEntry)

  // PRIMERO: Preparar avance automático si se marca como pagado
  const updatesConAvance = prepararAvanceCuota(prev, updated)
  console.log('🔄 Updates con avance:', updatesConAvance)

  // SEGUNDO: Validar cambios de cuota (después del avance automático)
  const validacion = validarCambioCuota(prev, updatesConAvance)
  if (!validacion.valid) {
    console.error('❌ Validación falló:', validacion.error)
    throw new Error(validacion.error)
  }
  console.log('✅ Validación exitosa')

  const { id: _id, ...rest } = updatesConAvance as Contractor
  void _id

  const payload: Record<string, unknown> = { ...rest, updatedAt: serverTimestamp() }

  if (historialEntry) {
    payload.historialCuotas = arrayUnion(historialEntry)
  }

  console.log('💾 Guardando en Firebase:', payload)
  await updateDoc(doc(db, COL, id), payload)
  console.log('✅ Guardado exitoso')
}

function buildHistorialEntry(prev: Contractor, next: Partial<Contractor>): CuotaHistorial | null {
  // Registrar si cambió el estado (especialmente si se marca como pagado)
  const cambioEstado = next.estadoCuota !== undefined && next.estadoCuota !== prev.estadoCuota
  
  // También registrar si cambió la cuota manualmente
  const cambioCuota = next.cuotaNo !== undefined && next.cuotaNo !== prev.cuotaNo
  
  // O si cambió el valor o proceso de pago
  const cambioValor = next.valorCuota !== undefined && next.valorCuota !== prev.valorCuota
  const cambioProceso = next.procesoPago !== undefined

  if (!cambioEstado && !cambioCuota && !cambioValor && !cambioProceso) return null

  // Guardar el estado ACTUAL (antes del cambio) en el historial
  const now = new Date()
  return {
    cuotaNo:     prev.cuotaNo,
    valorPagado: prev.valorCuota,
    estadoCuota: next.estadoCuota || prev.estadoCuota, // Usar el nuevo estado si se está cambiando
    fechaPago:   now.toISOString().split('T')[0],
    fechaActualizacion: now.toISOString(), // Fecha y hora completa
    observaciones: prev.observaciones || '',
    procesoPago: prev.procesoPago,
  }
}

// ── Eliminar ─────────────────────────────────────────────────────────────────
export async function deleteContractor(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}
