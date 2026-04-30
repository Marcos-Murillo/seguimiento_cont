import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// GET — listar todos los admins desde Firestore
export async function GET() {
  try {
    const db = adminDb()
    const snap = await db.collection('usuarios')
      .where('role', 'in', ['admin', 'super_admin'])
      .get()

    const admins = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const aTs = (a.createdAt as { seconds: number } | null)?.seconds ?? 0
        const bTs = (b.createdAt as { seconds: number } | null)?.seconds ?? 0
        return bTs - aTs
      })

    return NextResponse.json(admins)
  } catch (err) {
    console.error('GET /api/admins error:', err)
    return NextResponse.json({ error: 'Error al obtener administradores' }, { status: 500 })
  }
}

// POST — crear nuevo admin en Firebase Auth + Firestore
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'admin', cedula } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const auth = adminAuth()
    const db   = adminDb()

    const userRecord = await auth.createUser({ email, password, displayName: name })

    await db.collection('usuarios').doc(userRecord.uid).set({
      name,
      email,
      role,
      cedula: cedula ?? null,
      approvalStatus: 'approved',
      createdAt: FieldValue.serverTimestamp(),
      lastLogin: null,
    })

    return NextResponse.json({ id: userRecord.uid, name, email, role }, { status: 201 })
  } catch (err: unknown) {
    console.error(err)
    const msg = err instanceof Error ? err.message : 'Error al crear administrador'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE — eliminar admin de Auth + Firestore
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const auth = adminAuth()
    const db   = adminDb()

    await auth.deleteUser(id)
    await db.collection('usuarios').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error(err)
    const msg = err instanceof Error ? err.message : 'Error al eliminar administrador'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
