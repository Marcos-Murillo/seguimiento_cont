import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

// GET — usuarios con rol contractor y aprobados
export async function GET() {
  try {
    const db = adminDb()
    const snap = await db.collection('usuarios')
      .where('role', '==', 'contractor')
      .where('approvalStatus', '==', 'approved')
      .get()

    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json(users)
  } catch (err) {
    console.error('GET /api/usuarios error:', err)
    return NextResponse.json([], { status: 500 })
  }
}
