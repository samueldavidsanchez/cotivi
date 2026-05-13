import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CotiVi — Cotizador Vivancar',
  description: 'Sistema de cotización Vivancar',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#f9fafb] text-[#282828]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
