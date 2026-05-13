'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import IndicadoresBar from '@/components/IndicadoresBar'
import BuscadorProductos from '@/components/cotizador/BuscadorProductos'
import TablaItems from '@/components/cotizador/TablaItems'
import ResumenTotales from '@/components/cotizador/ResumenTotales'
import PanelRentabilidad from '@/components/cotizador/PanelRentabilidad'
import FormularioCliente from '@/components/cotizador/FormularioCliente'
import { Button } from '@/components/ui/button'
import { useCotizacionStore } from '@/store/cotizacion'
import { calcularTotales } from '@/lib/cotizacion'
import { getIndicadores } from '@/lib/indicadores'
import { Cotizacion, ItemCotizacion } from '@/types'
import { Save, RotateCcw, Eye, X, AlertTriangle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PreviewPDFViewer = dynamic(
  () => import('@/components/cotizador/PreviewPDFViewer'),
  { ssr: false, loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
      <Loader2 className="h-8 w-8 animate-spin text-[#8B9E45]" />
      <span className="text-sm">Generando vista previa…</span>
    </div>
  )}
)

function buildDraftQuote(store: ReturnType<typeof useCotizacionStore.getState>): Cotizacion & { items: ItemCotizacion[] } {
  const { subtotalNeto, descuentoGlobalMonto, netoFinal, ivaMonto, total } =
    calcularTotales(store.items, store.descuentoGlobal, store.descuentoGlobalTipo)

  return {
    id: 'draft',
    numero: 'BORRADOR',
    correlativo: 0,
    cliente_nombre: store.clienteNombre || null,
    cliente_empresa: store.clienteEmpresa || null,
    cliente_email: store.clienteEmail || null,
    cliente_telefono: store.clienteTelefono || null,
    cliente_rut: store.clienteRut || null,
    descuento_global: store.descuentoGlobal,
    descuento_global_tipo: store.descuentoGlobalTipo,
    descuento_global_monto: descuentoGlobalMonto,
    subtotal_neto: subtotalNeto,
    total_descuentos: descuentoGlobalMonto,
    neto_final: netoFinal,
    iva_monto: ivaMonto,
    total,
    moneda_cotizacion: 'CLP',
    uf_valor: null,
    dolar_valor: null,
    estado: 'borrador',
    notas: store.notas || null,
    condiciones_pago: store.condicionesPago || null,
    tiempo_entrega: store.tiempoEntrega || null,
    garantia: store.garantia || null,
    validez_dias: store.validezDias,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: store.items.map((item) => ({
      id: item.id,
      quote_id: 'draft',
      product_id: item.product_id,
      nombre: item.nombre,
      descripcion: item.descripcion || null,
      categoria: item.categoria || null,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      costo_unitario: item.costo_unitario || null,
      descuento: item.descuento,
      descuento_tipo: item.descuento_tipo,
      descuento_monto: item.precio_unitario * item.cantidad - item.subtotal,
      subtotal: item.subtotal,
      orden: item.orden,
    })),
  }
}

export default function CotizadorPage() {
  const [guardando, setGuardando] = useState(false)
  const [tab, setTab] = useState<'items' | 'cliente'>('items')
  const [previewAbierto, setPreviewAbierto] = useState(false)
  const [confirmarVisible, setConfirmarVisible] = useState(false)
  const store = useCotizacionStore()
  const router = useRouter()

  useEffect(() => {
    useCotizacionStore.persist.rehydrate()
  }, [])

  async function guardar() {
    if (store.items.length === 0) return
    setGuardando(true)
    setConfirmarVisible(false)
    try {
      const indicadores = await getIndicadores().catch(() => ({ uf: null, dolar: null, fecha: '' }))
      const { subtotalNeto, descuentoGlobalMonto, netoFinal, ivaMonto, total } = calcularTotales(
        store.items,
        store.descuentoGlobal,
        store.descuentoGlobalTipo
      )

      const res = await fetch('/api/cotizaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteData: {
            cliente_nombre: store.clienteNombre || null,
            cliente_empresa: store.clienteEmpresa || null,
            cliente_email: store.clienteEmail || null,
            cliente_telefono: store.clienteTelefono || null,
            cliente_rut: store.clienteRut || null,
            descuento_global: store.descuentoGlobal,
            descuento_global_tipo: store.descuentoGlobalTipo,
            descuento_global_monto: descuentoGlobalMonto,
            subtotal_neto: subtotalNeto,
            total_descuentos: descuentoGlobalMonto,
            neto_final: netoFinal,
            iva_monto: ivaMonto,
            total,
            moneda_cotizacion: 'CLP',
            uf_valor: indicadores.uf,
            dolar_valor: indicadores.dolar,
            notas: store.notas || null,
            condiciones_pago: store.condicionesPago || null,
            tiempo_entrega: store.tiempoEntrega || null,
            garantia: store.garantia || null,
            validez_dias: Number(store.validezDias) || 30,
          },
          itemsData: store.items.map((item, idx) => ({
            product_id: item.product_id,
            nombre: item.nombre,
            descripcion: item.descripcion || null,
            categoria: item.categoria || null,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            costo_unitario: item.costo_unitario || null,
            descuento: item.descuento,
            descuento_tipo: item.descuento_tipo,
            descuento_monto: item.subtotal,
            subtotal: item.subtotal,
            orden: idx,
          })),
        }),
      })

      if (!res.ok) throw new Error('Error al guardar')
      const { id } = await res.json()
      store.resetCotizacion()
      router.push(`/cotizaciones/${id}`)
    } catch (e) {
      console.error(e)
      alert('Error al guardar la cotización')
    } finally {
      setGuardando(false)
    }
  }

  const draftQuote = buildDraftQuote(useCotizacionStore.getState())
  const { total } = calcularTotales(store.items, store.descuentoGlobal, store.descuentoGlobalTipo)
  const clienteLabel = store.clienteEmpresa || store.clienteNombre || 'Sin cliente'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <IndicadoresBar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#282828]">Nueva cotización</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => store.resetCotizacion()}>
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewAbierto(true)}
              disabled={store.items.length === 0}
            >
              <Eye className="h-4 w-4" />
              Vista previa
            </Button>
            <Button
              size="sm"
              onClick={() => setConfirmarVisible(true)}
              disabled={guardando || store.items.length === 0}
            >
              <Save className="h-4 w-4" />
              {guardando ? 'Guardando…' : 'Guardar cotización'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
              {(['items', 'cliente'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                    tab === t ? 'bg-white shadow-sm font-medium text-[#282828]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t === 'items' ? 'Ítems' : 'Cliente'}
                </button>
              ))}
            </div>

            {tab === 'items' ? (
              <>
                <BuscadorProductos />
                <TablaItems />
              </>
            ) : (
              <FormularioCliente />
            )}
          </div>

          <div className="space-y-4">
            <ResumenTotales />
            <PanelRentabilidad />
          </div>
        </div>
      </div>

      {/* ── MODAL VISTA PREVIA PDF ──────────────────────────────────────────── */}
      {previewAbierto && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
          {/* Barra superior */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#282828] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#8B9E45]" />
              <span className="text-sm font-medium">Vista previa — Borrador</span>
              <span className="text-xs text-gray-400">
                {store.items.length} ítem{store.items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => { setPreviewAbierto(false); setConfirmarVisible(true) }}
                disabled={store.items.length === 0}
                className="bg-[#8B9E45] hover:bg-[#7a8c3c] text-white"
              >
                <Save className="h-4 w-4" />
                Guardar cotización
              </Button>
              <button
                onClick={() => setPreviewAbierto(false)}
                className="ml-2 p-1.5 rounded-md hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Visor PDF */}
          <div className="flex-1 min-h-0">
            <PreviewPDFViewer quote={draftQuote} />
          </div>
        </div>
      )}

      {/* ── DIÁLOGO DE CONFIRMACIÓN ─────────────────────────────────────────── */}
      {confirmarVisible && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmarVisible(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="bg-[#8B9E45] px-6 py-4 flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1.5">
                <Save className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Confirmar cotización</p>
                <p className="text-white/75 text-xs">Esta acción no se puede deshacer</p>
              </div>
            </div>

            {/* Resumen */}
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Una vez guardada, la cotización recibirá un número definitivo y no podrá editarse desde esta pantalla.
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Cliente</span>
                  <span className="font-medium text-[#282828]">{clienteLabel}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Ítems</span>
                  <span className="font-medium text-[#282828]">{store.items.length}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-gray-100 pt-2">
                  <span className="text-[#282828]">Total</span>
                  <span className="text-[#8B9E45]">
                    {total.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-6 pb-5 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmarVisible(false)}
                disabled={guardando}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#8B9E45] hover:bg-[#7a8c3c] text-white"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
                  : <><Save className="h-4 w-4" /> Confirmar</>
                }
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
