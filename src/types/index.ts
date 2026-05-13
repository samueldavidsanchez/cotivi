export type Moneda = 'CLP' | 'USD' | 'UF'
export type TipoProducto = 'Producto' | 'Servicio'
export type TipoDescuento = 'porcentaje' | 'monto'
export type EstadoCotizacion = 'borrador' | 'enviada' | 'aceptada' | 'rechazada'

export interface Producto {
  id: string
  codigo: string | null
  nombre: string
  descripcion: string | null
  categoria: string | null
  tipo: TipoProducto
  unidad: string
  precio_venta: number
  costo: number | null
  moneda: Moneda
  activo: boolean
  created_at: string
}

export interface ItemCotizacion {
  id: string
  quote_id: string
  product_id: string | null
  nombre: string
  descripcion: string | null
  categoria: string | null
  cantidad: number
  precio_unitario: number
  costo_unitario: number | null
  descuento: number
  descuento_tipo: TipoDescuento
  descuento_monto: number
  subtotal: number
  orden: number
}

export interface Cotizacion {
  id: string
  numero: string
  correlativo: number
  cliente_nombre: string | null
  cliente_empresa: string | null
  cliente_email: string | null
  cliente_telefono: string | null
  cliente_rut: string | null
  descuento_global: number
  descuento_global_tipo: TipoDescuento
  descuento_global_monto: number
  subtotal_neto: number
  total_descuentos: number
  neto_final: number
  iva_monto: number
  total: number
  moneda_cotizacion: Moneda
  uf_valor: number | null
  dolar_valor: number | null
  estado: EstadoCotizacion
  notas: string | null
  condiciones_pago: string | null
  tiempo_entrega: string | null
  garantia: string | null
  validez_dias: number
  created_at: string
  updated_at: string
  items?: ItemCotizacion[]
}

export interface ItemCotizacionDraft {
  id: string
  product_id: string | null
  nombre: string
  descripcion: string
  categoria: string
  cantidad: number
  precio_unitario: number
  costo_unitario: number
  descuento: number
  descuento_tipo: TipoDescuento
  subtotal: number
  orden: number
}

export interface Indicadores {
  uf: number
  dolar: number
  fecha: string
}

export interface ResumenRentabilidad {
  costo_total: number
  precio_total: number
  profit_bruto: number
  margen_porcentaje: number
  por_item: {
    nombre: string
    costo: number
    precio: number
    profit: number
    margen: number
  }[]
}
