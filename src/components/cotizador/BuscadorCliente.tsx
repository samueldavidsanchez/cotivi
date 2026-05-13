'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, UserCheck, X } from 'lucide-react'

interface Cliente {
  id: string
  nombre: string | null
  empresa: string | null
  rut: string | null
  email: string | null
  telefono: string | null
}

interface Props {
  onSeleccionar: (c: Cliente) => void
  onLimpiar: () => void
  clienteSeleccionado: boolean
}

export default function BuscadorCliente({ onSeleccionar, onLimpiar, clienteSeleccionado }: Props) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Cliente[]>([])
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Búsqueda debounced
  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/clientes?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setOpen(data.length > 0)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function seleccionar(c: Cliente) {
    onSeleccionar(c)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente por nombre, empresa, RUT o email…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:border-[#8B9E45] focus:ring-2 focus:ring-[#8B9E45]/20 outline-none transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 border-2 border-[#8B9E45] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        {clienteSeleccionado && (
          <button
            onClick={onLimpiar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors"
            title="Limpiar cliente"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => seleccionar(c)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
            >
              <div className="bg-[#8B9E45]/10 rounded-full p-1.5 mt-0.5 shrink-0">
                <UserCheck className="h-3.5 w-3.5 text-[#8B9E45]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#282828] truncate">
                  {c.empresa || c.nombre || '—'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {[c.nombre, c.rut, c.email].filter(Boolean).join(' · ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
