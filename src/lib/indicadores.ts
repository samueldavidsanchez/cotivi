import { Indicadores } from '@/types'

export async function getIndicadores(): Promise<Indicadores> {
  const res = await fetch('/api/indicadores', { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('No se pudieron obtener los indicadores')
  return res.json()
}
