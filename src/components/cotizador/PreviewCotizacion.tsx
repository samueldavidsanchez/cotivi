import { Cotizacion } from '@/types'
import { formatCLP } from '@/lib/cotizacion'
import Image from 'next/image'

interface Props {
  quote: Cotizacion & { items?: Cotizacion['items'] }
}

export default function PreviewCotizacion({ quote }: Props) {
  const items = quote.items ?? []
  const fecha = new Date(quote.created_at).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const validoHasta = new Date(new Date(quote.created_at).getTime() + quote.validez_dias * 86400000)
    .toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div id="preview-cotizacion" className="bg-white rounded-xl border border-gray-200 p-10 space-y-8 print:border-none print:shadow-none">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Image src="/logo.png" alt="Vivancar" width={152} height={40} className="h-10 w-auto" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#8B9E45]">{quote.numero}</p>
          <p className="text-sm text-gray-500 mt-1">Fecha: {fecha}</p>
          <p className="text-sm text-gray-500">Válido hasta: {validoHasta}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-1 bg-[#8B9E45] rounded-full" />

      {/* Datos cliente */}
      {(quote.cliente_nombre || quote.cliente_empresa) && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Para</p>
            {quote.cliente_empresa && <p className="font-semibold text-[#282828]">{quote.cliente_empresa}</p>}
            {quote.cliente_nombre && <p className="text-gray-600">{quote.cliente_nombre}</p>}
            {quote.cliente_rut && <p className="text-gray-500 text-sm">RUT: {quote.cliente_rut}</p>}
            {quote.cliente_email && <p className="text-gray-500 text-sm">{quote.cliente_email}</p>}
            {quote.cliente_telefono && <p className="text-gray-500 text-sm">{quote.cliente_telefono}</p>}
          </div>
          {(quote.uf_valor || quote.dolar_valor) && (
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Indicadores al día</p>
              {quote.uf_valor && <p className="text-sm text-gray-500">UF {formatCLP(quote.uf_valor)}</p>}
              {quote.dolar_valor && <p className="text-sm text-gray-500">USD {formatCLP(quote.dolar_valor)}</p>}
            </div>
          )}
        </div>
      )}

      {/* Tabla ítems */}
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#282828] text-white">
            <th className="text-left px-4 py-3 rounded-tl-lg font-medium">Descripción</th>
            <th className="text-center px-4 py-3 font-medium w-20">Cant.</th>
            <th className="text-right px-4 py-3 font-medium w-32">P. Unitario</th>
            <th className="text-right px-4 py-3 font-medium w-24">Dcto.</th>
            <th className="text-right px-4 py-3 rounded-tr-lg font-medium w-32">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={item.id ?? i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <td className="px-4 py-3">
                <p className="font-medium">{item.nombre}</p>
                {item.descripcion && <p className="text-xs text-gray-400">{item.descripcion}</p>}
              </td>
              <td className="px-4 py-3 text-center">{item.cantidad}</td>
              <td className="px-4 py-3 text-right">{formatCLP(item.precio_unitario)}</td>
              <td className="px-4 py-3 text-right text-gray-500">
                {item.descuento > 0
                  ? item.descuento_tipo === 'porcentaje'
                    ? `${item.descuento}%`
                    : formatCLP(item.descuento)
                  : '—'}
              </td>
              <td className="px-4 py-3 text-right font-semibold">{formatCLP(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal neto</span>
            <span>{formatCLP(quote.subtotal_neto)}</span>
          </div>
          {quote.total_descuentos > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Descuento</span>
              <span>- {formatCLP(quote.total_descuentos)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t border-gray-200 pt-2">
            <span>Neto</span>
            <span>{formatCLP(quote.neto_final)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>IVA (19%)</span>
            <span>{formatCLP(quote.iva_monto)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-[#8B9E45] pt-2">
            <span>Total</span>
            <span className="text-[#8B9E45]">{formatCLP(quote.total)}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      {quote.notas && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Observaciones</p>
          <p className="text-sm text-gray-600">{quote.notas}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
        Esta cotización es válida por {quote.validez_dias} días desde su emisión.
      </div>
    </div>
  )
}
