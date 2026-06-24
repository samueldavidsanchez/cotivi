'use client'
import { useState, useRef } from 'react'
import { Producto } from '@/types'
import { parseProductosExcel, generarPlantillaExcel } from '@/lib/excel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCLP } from '@/lib/cotizacion'
import {
  Upload, Download, Search, Plus, Pencil, Trash2, X,
  Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  productos: Producto[]
  isAdmin: boolean
}

export default function CatalogoCliente({ productos: inicial, isAdmin }: Props) {
  const [lista, setLista] = useState<Producto[]>(inicial)
  const [query, setQuery] = useState('')
  const [importando, setImportando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editing, setEditing] = useState<Producto | null>(null)
  const [creating, setCreating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtrados = query
    ? lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.categoria?.toLowerCase().includes(query.toLowerCase()) ||
          p.codigo?.toLowerCase().includes(query.toLowerCase())
      )
    : lista

  function upsertLocal(p: Producto) {
    setLista((prev) => {
      const idx = prev.findIndex((x) => x.id === p.id)
      if (idx === -1) return [p, ...prev]
      const copy = [...prev]
      copy[idx] = p
      return copy
    })
  }

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

  async function toggleActivo(p: Producto) {
    const res = await fetch(`/api/productos/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !p.activo }),
    })
    if (res.ok) {
      upsertLocal(await res.json())
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'No se pudo actualizar el estado.')
    }
  }

  async function handleDelete(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}" del catálogo? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/productos/${p.id}`, { method: 'DELETE' })
    if (res.ok) {
      setLista((prev) => prev.filter((x) => x.id !== p.id))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'No se pudo eliminar el producto.')
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
          {isAdmin && (
            <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          )}
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
              {isAdmin && <th className="text-right px-4 py-3 font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 9 : 8} className="text-center py-12 text-gray-400">
                  {query ? 'Sin resultados' : 'No hay productos. Importá un Excel para comenzar.'}
                </td>
              </tr>
            ) : (
              filtrados.map((p) => {
                const margen =
                  p.costo && p.precio_venta > 0 ? ((p.precio_venta - p.costo) / p.precio_venta) * 100 : null
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 ${!p.activo ? 'opacity-60' : ''}`}>
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
                      {isAdmin ? (
                        <button
                          onClick={() => toggleActivo(p)}
                          title={p.activo ? 'Clic para desactivar' : 'Clic para activar'}
                          className="cursor-pointer"
                        >
                          <Badge variant={p.activo ? 'default' : 'secondary'}>
                            {p.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant={p.activo ? 'default' : 'secondary'}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditing(p)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p)} title="Eliminar">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-right">{filtrados.length} productos</p>

      {creating && (
        <ProductoModal
          title="Nuevo producto"
          onClose={() => setCreating(false)}
          onSaved={(p) => { upsertLocal(p); setCreating(false) }}
        />
      )}

      {editing && (
        <ProductoModal
          title={`Editar producto`}
          producto={editing}
          onClose={() => setEditing(null)}
          onSaved={(p) => { upsertLocal(p); setEditing(null) }}
        />
      )}
    </div>
  )
}

type FormState = {
  codigo: string
  nombre: string
  descripcion: string
  categoria: string
  tipo: string
  unidad: string
  precio_venta: string
  costo: string
  moneda: string
  activo: boolean
}

function ProductoModal({
  title,
  producto,
  onClose,
  onSaved,
}: {
  title: string
  producto?: Producto
  onClose: () => void
  onSaved: (p: Producto) => void
}) {
  const isEdit = Boolean(producto)
  const [form, setForm] = useState<FormState>({
    codigo: producto?.codigo ?? '',
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    categoria: producto?.categoria ?? '',
    tipo: producto?.tipo ?? 'Producto',
    unidad: producto?.unidad ?? 'unidad',
    precio_venta: producto ? String(producto.precio_venta) : '',
    costo: producto?.costo != null ? String(producto.costo) : '',
    moneda: producto?.moneda ?? 'CLP',
    activo: producto?.activo ?? true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url = isEdit ? `/api/productos/${producto!.id}` : '/api/productos'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'No se pudo guardar el producto.')
      return
    }
    onSaved(data as Producto)
  }

  const field = (k: keyof FormState) => ({
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  })

  const selectCls =
    'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9E45]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-[#282828]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Código</label>
              <Input placeholder="SRV-001" {...field('codigo')} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Categoría</label>
              <Input placeholder="Servicios" {...field('categoria')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#282828]">Nombre *</label>
            <Input placeholder="Nombre del producto" required {...field('nombre')} />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#282828]">Descripción</label>
            <textarea
              rows={2}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9E45]"
              {...field('descripcion')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Tipo</label>
              <select className={selectCls} {...field('tipo')}>
                <option value="Producto">Producto</option>
                <option value="Servicio">Servicio</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Unidad</label>
              <Input placeholder="unidad" {...field('unidad')} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Precio venta *</label>
              <Input type="number" min="0" step="0.01" required {...field('precio_venta')} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Costo</label>
              <Input type="number" min="0" step="0.01" {...field('costo')} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#282828]">Moneda</label>
              <select className={selectCls} {...field('moneda')}>
                <option value="CLP">CLP</option>
                <option value="USD">USD</option>
                <option value="UF">UF</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm pt-1">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#8B9E45] focus:ring-[#8B9E45]"
            />
            Producto activo (disponible para cotizar)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
                : <><CheckCircle2 className="h-4 w-4" /> Guardar</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
