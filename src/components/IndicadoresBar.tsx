'use client'
import { useEffect, useState } from 'react'
import { Indicadores } from '@/types'
import { getIndicadores } from '@/lib/indicadores'

export default function IndicadoresBar() {
  const [data, setData] = useState<Indicadores | null>(null)

  useEffect(() => {
    getIndicadores()
      .then(setData)
      .catch(() => null)
  }, [])

  if (!data) return null

  const clp = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

  return (
    <div className="bg-[#8B9E45]/10 border-b border-[#8B9E45]/20 text-xs text-[#282828]/70 px-4 py-1.5">
      <div className="max-w-7xl mx-auto flex gap-6">
        <span>
          <strong className="text-[#8B9E45]">UF</strong> {clp.format(data.uf)}
        </span>
        <span>
          <strong className="text-[#8B9E45]">USD</strong> {clp.format(data.dolar)}
        </span>
        <span className="ml-auto">{data.fecha}</span>
      </div>
    </div>
  )
}
