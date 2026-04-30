import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const db = adminDb()
    const snap = await db.collection('solicitudes_acceso').where('status', '==', 'pending').get()
    return NextResponse.json({ count: snap.size, items: snap.docs.map(d => ({ id: d.id, ...d.data() })) })
  } catch {
    return NextResponse.json({ count: 0, items: [] })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    if (!id || !status) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    const db = adminDb()
    await db.collection('solicitudes_acceso').doc(id).update({ status })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
