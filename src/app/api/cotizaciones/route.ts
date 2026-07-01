import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { quotes, quoteItems } from '@/lib/schema'
import { max } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { quoteData, itemsData } = body

    const [{ maxCorrelativo }] = await db
      .select({ maxCorrelativo: max(quotes.correlativo) })
      .from(quotes)

    // La secuencia arranca en 01633 (numeración heredada); nunca retrocede.
    const correlativo = Math.max(Number(maxCorrelativo ?? 0) + 1, 1633)
    const numero = `COT-${String(correlativo).padStart(5, '0')}`

    const [quote] = await db
      .insert(quotes)
      .values({ ...quoteData, correlativo, numero })
      .returning()

    if (itemsData?.length) {
      await db.insert(quoteItems).values(
        itemsData.map((item: Record<string, unknown>) => ({ ...item, quote_id: quote.id }))
      )
    }

    return NextResponse.json({ id: quote.id, numero: quote.numero })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/cotizaciones]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
