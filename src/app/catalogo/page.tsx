import { db } from '@/lib/db'
import { products } from '@/lib/schema'
import { asc } from 'drizzle-orm'
import Navbar from '@/components/Navbar'
import IndicadoresBar from '@/components/IndicadoresBar'
import CatalogoCliente from './CatalogoCliente'
import { Producto } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CatalogoPage() {
  const rows = await db.select().from(products).orderBy(asc(products.categoria), asc(products.nombre))
  const parsed: Producto[] = rows.map((p) => ({
    ...p,
    precio_venta: Number(p.precio_venta),
    costo: p.costo != null ? Number(p.costo) : null,
    tipo: (p.tipo ?? 'Producto') as 'Producto' | 'Servicio',
    moneda: (p.moneda ?? 'CLP') as 'CLP' | 'USD' | 'UF',
    unidad: p.unidad ?? 'unidad',
    activo: p.activo ?? true,
    created_at: p.created_at?.toISOString() ?? '',
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <IndicadoresBar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <CatalogoCliente productos={parsed} />
      </div>
    </div>
  )
}
