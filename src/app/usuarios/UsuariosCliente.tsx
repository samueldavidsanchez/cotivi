'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  UserPlus, Pencil, Trash2, ShieldCheck, User as UserIcon,
  Loader2, X, AlertCircle, CheckCircle2, Eye, EyeOff,
} from 'lucide-react'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
  created_at: string
}

type FormState = {
  nombre: string
  email: string
  password: string
  rol: string
  activo: boolean
}

const EMPTY_FORM: FormState = { nombre: '', email: '', password: '', rol: 'vendedor', activo: true }

export default function UsuariosCliente({
  usuarios,
  currentUserId,
}: {
  usuarios: Usuario[]
  currentUserId: string
}) {
  const [lista, setLista] = useState<Usuario[]>(usuarios)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [creating, setCreating] = useState(false)

  function upsertLocal(u: Usuario) {
    setLista((prev) => {
      const idx = prev.findIndex((x) => x.id === u.id)
      if (idx === -1) return [u, ...prev]
      const copy = [...prev]
      copy[idx] = u
      return copy
    })
  }

  async function handleDelete(u: Usuario) {
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' })
    if (res.ok) {
      setLista((prev) => prev.filter((x) => x.id !== u.id))
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'No se pudo eliminar el usuario.')
    }
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#282828]">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Administra el acceso al sistema y los roles de cada persona.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 border-b border-gray-200">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-3 font-medium text-[#282828]">
                  {u.nombre}
                  {u.id === currentUserId && (
                    <span className="ml-2 text-xs text-gray-400">(tú)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  {u.rol === 'admin' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8B9E45]">
                      <ShieldCheck className="h-3.5 w-3.5" /> Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                      <UserIcon className="h-3.5 w-3.5" /> Vendedor
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {u.activo ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(u)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u)}
                      disabled={u.id === currentUserId}
                      title={u.id === currentUserId ? 'No puedes eliminarte' : 'Eliminar'}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <UsuarioModal
          title="Nuevo usuario"
          initial={EMPTY_FORM}
          requirePassword
          onClose={() => setCreating(false)}
          onSaved={(u) => { upsertLocal(u); setCreating(false) }}
        />
      )}

      {editing && (
        <UsuarioModal
          title={`Editar ${editing.nombre}`}
          usuarioId={editing.id}
          isSelf={editing.id === currentUserId}
          initial={{
            nombre: editing.nombre,
            email: editing.email,
            password: '',
            rol: editing.rol,
            activo: editing.activo,
          }}
          onClose={() => setEditing(null)}
          onSaved={(u) => { upsertLocal(u); setEditing(null) }}
        />
      )}
    </div>
  )
}

function UsuarioModal({
  title,
  initial,
  usuarioId,
  requirePassword = false,
  isSelf = false,
  onClose,
  onSaved,
}: {
  title: string
  initial: FormState
  usuarioId?: string
  requirePassword?: boolean
  isSelf?: boolean
  onClose: () => void
  onSaved: (u: Usuario) => void
}) {
  const [form, setForm] = useState<FormState>(initial)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isEdit = Boolean(usuarioId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const url = isEdit ? `/api/usuarios/${usuarioId}` : '/api/usuarios'
    const method = isEdit ? 'PATCH' : 'POST'

    // En edición solo enviamos contraseña si se escribió una nueva.
    const payload: Record<string, unknown> = {
      nombre: form.nombre,
      email: form.email,
      rol: form.rol,
    }
    if (isEdit) payload.activo = form.activo
    if (form.password) payload.password = form.password

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'No se pudo guardar el usuario.')
      return
    }
    onSaved(data as Usuario)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
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

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#282828]">Nombre</label>
            <Input
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre completo"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#282828]">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nombre@vivancar.cl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#282828]">
              Contraseña {isEdit && <span className="text-gray-400 font-normal">(dejar en blanco para no cambiar)</span>}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required={requirePassword}
                minLength={6}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#282828]">Rol</label>
            <select
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
              disabled={isSelf}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B9E45] disabled:opacity-50"
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Administrador</option>
            </select>
            {isSelf && <p className="text-xs text-gray-400">No puedes cambiar tu propio rol.</p>}
          </div>

          {isEdit && (
            <label className={`flex items-center gap-2 text-sm ${isSelf ? 'opacity-50' : ''}`}>
              <input
                type="checkbox"
                checked={form.activo}
                disabled={isSelf}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[#8B9E45] focus:ring-[#8B9E45]"
              />
              Cuenta activa (puede iniciar sesión)
            </label>
          )}

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
