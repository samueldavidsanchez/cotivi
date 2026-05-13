'use client'
import { useState, useRef } from 'react'
import { Producto } from '@/types'
import { parseProductosExcel, generarPlantillaExcel } from '@/lib/excel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCLP } from '@/lib/cotizacion'
import { Upload, Download, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  productos: Producto[]
}

export default function CatalogoCliente({ productos: inicial }: Props) {
  const [query, setQuery] = useState('')
  const [importando, setImportando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtrados = query
    ? inicial.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.categoria?.toLowerCase().includes(query.toLowerCase()) ||
          p.codigo?.toLowerCase().includes(query.toLowerCase())
      )
    : inicial

  async function importarExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportando(true)
    setMensaje('')
    try {
      const rows = await parseProductosExcel(file)
      const res = await fetch('/api/catalogo/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensaje(`✓ ${data.importados} productos importados correctamente`)
      router.refresh()
    } catch (err) {
      console.error(err)
      setMensaje('Error al importar. Verificá que el archivo tenga el formato correcto.')
    } finally {
      setImportando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#282828]">Catálogo de productos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generarPlantillaExcel}>
            <Download className="h-4 w-4" />
            Plantilla Excel
          </Button>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={importando}>
            <Upload className="h-4 w-4" />
            {importando ? 'Importando...' : 'Importar Excel'}
          </Button>
          <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={importarExcel} className="hidden" />
        </div>
      </div>

      {mensaje && (
        <div className={`text-sm px-4 py-2 rounded-lg ${mensaje.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {mensaje}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, categoría o código..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Código</th>
              <th className="text-left px-4 py-3 font-medium">Nombre</th>
              <th className="text-left px-4 py-3 font-medium">Categoría</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-right px-4 py-3 font-medium">P. Venta</th>
              <th className="text-right px-4 py-3 font-medium">Costo</th>
              <th className="text-right px-4 py-3 font-medium">Margen</th>
              <th className="text-center px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  {query ? 'Sin resultados' : 'No hay productos. Importá un Excel para comenzar.'}
                </td>
              </tr>
            ) : (
              filtrados.map((p) => {
                const margen =
                  p.costo && p.precio_venta > 0 ? ((p.precio_venta - p.costo) / p.precio_venta) * 100 : null
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.codigo ?? '—'}</td>
                    <td className="px-4 py-3 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3">
                      {p.categoria ? <Badge variant="secondary">{p.categoria}</Badge> : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.tipo}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCLP(p.precio_venta)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.costo ? formatCLP(p.costo) : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {margen !== null ? (
                        <span className={margen >= 0 ? 'text-green-600' : 'text-red-500'}>
                          {margen.toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={p.activo ? 'default' : 'secondary'}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-right">{filtrados.length} productos</p>
    </div>
  )
}
