'use client'
import { useCotizacionStore } from '@/store/cotizacion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCLP } from '@/lib/cotizacion'
import { Trash2 } from 'lucide-react'

export default function TablaItems() {
  const { items, updateItem, removeItem } = useCotizacionStore()

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        <p className="text-sm">Agregá productos desde el buscador</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Producto</th>
            <th className="text-center px-3 py-3 font-medium w-24">Cant.</th>
            <th className="text-right px-3 py-3 font-medium w-36">P. Unitario</th>
            <th className="text-center px-3 py-3 font-medium w-28">Dcto.</th>
            <th className="text-center px-3 py-3 font-medium w-16">Tipo</th>
            <th className="text-right px-4 py-3 font-medium w-36">Subtotal</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50">
              <td className="px-4 py-3">
                <p className="font-medium">{item.nombre}</p>
                {item.descripcion && <p className="text-xs text-gray-400 truncate max-w-xs">{item.descripcion}</p>}
              </td>
              <td className="px-3 py-3">
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={item.cantidad}
                  onChange={(e) => updateItem(item.id, { cantidad: parseFloat(e.target.value) || 1 })}
                  className="text-center w-20 mx-auto"
                />
              </td>
              <td className="px-3 py-3">
                <Input
                  type="number"
                  min={0}
                  value={item.precio_unitario}
                  onChange={(e) => updateItem(item.id, { precio_unitario: parseFloat(e.target.value) || 0 })}
                  className="text-right w-32"
                />
              </td>
              <td className="px-3 py-3">
                <Input
                  type="number"
                  min={0}
                  max={item.descuento_tipo === 'porcentaje' ? 100 : undefined}
                  value={item.descuento}
                  onChange={(e) => updateItem(item.id, { descuento: parseFloat(e.target.value) || 0 })}
                  className="text-center w-24 mx-auto"
                />
              </td>
              <td className="px-3 py-3">
                <Select
                  value={item.descuento_tipo}
                  onValueChange={(v) => updateItem(item.id, { descuento_tipo: v as 'porcentaje' | 'monto' })}
                >
                  <SelectTrigger className="w-16 text-xs px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porcentaje">%</SelectItem>
                    <SelectItem value="monto">$</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3 text-right font-semibold">{formatCLP(item.subtotal)}</td>
              <td className="px-2 py-3">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
