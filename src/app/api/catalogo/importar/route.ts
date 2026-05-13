import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { sql } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { rows } = body as { rows: typeof products.$inferInsert[] }

  if (!rows?.length) return NextResponse.json({ error: 'Sin datos' }, { status: 400 })

  // Productos con código: upsert. Sin código: insert directo.
  const conCodigo = rows.filter((r) => r.codigo)
  const sinCodigo = rows.filter((r) => !r.codigo)

  if (conCodigo.length) {
    await db
      .insert(products)
      .values(conCodigo)
      .onConflictDoUpdate({
        target: products.codigo,
        set: {
          nombre: sql`excluded.nombre`,
          descripcion: sql`excluded.descripcion`,
          categoria: sql`excluded.categoria`,
          tipo: sql`excluded.tipo`,
          unidad: sql`excluded.unidad`,
          precio_venta: sql`excluded.precio_venta`,
          costo: sql`excluded.costo`,
          moneda: sql`excluded.moneda`,
          activo: sql`excluded.activo`,
        },
      })
  }

  if (sinCodigo.length) {
    await db.insert(products).values(sinCodigo)
  }

  return NextResponse.json({ importados: rows.length })
}
