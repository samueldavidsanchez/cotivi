import * as XLSX from 'xlsx'
import { Producto } from '@/types'

interface ExcelRow {
  codigo?: string
  nombre?: string
  descripcion?: string
  categoria?: string
  tipo?: string
  unidad?: string
  precio_venta?: number | string
  costo?: number | string
  moneda?: string
  activo?: string
}

export function parseProductosExcel(file: File): Promise<Omit<Producto, 'id' | 'created_at'>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets['Productos'] ?? workbook.Sheets[workbook.SheetNames[0]]
        const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet)

        const productos = rows
          .filter((r) => r.nombre && String(r.activo ?? 'SI').toUpperCase() !== 'NO')
          .map((r) => ({
            codigo: r.codigo ? String(r.codigo) : null,
            nombre: String(r.nombre!),
            descripcion: r.descripcion ? String(r.descripcion) : null,
            categoria: r.categoria ? String(r.categoria) : null,
            tipo: (r.tipo === 'Servicio' ? 'Servicio' : 'Producto') as 'Producto' | 'Servicio',
            unidad: r.unidad ? String(r.unidad) : 'unidad',
            precio_venta: Number(r.precio_venta ?? 0),
            costo: r.costo != null ? Number(r.costo) : null,
            moneda: (['CLP', 'USD', 'UF'].includes(String(r.moneda ?? 'CLP').toUpperCase())
              ? String(r.moneda).toUpperCase()
              : 'CLP') as 'CLP' | 'USD' | 'UF',
            activo: String(r.activo ?? 'SI').toUpperCase() !== 'NO',
          }))

        resolve(productos)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

export function generarPlantillaExcel() {
  const headers = [
    'codigo', 'nombre', 'descripcion', 'categoria', 'tipo',
    'unidad', 'precio_venta', 'costo', 'moneda', 'activo',
  ]
  const ejemplo = [
    'SRV-001', 'Inspección técnica', 'Revisión completa del vehículo', 'Servicios',
    'Servicio', 'unidad', 50000, 30000, 'CLP', 'SI',
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ejemplo])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Productos')
  XLSX.writeFile(wb, 'plantilla_productos_vivancar.xlsx')
}
