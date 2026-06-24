import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { auth } from '@/auth'
import { desc, eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const ROLES = ['admin', 'vendedor']

// GET /api/usuarios — lista de usuarios (sin hash). Solo admin.
export async function GET() {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const lista = await db
    .select({
      id: users.id,
      nombre: users.nombre,
      email: users.email,
      rol: users.rol,
      activo: users.activo,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(desc(users.created_at))

  return NextResponse.json(lista)
}

// POST /api/usuarios — crear usuario. Solo admin.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const nombre = (body.nombre ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const rol = ROLES.includes(body.rol) ? body.rol : 'vendedor'

  if (!nombre || !email || password.length < 6) {
    return NextResponse.json(
      { error: 'Nombre, email y contraseña (mín. 6 caracteres) son obligatorios.' },
      { status: 400 }
    )
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing) {
    return NextResponse.json({ error: 'Ya existe un usuario con ese email.' }, { status: 409 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const [created] = await db
    .insert(users)
    .values({ nombre, email, password_hash, rol })
    .returning({
      id: users.id,
      nombre: users.nombre,
      email: users.email,
      rol: users.rol,
      activo: users.activo,
      created_at: users.created_at,
    })

  return NextResponse.json(created, { status: 201 })
}
