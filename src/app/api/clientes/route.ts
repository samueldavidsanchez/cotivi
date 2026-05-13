import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clients } from '@/lib/schema'
import { or, ilike, eq } from 'drizzle-orm'
import { normalizeRut } from '@/lib/rut'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) return NextResponse.json([])

  const results = await db
    .select()
    .from(clients)
    .where(
      or(
        ilike(clients.nombre,  `%${q}%`),
        ilike(clients.empresa, `%${q}%`),
        ilike(clients.email,   `%${q}%`),
        ilike(clients.rut,     `%${q}%`),
      )
    )
    .limit(8)

  return NextResponse.json(results)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, empresa, rut, email, telefono } = body

  const rutNorm = rut ? normalizeRut(rut) : null

  // Si tiene RUT, upsert por RUT; si no, crea nuevo
  if (rutNorm) {
    const [existing] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.rut, rutNorm))
      .limit(1)

    if (existing) {
      const [updated] = await db
        .update(clients)
        .set({ nombre, empresa, email, telefono, updated_at: new Date() })
        .where(eq(clients.id, existing.id))
        .returning()
      return NextResponse.json(updated)
    }
  }

  const [created] = await db
    .insert(clients)
    .values({ nombre, empresa, rut: rutNorm, email, telefono })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
