import { ItemCotizacionDraft, TipoDescuento } from '@/types'

const IVA = 0.19

export function calcularSubtotalItem(
  precioUnitario: number,
  cantidad: number,
  descuento: number,
  descuentoTipo: TipoDescuento
): number {
  const bruto = precioUnitario * cantidad
  const descuentoMonto = descuentoTipo === 'porcentaje' ? bruto * (descuento / 100) : descuento
  return Math.max(0, bruto - descuentoMonto)
}

export function calcularTotales(
  items: ItemCotizacionDraft[],
  descuentoGlobal: number,
  descuentoGlobalTipo: TipoDescuento
) {
  const subtotalNeto = items.reduce((sum, i) => sum + i.subtotal, 0)
  const descuentoGlobalMonto =
    descuentoGlobalTipo === 'porcentaje'
      ? subtotalNeto * (descuentoGlobal / 100)
      : descuentoGlobal
  const netoFinal = Math.max(0, subtotalNeto - descuentoGlobalMonto)
  const ivaMonto = netoFinal * IVA
  const total = netoFinal + ivaMonto

  return {
    subtotalNeto,
    descuentoGlobalMonto,
    netoFinal,
    ivaMonto,
    total,
  }
}

export function calcularRentabilidad(items: ItemCotizacionDraft[]) {
  const porItem = items.map((i) => {
    const costoTotal = (i.costo_unitario ?? 0) * i.cantidad
    const precio = i.subtotal
    const profit = precio - costoTotal
    const margen = precio > 0 ? (profit / precio) * 100 : 0
    return { nombre: i.nombre, costo: costoTotal, precio, profit, margen }
  })

  const costoTotal = porItem.reduce((s, i) => s + i.costo, 0)
  const precioTotal = porItem.reduce((s, i) => s + i.precio, 0)
  const profitBruto = precioTotal - costoTotal
  const margenPorcentaje = precioTotal > 0 ? (profitBruto / precioTotal) * 100 : 0

  return { costoTotal, precioTotal, profitBruto, margenPorcentaje, porItem }
}

export function formatCLP(valor: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor)
}

export function formatUF(valor: number): string {
  return `UF ${new Intl.NumberFormat('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(valor)}`
}
