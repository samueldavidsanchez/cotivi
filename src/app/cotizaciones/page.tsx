import { db } from '@/lib/db'
import { quotes } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import Navbar from '@/components/Navbar'
import IndicadoresBar from '@/components/IndicadoresBar'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCLP } from '@/lib/cotizacion'
import { Plus, Eye } from 'lucide-react'
import { EstadoCotizacion } from '@/types'

const estadoBadge: Record<EstadoCotizacion, { label: string; variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning' }> = {
  borrador: { label: 'Borrador', variant: 'secondary' },
  enviada: { label: 'Enviada', variant: 'default' },
  aceptada: { label: 'Aceptada', variant: 'success' },
  rechazada: { label: 'Rechazada', variant: 'destructive' },
}

export const dynamic = 'force-dynamic'

export default async function CotizacionesPage() {
  const cotizaciones = await db
    .select({
      id: quotes.id,
      numero: quotes.numero,
      cliente_nombre: quotes.cliente_nombre,
      cliente_empresa: quotes.cliente_empresa,
      total: quotes.total,
      estado: quotes.estado,
      created_at: quotes.created_at,
    })
    .from(quotes)
    .orderBy(desc(quotes.created_at))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <IndicadoresBar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#282828]">Cotizaciones</h1>
          <Link href="/cotizador">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Nueva
            </Button>
          </Link>
        </div>

        {!cotizaciones.length ? (
          <div className="text-center py-24 text-gray-400">
            <p>No hay cotizaciones aún.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">N°</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Empresa</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="text-center px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cotizaciones.map((c) => {
                  const badge = estadoBadge[c.estado as EstadoCotizacion] ?? estadoBadge.borrador
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-[#8B9E45]">{c.numero}</td>
                      <td className="px-4 py-3">{c.cliente_nombre ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{c.cliente_empresa ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCLP(Number(c.total))}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {c.created_at?.toLocaleDateString('es-CL') ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/cotizaciones/${c.id}`}>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
