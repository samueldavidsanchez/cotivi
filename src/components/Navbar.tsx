import Image from 'next/image'
import Link from 'next/link'
import { FileText, Package, PlusCircle, Users } from 'lucide-react'
import UserWidget from './UserWidget'
import { auth } from '@/auth'

export default async function Navbar() {
  const session = await auth()
  const isAdmin = session?.user?.rol === 'admin'

  return (
    <header className="bg-[#282828] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-blanco.png"
            alt="Vivancar"
            width={120}
            height={30}
            className="h-7 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/cotizador"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Nueva cotización
          </Link>
          <Link
            href="/cotizaciones"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Cotizaciones
          </Link>
          <Link
            href="/catalogo"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors"
          >
            <Package className="h-4 w-4" />
            Catálogo
          </Link>
          {isAdmin && (
            <Link
              href="/usuarios"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/10 transition-colors"
            >
              <Users className="h-4 w-4" />
              Usuarios
            </Link>
          )}

          <div className="w-px h-5 bg-white/20 mx-1" />

          <UserWidget />
        </nav>
      </div>
    </header>
  )
}
