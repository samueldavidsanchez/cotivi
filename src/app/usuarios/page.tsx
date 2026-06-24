import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { auth } from '@/auth'
import Navbar from '@/components/Navbar'
import UsuariosCliente, { Usuario } from './UsuariosCliente'

export const dynamic = 'force-dynamic'

export default async function UsuariosPage() {
  const session = await auth()
  if (session?.user?.rol !== 'admin') redirect('/cotizador')

  const rows = await db
    .select({
      id: users.id,
      nombre: users.nombre,
      email: users.email,
      rol: users.rol,
      activo: users.activo,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(desc(users.created_at))

  const lista: Usuario[] = rows.map((u) => ({
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    activo: u.activo ?? true,
    created_at: u.created_at?.toISOString() ?? '',
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <UsuariosCliente usuarios={lista} currentUserId={session.user.id} />
      </div>
    </div>
  )
}
