'use client'
import { useSession, signOut } from 'next-auth/react'
import { User, LogOut } from 'lucide-react'

export default function UserWidget() {
  const { data: session, status } = useSession()

  if (status === 'loading' || !session) return null

  const nombre = session.user.name ?? session.user.email ?? ''

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/70">
        <div className="bg-[#8B9E45] rounded-full p-1">
          <User className="h-3 w-3 text-white" />
        </div>
        <span className="hidden md:inline">{nombre}</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  )
}
