/** Elimina todo lo que no sea dígito ni K */
function clean(rut: string) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

/**
 * Formatea un RUT mientras el usuario escribe.
 * Entrada libre → salida: "12.345.678-9"
 */
export function formatRut(raw: string): string {
  const c = clean(raw)
  if (c.length === 0) return ''

  const dv   = c.slice(-1)
  const body = c.slice(0, -1)

  // Insertar puntos cada 3 dígitos desde la derecha
  const bodyFmt = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return body.length > 0 ? `${bodyFmt}-${dv}` : dv
}

/**
 * Valida el dígito verificador de un RUT chileno.
 * Acepta formatos: "12345678-9", "12.345.678-9", "12345678 9"
 */
export function validarRut(rut: string): boolean {
  const c = clean(rut)
  if (c.length < 2 || c.length > 9) return false

  const body = c.slice(0, -1)
  const dv   = c.slice(-1)

  if (!/^\d+$/.test(body)) return false

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }

  const remainder = 11 - (sum % 11)
  if (remainder === 11) return dv === '0'
  if (remainder === 10) return dv === 'K'
  return dv === String(remainder)
}

/** Normaliza a "XXXXXXXX-X" para guardar en BD (sin puntos) */
export function normalizeRut(rut: string): string {
  const c = clean(rut)
  if (c.length < 2) return rut
  return `${c.slice(0, -1)}-${c.slice(-1)}`
}
