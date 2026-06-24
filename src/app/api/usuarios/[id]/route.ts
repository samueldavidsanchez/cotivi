import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { auth } from '@/auth'
import { and, eq, ne } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const ROLES = ['admin', 'vendedor']

// PATCH /api/usuarios/[id] — actualizar nombre, email, rol, activo y/o contraseña. Solo admin.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const esPropio = session.user.id === id
  const body = await req.json()

  const updates: Record<string, unknown> = {}

  if (typeof body.nombre === 'string' && body.nombre.trim()) {
    updates.nombre = body.nombre.trim()
  }

  if (typeof body.email === 'string' && body.email.trim()) {
    const email = body.email.trim().toLowerCase()
    const [otro] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, id)))
      .limit(1)
    if (otro) {
      return NextResponse.json({ error: 'Ese email ya está en uso por otro usuario.' }, { status: 409 })
    }
    updates.email = email
  }

  if (ROLES.includes(body.rol)) {
    // Un admin no puede quitarse a sí mismo el rol de admin (evita quedar sin admins).
    if (esPropio && body.rol !== 'admin') {
      return NextResponse.json({ error: 'No puedes cambiar tu propio rol.' }, { status: 400 })
    }
    updates.rol = body.rol
  }

  if (typeof body.activo === 'boolean') {
    if (esPropio && body.activo === false) {
      return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta.' }, { status: 400 })
    }
    updates.activo = body.activo
  }

  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
    }
    updates.password_hash = await bcrypt.hash(body.password, 12)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No hay cambios para aplicar.' }, { status: 400 })
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      nombre: users.nombre,
      email: users.email,
      rol: users.rol,
      activo: users.activo,
      created_at: users.created_at,
    })

  if (!updated) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

// DELETE /api/usuarios/[id] — eliminar usuario. Solo admin, no a sí mismo.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  if (session.user.id === id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 })
  }

  const [deleted] = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id })

  if (!deleted) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
