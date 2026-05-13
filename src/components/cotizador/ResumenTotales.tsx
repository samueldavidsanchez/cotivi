'use client'
import { useCotizacionStore } from '@/store/cotizacion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCLP } from '@/lib/cotizacion'

export default function ResumenTotales() {
  const { descuentoGlobal, descuentoGlobalTipo, setDescuentoGlobal, totales } = useCotizacionStore()
  const { subtotalNeto, descuentoGlobalMonto, netoFinal, ivaMonto, total } = totales()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-[#282828]">Resumen</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal neto</span>
          <span>{formatCLP(subtotalNeto)}</span>
        </div>

        {descuentoGlobalMonto > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Descuento global</span>
            <span>- {formatCLP(descuentoGlobalMonto)}</span>
          </div>
        )}

        <div className="flex justify-between font-medium border-t border-gray-100 pt-2">
          <span>Neto</span>
          <span>{formatCLP(netoFinal)}</span>
        </div>

        <div className="flex justify-between text-gray-500">
          <span>IVA (19%)</span>
          <span>{formatCLP(ivaMonto)}</span>
        </div>

        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 text-[#282828]">
          <span>Total</span>
          <span className="text-[#8B9E45]">{formatCLP(total)}</span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2">
        <Label className="text-xs text-gray-500">Descuento global</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            value={descuentoGlobal}
            onChange={(e) => setDescuentoGlobal(parseFloat(e.target.value) || 0, descuentoGlobalTipo)}
            className="flex-1"
            placeholder="0"
          />
          <Select
            value={descuentoGlobalTipo}
            onValueChange={(v) => setDescuentoGlobal(descuentoGlobal, v as 'porcentaje' | 'monto')}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="porcentaje">%</SelectItem>
              <SelectItem value="monto">$</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
