'use client'
import { PDFViewer } from '@react-pdf/renderer'
import { DocumentoPDF } from './DocumentoPDF'
import { Cotizacion } from '@/types'

interface Props {
  quote: Cotizacion & { items?: Cotizacion['items'] }
}

export default function PreviewPDFViewer({ quote }: Props) {
  return (
    <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
      <DocumentoPDF quote={quote} />
    </PDFViewer>
  )
}
