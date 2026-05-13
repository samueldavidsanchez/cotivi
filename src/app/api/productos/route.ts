import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(products).where(eq(products.activo, true)).orderBy(asc(products.nombre))
  const parsed = rows.map((p) => ({
    ...p,
    precio_venta: Number(p.precio_venta),
    costo: p.costo != null ? Number(p.costo) : null,
  }))
  return NextResponse.json(parsed)
}
