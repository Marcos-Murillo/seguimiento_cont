/**
 * Crea el super admin en Firebase Auth + Firestore.
 * Uso: node scripts/seed-superadmin.mjs
 *
 * Requiere FIREBASE_ADMIN_* en .env.local
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Leer .env.local manualmente
const envPath = resolve(__dirname, '../.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const { initializeApp, cert, getApps } = await import('firebase-admin/app')
const { getAuth }      = await import('firebase-admin/auth')
const { getFirestore, FieldValue } = await import('firebase-admin/firestore')

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = getAuth()
const db   = getFirestore()

const EMAIL    = '1007260358@sc.local'
const PASSWORD = 'romanos812'
const NAME     = 'Super Administrador'
const CEDULA   = '1007260358'

try {
  // Intentar crear; si ya existe, obtenerlo
  let uid
  try {
    const user = await auth.createUser({ email: EMAIL, password: PASSWORD, displayName: NAME })
    uid = user.uid
    console.log('✅ Usuario creado en Auth:', uid)
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      const user = await auth.getUserByEmail(EMAIL)
      uid = user.uid
      console.log('ℹ️  Usuario ya existe en Auth:', uid)
    } else throw e
  }

  // Guardar/actualizar perfil en Firestore
  await db.collection('usuarios').doc(uid).set({
    name: NAME,
    email: EMAIL,
    cedula: CEDULA,
    role: 'super_admin',
    approvalStatus: 'approved',
    createdAt: FieldValue.serverTimestamp(),
    lastLogin: null,
  }, { merge: true })

  console.log('✅ Perfil guardado en Firestore')
  console.log('\n--- Credenciales de acceso ---')
  console.log('Cédula / Email:', EMAIL)
  console.log('Contraseña:    ', PASSWORD)
  process.exit(0)
} catch (e) {
  console.error('❌ Error:', e.message)
  process.exit(1)
}
