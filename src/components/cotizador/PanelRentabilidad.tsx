'use client'
import { useCotizacionStore } from '@/store/cotizacion'
import { calcularRentabilidad, formatCLP } from '@/lib/cotizacion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function PanelRentabilidad() {
  const items = useCotizacionStore((s) => s.items)
  const { costoTotal, precioTotal, profitBruto, margenPorcentaje, porItem } = calcularRentabilidad(items)

  const esRentable = profitBruto >= 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-[#282828]">Rentabilidad</h3>
        {esRentable ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Costo total</p>
          <p className="font-semibold text-sm">{formatCLP(costoTotal)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Precio neto</p>
          <p className="font-semibold text-sm">{formatCLP(precioTotal)}</p>
        </div>
        <div className={`rounded-lg p-3 col-span-2 ${esRentable ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="text-xs text-gray-500">Profit bruto</p>
          <div className="flex items-baseline gap-2">
            <p className={`font-bold text-base ${esRentable ? 'text-green-700' : 'text-red-600'}`}>
              {formatCLP(profitBruto)}
            </p>
            <p className={`text-sm ${esRentable ? 'text-green-600' : 'text-red-500'}`}>
              ({margenPorcentaje.toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      {porItem.length > 0 && (
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Por ítem</p>
          {porItem.map((i, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="truncate text-gray-600 max-w-[120px]">{i.nombre}</span>
              <div className="flex items-center gap-2">
                <span className={i.profit >= 0 ? 'text-green-600' : 'text-red-500'}>
                  {formatCLP(i.profit)}
                </span>
                <span className={`text-gray-400 w-14 text-right ${i.margen >= 0 ? '' : 'text-red-400'}`}>
                  {i.margen.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
