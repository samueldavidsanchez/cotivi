import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { auth } from '@/auth'
import { and, eq, ne } from 'drizzle-orm'

const TIPOS = ['Producto', 'Servicio']
const MONEDAS = ['CLP', 'USD', 'UF']

function serialize(p: typeof products.$inferSelect) {
  return {
    ...p,
    precio_venta: Number(p.precio_venta),
    costo: p.costo != null ? Number(p.costo) : null,
    created_at: p.created_at?.toISOString() ?? '',
  }
}

// PATCH /api/productos/[id] — editar un producto del catálogo. Solo admin.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}

  if (typeof body.nombre === 'string' && body.nombre.trim()) updates.nombre = body.nombre.trim()
  if ('descripcion' in body) updates.descripcion = body.descripcion?.trim() || null
  if ('categoria' in body) updates.categoria = body.categoria?.trim() || null
  if (TIPOS.includes(body.tipo)) updates.tipo = body.tipo
  if ('unidad' in body) updates.unidad = body.unidad?.trim() || 'unidad'
  if (MONEDAS.includes(body.moneda)) updates.moneda = body.moneda
  if (typeof body.activo === 'boolean') updates.activo = body.activo

  if (body.precio_venta != null && body.precio_venta !== '') {
    const precio = Number(body.precio_venta)
    if (Number.isNaN(precio) || precio < 0) {
      return NextResponse.json({ error: 'El precio de venta no es válido.' }, { status: 400 })
    }
    updates.precio_venta = precio.toString()
  }

  if ('costo' in body) {
    if (body.costo == null || body.costo === '') {
      updates.costo = null
    } else {
      const costo = Number(body.costo)
      if (Number.isNaN(costo) || costo < 0) {
        return NextResponse.json({ error: 'El costo no es válido.' }, { status: 400 })
      }
      updates.costo = costo.toString()
    }
  }

  // El código es único: verifica que no choque con otro producto.
  if ('codigo' in body) {
    const codigo = body.codigo?.trim() || null
    if (codigo) {
      const [otro] = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.codigo, codigo), ne(products.id, id)))
        .limit(1)
      if (otro) {
        return NextResponse.json({ error: 'Ya existe otro producto con ese código.' }, { status: 409 })
      }
    }
    updates.codigo = codigo
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No hay cambios para aplicar.' }, { status: 400 })
  }

  const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning()
  if (!updated) {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 })
  }

  return NextResponse.json(serialize(updated))
}

// DELETE /api/productos/[id] — eliminar un producto. Solo admin.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id })
  if (!deleted) {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
