import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { auth } from '@/auth'
import { eq, asc } from 'drizzle-orm'

const TIPOS = ['Producto', 'Servicio']
const MONEDAS = ['CLP', 'USD', 'UF']

export async function GET() {
  const rows = await db.select().from(products).where(eq(products.activo, true)).orderBy(asc(products.nombre))
  const parsed = rows.map((p) => ({
    ...p,
    precio_venta: Number(p.precio_venta),
    costo: p.costo != null ? Number(p.costo) : null,
  }))
  return NextResponse.json(parsed)
}

// POST /api/productos — crear un producto individual. Solo admin.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const nombre = (body.nombre ?? '').trim()
  const precio = Number(body.precio_venta)

  if (!nombre || Number.isNaN(precio) || precio < 0) {
    return NextResponse.json(
      { error: 'Nombre y precio de venta válido son obligatorios.' },
      { status: 400 }
    )
  }

  const codigo = body.codigo?.trim() || null
  if (codigo) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.codigo, codigo))
      .limit(1)
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un producto con ese código.' }, { status: 409 })
    }
  }

  const costoRaw = body.costo
  const costo = costoRaw == null || costoRaw === '' ? null : Number(costoRaw)
  if (costo != null && (Number.isNaN(costo) || costo < 0)) {
    return NextResponse.json({ error: 'El costo no es válido.' }, { status: 400 })
  }

  const [created] = await db
    .insert(products)
    .values({
      codigo,
      nombre,
      descripcion: body.descripcion?.trim() || null,
      categoria: body.categoria?.trim() || null,
      tipo: TIPOS.includes(body.tipo) ? body.tipo : 'Producto',
      unidad: body.unidad?.trim() || 'unidad',
      precio_venta: precio.toString(),
      costo: costo != null ? costo.toString() : null,
      moneda: MONEDAS.includes(body.moneda) ? body.moneda : 'CLP',
      activo: typeof body.activo === 'boolean' ? body.activo : true,
    })
    .returning()

  return NextResponse.json(
    {
      ...created,
      precio_venta: Number(created.precio_venta),
      costo: created.costo != null ? Number(created.costo) : null,
      created_at: created.created_at?.toISOString() ?? '',
    },
    { status: 201 }
  )
}
