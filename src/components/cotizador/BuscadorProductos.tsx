'use client'
import { useState, useEffect } from 'react'
import { Producto } from '@/types'
import { useCotizacionStore } from '@/store/cotizacion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCLP } from '@/lib/cotizacion'
import { Plus, Search } from 'lucide-react'

export default function BuscadorProductos() {
  const [query, setQuery] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [filtrados, setFiltrados] = useState<Producto[]>([])
  const addItem = useCotizacionStore((s) => s.addItem)

  useEffect(() => {
    fetch('/api/productos')
      .then((r) => r.json())
      .then((data: Producto[]) => {
        setProductos(data)
        setFiltrados(data)
      })
  }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltrados(
      q
        ? productos.filter(
            (p) =>
              p.nombre.toLowerCase().includes(q) ||
              p.categoria?.toLowerCase().includes(q) ||
              p.codigo?.toLowerCase().includes(q)
          )
        : productos
    )
  }, [query, productos])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar producto o servicio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
        {filtrados.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Sin resultados</p>
        )}
        {filtrados.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{p.nombre}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {p.categoria && <Badge variant="secondary">{p.categoria}</Badge>}
                <span className="text-xs text-gray-500">{formatCLP(p.precio_venta)}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => addItem(p)} className="ml-2 shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
