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

// DELETE — eliminar usuario
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const db = adminDb()
    await db.collection('usuarios').doc(id).delete()
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/usuarios error:', err)
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}

// PATCH — desactivar/activar usuario
export async function PATCH(req: Request) {
  try {
    const { id, approvalStatus } = await req.json()
    if (!id || !approvalStatus) {
      return NextResponse.json({ error: 'ID y approvalStatus requeridos' }, { status: 400 })
    }

    const db = adminDb()
    await db.collection('usuarios').doc(id).update({ 
      approvalStatus,
      updatedAt: new Date().toISOString()
    })
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/usuarios error:', err)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
