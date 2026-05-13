import { db } from '@/lib/db'
import { quotes, quoteItems } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import IndicadoresBar from '@/components/IndicadoresBar'
import PreviewCotizacion from '@/components/cotizador/PreviewCotizacion'
import DescargaPDF from '@/components/cotizador/DescargaPDF'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Cotizacion, ItemCotizacion } from '@/types'

export const dynamic = 'force-dynamic'

export default async function CotizacionDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [quote] = await db.select().from(quotes).where(eq(quotes.id, id))
  if (!quote) notFound()

  const items = await db.select().from(quoteItems).where(eq(quoteItems.quote_id, id)).orderBy(quoteItems.orden)

  const cotizacion: Cotizacion = {
    ...quote,
    numero: quote.numero ?? '',
    correlativo: quote.correlativo ?? 0,
    descuento_global: Number(quote.descuento_global ?? 0),
    descuento_global_tipo: (quote.descuento_global_tipo ?? 'porcentaje') as 'porcentaje' | 'monto',
    descuento_global_monto: Number(quote.descuento_global_monto ?? 0),
    subtotal_neto: Number(quote.subtotal_neto),
    total_descuentos: Number(quote.total_descuentos ?? 0),
    neto_final: Number(quote.neto_final),
    iva_monto: Number(quote.iva_monto),
    total: Number(quote.total),
    moneda_cotizacion: (quote.moneda_cotizacion ?? 'CLP') as 'CLP' | 'USD' | 'UF',
    uf_valor: quote.uf_valor != null ? Number(quote.uf_valor) : null,
    dolar_valor: quote.dolar_valor != null ? Number(quote.dolar_valor) : null,
    estado: (quote.estado ?? 'borrador') as Cotizacion['estado'],
    validez_dias: quote.validez_dias ?? 30,
    created_at: quote.created_at?.toISOString() ?? '',
    updated_at: quote.updated_at?.toISOString() ?? '',
    items: items.map((i): ItemCotizacion => ({
      ...i,
      quote_id: i.quote_id ?? '',
      nombre: i.nombre,
      cantidad: Number(i.cantidad ?? 1),
      precio_unitario: Number(i.precio_unitario),
      costo_unitario: i.costo_unitario != null ? Number(i.costo_unitario) : null,
      descuento: Number(i.descuento ?? 0),
      descuento_tipo: (i.descuento_tipo ?? 'porcentaje') as 'porcentaje' | 'monto',
      descuento_monto: Number(i.descuento_monto ?? 0),
      subtotal: Number(i.subtotal),
      orden: i.orden ?? 0,
    })),
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <IndicadoresBar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/cotizaciones">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
          <DescargaPDF quote={cotizacion} />
        </div>

        <PreviewCotizacion quote={cotizacion} />
      </div>
    </div>
  )
}
