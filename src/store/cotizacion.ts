import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ItemCotizacionDraft, TipoDescuento, Producto } from '@/types'
import { calcularSubtotalItem, calcularTotales } from '@/lib/cotizacion'
import { v4 as uuid } from 'uuid'

interface CotizacionState {
  // Datos del cliente
  clienteNombre: string
  clienteEmpresa: string
  clienteEmail: string
  clienteTelefono: string
  clienteRut: string
  notas: string
  condicionesPago: string
  tiempoEntrega: string
  garantia: string
  validezDias: number

  // Ítems
  items: ItemCotizacionDraft[]

  // Descuento global
  descuentoGlobal: number
  descuentoGlobalTipo: TipoDescuento

  // Acciones
  setCliente: (field: string, value: string) => void
  addItem: (producto: Producto) => void
  removeItem: (id: string) => void
  updateItem: (id: string, changes: Partial<ItemCotizacionDraft>) => void
  reorderItems: (from: number, to: number) => void
  setDescuentoGlobal: (valor: number, tipo: TipoDescuento) => void
  resetCotizacion: () => void
  totales: () => ReturnType<typeof calcularTotales>
}

const defaultState = {
  clienteNombre: '',
  clienteEmpresa: '',
  clienteEmail: '',
  clienteTelefono: '',
  clienteRut: '',
  notas: '',
  condicionesPago: '',
  tiempoEntrega: '',
  garantia: '',
  validezDias: 30,
  items: [] as ItemCotizacionDraft[],
  descuentoGlobal: 0,
  descuentoGlobalTipo: 'porcentaje' as TipoDescuento,
}

export const useCotizacionStore = create<CotizacionState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setCliente: (field, value) => set({ [field]: value } as Partial<CotizacionState>),

      addItem: (producto) => {
        const item: ItemCotizacionDraft = {
          id: uuid(),
          product_id: producto.id,
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? '',
          categoria: producto.categoria ?? '',
          cantidad: 1,
          precio_unitario: producto.precio_venta,
          costo_unitario: producto.costo ?? 0,
          descuento: 0,
          descuento_tipo: 'porcentaje',
          subtotal: producto.precio_venta,
          orden: get().items.length,
        }
        set((s) => ({ items: [...s.items, item] }))
      },

      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      updateItem: (id, changes) =>
        set((s) => ({
          items: s.items.map((item) => {
            if (item.id !== id) return item
            const updated = { ...item, ...changes }
            updated.subtotal = calcularSubtotalItem(
              updated.precio_unitario,
              updated.cantidad,
              updated.descuento,
              updated.descuento_tipo
            )
            return updated
          }),
        })),

      reorderItems: (from, to) =>
        set((s) => {
          const items = [...s.items]
          const [moved] = items.splice(from, 1)
          items.splice(to, 0, moved)
          return { items: items.map((item, i) => ({ ...item, orden: i })) }
        }),

      setDescuentoGlobal: (valor, tipo) =>
        set({ descuentoGlobal: valor, descuentoGlobalTipo: tipo }),

      resetCotizacion: () => set(defaultState),

      totales: () => {
        const { items, descuentoGlobal, descuentoGlobalTipo } = get()
        return calcularTotales(items, descuentoGlobal, descuentoGlobalTipo)
      },
    }),
    { name: 'cotizacion-draft', skipHydration: true }
  )
)
