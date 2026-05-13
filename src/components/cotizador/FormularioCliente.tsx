'use client'
import { useState } from 'react'
import { useCotizacionStore } from '@/store/cotizacion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BuscadorCliente from './BuscadorCliente'
import { formatRut, validarRut } from '@/lib/rut'
import { CheckCircle2, XCircle, Save, Loader2 } from 'lucide-react'

const textarea =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9E45] resize-none'

interface ClienteApi {
  id: string
  nombre: string | null
  empresa: string | null
  rut: string | null
  email: string | null
  telefono: string | null
}

export default function FormularioCliente() {
  const {
    clienteNombre, clienteEmpresa, clienteEmail, clienteTelefono, clienteRut,
    notas, condicionesPago, tiempoEntrega, garantia, validezDias,
    setCliente,
  } = useCotizacionStore()

  const [clienteSeleccionado, setClienteSeleccionado] = useState(false)
  const [guardandoCliente, setGuardandoCliente]       = useState(false)
  const [mensajeGuardado, setMensajeGuardado]         = useState('')

  const field = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCliente(key, e.target.value)

  // ── RUT ─────────────────────────────────────────────────────────────────────
  const rutTocado = clienteRut.length > 0
  const rutValido = rutTocado && validarRut(clienteRut)
  const rutInvalido = rutTocado && !rutValido

  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatRut(e.target.value)
    setCliente('clienteRut', formatted)
  }

  // ── Buscar y seleccionar cliente ────────────────────────────────────────────
  function seleccionarCliente(c: ClienteApi) {
    setCliente('clienteNombre',   c.nombre   ?? '')
    setCliente('clienteEmpresa',  c.empresa  ?? '')
    setCliente('clienteRut',      c.rut      ?? '')
    setCliente('clienteEmail',    c.email    ?? '')
    setCliente('clienteTelefono', c.telefono ?? '')
    setClienteSeleccionado(true)
  }

  function limpiarCliente() {
    setCliente('clienteNombre',   '')
    setCliente('clienteEmpresa',  '')
    setCliente('clienteRut',      '')
    setCliente('clienteEmail',    '')
    setCliente('clienteTelefono', '')
    setClienteSeleccionado(false)
    setMensajeGuardado('')
  }

  // ── Guardar cliente ─────────────────────────────────────────────────────────
  async function guardarCliente() {
    if (!clienteNombre && !clienteEmpresa) return
    setGuardandoCliente(true)
    setMensajeGuardado('')
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre:   clienteNombre  || null,
          empresa:  clienteEmpresa || null,
          rut:      clienteRut     || null,
          email:    clienteEmail   || null,
          telefono: clienteTelefono || null,
        }),
      })
      if (!res.ok) throw new Error()
      setMensajeGuardado('Cliente guardado ✓')
      setClienteSeleccionado(true)
      setTimeout(() => setMensajeGuardado(''), 3000)
    } catch {
      setMensajeGuardado('Error al guardar')
    } finally {
      setGuardandoCliente(false)
    }
  }

  const puedeGuardar = !!(clienteNombre || clienteEmpresa)

  return (
    <div className="space-y-4">
      {/* ── Datos del cliente ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#282828]">Datos del cliente</h3>
          {mensajeGuardado && (
            <span className="text-xs text-[#8B9E45] font-medium">{mensajeGuardado}</span>
          )}
        </div>

        {/* Buscador */}
        <BuscadorCliente
          onSeleccionar={seleccionarCliente}
          onLimpiar={limpiarCliente}
          clienteSeleccionado={clienteSeleccionado}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input
              value={clienteNombre}
              onChange={field('clienteNombre')}
              placeholder="Nombre del contacto"
            />
          </div>
          <div className="space-y-1">
            <Label>Empresa</Label>
            <Input
              value={clienteEmpresa}
              onChange={field('clienteEmpresa')}
              placeholder="Razón social"
            />
          </div>

          {/* RUT con validación */}
          <div className="space-y-1">
            <Label>RUT</Label>
            <div className="relative">
              <Input
                value={clienteRut}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
                maxLength={12}
                className={
                  rutInvalido
                    ? 'border-red-300 focus-visible:ring-red-300 pr-9'
                    : rutValido
                    ? 'border-[#8B9E45] focus-visible:ring-[#8B9E45]/40 pr-9'
                    : 'pr-9'
                }
              />
              {rutTocado && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {rutValido
                    ? <CheckCircle2 className="h-4 w-4 text-[#8B9E45]" />
                    : <XCircle className="h-4 w-4 text-red-400" />
                  }
                </div>
              )}
            </div>
            {rutInvalido && (
              <p className="text-xs text-red-500">RUT inválido — verifica el dígito verificador</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={clienteEmail}
              onChange={field('clienteEmail')}
              placeholder="correo@empresa.cl"
            />
          </div>
          <div className="space-y-1">
            <Label>Teléfono</Label>
            <Input
              value={clienteTelefono}
              onChange={field('clienteTelefono')}
              placeholder="+56 9 xxxx xxxx"
            />
          </div>
          <div className="space-y-1">
            <Label>Validez (días)</Label>
            <Input
              type="number"
              value={validezDias}
              onChange={(e) => setCliente('validezDias', e.target.value)}
              min={1}
            />
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Notas</Label>
            <textarea
              value={notas}
              onChange={field('notas')}
              rows={2}
              placeholder="Observaciones adicionales..."
              className={textarea}
            />
          </div>
        </div>

        {/* Guardar cliente */}
        <div className="flex justify-end pt-1">
          <button
            onClick={guardarCliente}
            disabled={!puedeGuardar || guardandoCliente}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#8B9E45] hover:bg-[#7a8c3c] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {guardandoCliente
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando…</>
              : <><Save className="h-3.5 w-3.5" /> Guardar cliente</>
            }
          </button>
        </div>
      </div>

      {/* ── Condiciones comerciales ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-[#282828]">Condiciones comerciales</h3>
        <p className="text-xs text-gray-400">Opcional — lo que completes aparecerá en la cotización PDF.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <Label>Forma de pago</Label>
            <textarea
              value={condicionesPago}
              onChange={field('condicionesPago')}
              rows={2}
              placeholder="Ej: Transferencia bancaria, 50% anticipo y 50% contra entrega"
              className={textarea}
            />
          </div>
          <div className="space-y-1">
            <Label>Tiempo de entrega</Label>
            <Input
              value={tiempoEntrega}
              onChange={field('tiempoEntrega')}
              placeholder="Ej: 5 a 10 días hábiles"
            />
          </div>
          <div className="space-y-1">
            <Label>Garantía</Label>
            <Input
              value={garantia}
              onChange={field('garantia')}
              placeholder="Ej: 12 meses por defectos de fabricación"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
