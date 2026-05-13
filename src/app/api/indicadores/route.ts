import { NextResponse } from 'next/server'

export const revalidate = 3600

export async function GET() {
  const apiKey = process.env.SBIF_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'SBIF_API_KEY no configurada' }, { status: 500 })

  try {
    const [ufRes, dolarRes] = await Promise.all([
      fetch(`https://api.sbif.cl/api-sbifv3/recursos_api/uf?apikey=${apiKey}&formato=json`),
      fetch(`https://api.sbif.cl/api-sbifv3/recursos_api/dolar?apikey=${apiKey}&formato=json`),
    ])

    const [ufData, dolarData] = await Promise.all([ufRes.json(), dolarRes.json()])

    const uf = parseFloat(ufData?.UFs?.[0]?.Valor?.replace('.', '').replace(',', '.') ?? '0')
    const dolar = parseFloat(dolarData?.Dolares?.[0]?.Valor?.replace('.', '').replace(',', '.') ?? '0')
    const fecha = ufData?.UFs?.[0]?.Fecha ?? new Date().toISOString().split('T')[0]

    return NextResponse.json({ uf, dolar, fecha })
  } catch {
    return NextResponse.json({ error: 'Error al obtener indicadores' }, { status: 502 })
  }
}
