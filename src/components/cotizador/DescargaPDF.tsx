'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Cotizacion } from '@/types'

interface Props {
  quote: Cotizacion & { items?: Cotizacion['items'] }
}

export default function DescargaPDF({ quote }: Props) {
  const [cargando, setCargando] = useState(false)

  async function descargar() {
    setCargando(true)
    try {
      // Importación dinámica para evitar SSR issues con @react-pdf/renderer
      const { pdf } = await import('@react-pdf/renderer')
      const { DocumentoPDF } = await import('./DocumentoPDF')
      const { default: React } = await import('react')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(React.createElement(DocumentoPDF, { quote }) as any).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${quote.numero}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Error al generar el PDF')
    } finally {
      setCargando(false)
    }
  }

  return (
    <Button onClick={descargar} disabled={cargando}>
      <Download className="h-4 w-4" />
      {cargando ? 'Generando...' : 'Descargar PDF'}
    </Button>
  )
}
