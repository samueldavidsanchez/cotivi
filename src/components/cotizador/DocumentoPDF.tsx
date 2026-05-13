import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { Cotizacion } from '@/types'
import { formatCLP } from '@/lib/cotizacion'

const EMPRESA = {
  nombre: 'Vivancar SpA',
  rut: '76.654.871-7',
  direccion: 'Rosa del Valle 1992, Maipú, Santiago',
  region: 'XIII Región Metropolitana',
  email: 'contacto@vivancar.cl',
}

const GREEN  = '#8B9E45'
const DARK   = '#282828'
const GRAY   = '#6b7280'
const LGRAY  = '#9ca3af'
const BORDER = '#e2e8f0'
const ALTROW = '#f8fafc'
const WHITE  = '#ffffff'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: DARK,
    paddingTop: 32,
    paddingBottom: 56,
    paddingHorizontal: 40,
    backgroundColor: WHITE,
  },

  // ── Encabezado ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerLeft: { flexDirection: 'column' },
  logo: { width: 130, height: 34, marginBottom: 8, objectFit: 'contain' },
  empresaName: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: DARK, marginBottom: 2 },
  empresaLine: { fontSize: 7.5, color: GRAY, marginTop: 1 },
  headerRight: { alignItems: 'flex-end' },
  docLabel: {
    fontSize: 7,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    backgroundColor: GREEN,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    marginBottom: 8,
  },
  quoteNum: { fontFamily: 'Helvetica-Bold', fontSize: 20, color: GREEN, marginBottom: 4 },
  quoteDate: { fontSize: 8, color: GRAY, marginBottom: 2 },
  quoteValidity: { fontSize: 8, color: GRAY },

  // ── Divisores ───────────────────────────────────────────────────────────────
  dividerGreen: { height: 3, backgroundColor: GREEN, borderRadius: 2, marginBottom: 18 },
  dividerThin:  { height: 0.5, backgroundColor: BORDER, marginBottom: 14 },

  // ── Bloque de partes (empresa / cliente) ────────────────────────────────────
  partiesRow: { flexDirection: 'row', marginBottom: 18, gap: 20 },
  partyBox: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: BORDER,
    backgroundColor: ALTROW,
  },
  partyBoxRight: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: WHITE,
  },
  partyTag: {
    fontSize: 6.5,
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  partyTagGreen: {
    fontSize: 6.5,
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  partyName: { fontFamily: 'Helvetica-Bold', fontSize: 10, color: DARK, marginBottom: 3 },
  partyLine: { fontSize: 8, color: GRAY, marginTop: 2 },

  // ── Tabla ───────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: DARK,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tableRowAlt: { backgroundColor: ALTROW },
  thText: { color: WHITE, fontFamily: 'Helvetica-Bold', fontSize: 8 },
  colIdx:   { width: 20, textAlign: 'center' },
  colDesc:  { flex: 1,   paddingRight: 8 },
  colQty:   { width: 40, textAlign: 'center' },
  colPrice: { width: 80, textAlign: 'right' },
  colTotal: { width: 82, textAlign: 'right' },

  // ── Totales ─────────────────────────────────────────────────────────────────
  totalsSection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, marginBottom: 18 },
  totalsBox: {
    width: 240,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  totalsInner: { padding: 12 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalsLabel: { color: GRAY, fontSize: 8.5 },
  totalsValue: { fontSize: 8.5 },
  discountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  netoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 2,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    marginBottom: 5,
  },
  netoText: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  grandTotalBanner: {
    backgroundColor: GREEN,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalText: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: WHITE },
  grandTotalSub: { fontSize: 7.5, color: WHITE, opacity: 0.85, marginTop: 2 },

  // ── Condiciones comerciales ──────────────────────────────────────────────────
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: DARK,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  condGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  condChip: {
    flexDirection: 'column',
    padding: 8,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: BORDER,
    backgroundColor: ALTROW,
    minWidth: 110,
    flex: 1,
  },
  condChipLabel: { fontSize: 7, color: LGRAY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  condChipValue: { fontSize: 8.5, color: DARK, fontFamily: 'Helvetica-Bold' },

  // ── Notas ────────────────────────────────────────────────────────────────────
  notasBlock: { marginBottom: 14 },
  notasText: { fontSize: 8.5, color: GRAY, lineHeight: 1.5 },

  // ── Disclaimers ──────────────────────────────────────────────────────────────
  disclaimersBlock: {
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 10,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 7,
    color: LGRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  disclaimerLine: { fontSize: 6.5, color: LGRAY, lineHeight: 1.7 },

  // ── Pie de página ─────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  footerDot: { width: 4, height: 4, backgroundColor: GREEN, borderRadius: 2 },
  footerText: { fontSize: 7, color: LGRAY },
  footerPage: { fontSize: 7, color: LGRAY },
})

interface Props {
  quote: Cotizacion & { items?: Cotizacion['items'] }
}

export function DocumentoPDF({ quote }: Props) {
  const items     = quote.items ?? []
  const fecha     = new Date(quote.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  const validoHasta = new Date(
    new Date(quote.created_at).getTime() + quote.validez_dias * 86_400_000
  ).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })

  const hasDiscount    = quote.total_descuentos > 0
  const hasCondiciones = quote.condiciones_pago || quote.tiempo_entrega || quote.garantia || quote.validez_dias

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── ENCABEZADO ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image src="/logo.png" style={s.logo} />
            <Text style={s.empresaName}>{EMPRESA.nombre}</Text>
            <Text style={s.empresaLine}>RUT: {EMPRESA.rut}</Text>
            <Text style={s.empresaLine}>{EMPRESA.direccion}</Text>
            <Text style={s.empresaLine}>{EMPRESA.region}</Text>
            <Text style={s.empresaLine}>{EMPRESA.email}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.docLabel}>Cotización</Text>
            <Text style={s.quoteNum}>{quote.numero}</Text>
            <Text style={s.quoteDate}>Fecha de emisión: {fecha}</Text>
            <Text style={s.quoteValidity}>Válida hasta: {validoHasta}</Text>
          </View>
        </View>

        <View style={s.dividerGreen} />

        {/* ── DATOS DEL CLIENTE ──────────────────────────────────────────────── */}
        <View style={s.partiesRow}>
          {/* Emisor */}
          <View style={s.partyBox}>
            <Text style={s.partyTag}>Emitido por</Text>
            <Text style={s.partyName}>{EMPRESA.nombre}</Text>
            <Text style={s.partyLine}>RUT: {EMPRESA.rut}</Text>
            <Text style={s.partyLine}>{EMPRESA.direccion}</Text>
            <Text style={s.partyLine}>{EMPRESA.email}</Text>
          </View>
          {/* Cliente */}
          <View style={s.partyBoxRight}>
            <Text style={s.partyTagGreen}>Cliente</Text>
            {quote.cliente_empresa
              ? <Text style={s.partyName}>{quote.cliente_empresa}</Text>
              : <Text style={s.partyName}>{quote.cliente_nombre ?? 'Sin especificar'}</Text>
            }
            {quote.cliente_empresa && quote.cliente_nombre && (
              <Text style={s.partyLine}>Contacto: {quote.cliente_nombre}</Text>
            )}
            {quote.cliente_rut       && <Text style={s.partyLine}>RUT: {quote.cliente_rut}</Text>}
            {quote.cliente_email     && <Text style={s.partyLine}>Email: {quote.cliente_email}</Text>}
            {quote.cliente_telefono  && <Text style={s.partyLine}>Teléfono: {quote.cliente_telefono}</Text>}
          </View>
        </View>

        {/* ── TABLA DE PRODUCTOS / SERVICIOS ─────────────────────────────────── */}
        {/* Encabezado */}
        <View style={s.tableHeader}>
          <Text style={[s.colIdx,  s.thText]}>#</Text>
          <Text style={[s.colDesc, s.thText]}>Descripción</Text>
          <Text style={[s.colQty,  s.thText]}>Cant.</Text>
          <Text style={[s.colPrice,s.thText]}>P. Unitario (CLP)</Text>
          <Text style={[s.colTotal,s.thText]}>Subtotal (CLP)</Text>
        </View>

        {items.map((item, i) => (
          <View key={item.id ?? i} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]} wrap={false}>
            <Text style={[s.colIdx, { color: LGRAY }]}>{i + 1}</Text>
            <View style={s.colDesc}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{item.nombre}</Text>
              {item.descripcion
                ? <Text style={{ fontSize: 7.5, color: GRAY, marginTop: 1.5 }}>{item.descripcion}</Text>
                : null}
            </View>
            <Text style={[s.colQty, { color: DARK }]}>{item.cantidad}</Text>
            <Text style={s.colPrice}>{formatCLP(item.precio_unitario)}</Text>
            <Text style={[s.colTotal, { fontFamily: 'Helvetica-Bold' }]}>
              {formatCLP(item.subtotal)}
            </Text>
          </View>
        ))}

        {/* ── TOTALES ────────────────────────────────────────────────────────── */}
        <View style={s.totalsSection}>
          <View style={s.totalsBox}>
            <View style={s.totalsInner}>
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Subtotal neto</Text>
                <Text style={s.totalsValue}>{formatCLP(quote.subtotal_neto)}</Text>
              </View>
              {hasDiscount && (
                <View style={s.discountRow}>
                  <Text style={[s.totalsLabel, { color: '#ef4444' }]}>Descuento</Text>
                  <Text style={{ color: '#ef4444', fontSize: 8.5 }}>− {formatCLP(quote.total_descuentos)}</Text>
                </View>
              )}
              <View style={s.netoRow}>
                <Text style={s.netoText}>Neto</Text>
                <Text style={s.netoText}>{formatCLP(quote.neto_final)}</Text>
              </View>
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>IVA (19%)</Text>
                <Text style={s.totalsValue}>{formatCLP(quote.iva_monto)}</Text>
              </View>
            </View>
            <View style={s.grandTotalBanner}>
              <View>
                <Text style={s.grandTotalText}>Total</Text>
                <Text style={s.grandTotalSub}>Valores en CLP</Text>
              </View>
              <Text style={s.grandTotalText}>{formatCLP(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── CONDICIONES COMERCIALES ────────────────────────────────────────── */}
        {hasCondiciones && (
          <View style={{ marginBottom: 16 }} wrap={false}>
            <Text style={s.sectionTitle}>Condiciones comerciales</Text>
            <View style={s.condGrid}>
              {quote.condiciones_pago && (
                <View style={s.condChip}>
                  <Text style={s.condChipLabel}>Forma de pago</Text>
                  <Text style={s.condChipValue}>{quote.condiciones_pago}</Text>
                </View>
              )}
              {quote.tiempo_entrega && (
                <View style={s.condChip}>
                  <Text style={s.condChipLabel}>Tiempo de entrega</Text>
                  <Text style={s.condChipValue}>{quote.tiempo_entrega}</Text>
                </View>
              )}
              {quote.validez_dias && (
                <View style={s.condChip}>
                  <Text style={s.condChipLabel}>Validez</Text>
                  <Text style={s.condChipValue}>{quote.validez_dias} días corridos</Text>
                </View>
              )}
              {quote.garantia && (
                <View style={s.condChip}>
                  <Text style={s.condChipLabel}>Garantía</Text>
                  <Text style={s.condChipValue}>{quote.garantia}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── OBSERVACIONES ──────────────────────────────────────────────────── */}
        {quote.notas && (
          <View style={s.notasBlock} wrap={false}>
            <Text style={s.sectionTitle}>Observaciones</Text>
            <Text style={s.notasText}>{quote.notas}</Text>
          </View>
        )}

        {/* ── DISCLAIMERS LEGALES ────────────────────────────────────────────── */}
        <View style={s.disclaimersBlock} wrap={false}>
          <Text style={s.disclaimerTitle}>Términos y condiciones</Text>
          <Text style={s.disclaimerLine}>
            {'• Los valores indicados no constituyen factura hasta la emisión del documento tributario correspondiente.\n'}
            {'• Los precios están sujetos a variación según disponibilidad de stock y tipo de cambio vigente.\n'}
            {'• La instalación puede requerir evaluación técnica previa en terreno.\n'}
            {'• El servicio puede depender de cobertura de red, condiciones de infraestructura y factores externos ajenos a Vivancar SpA.\n'}
            {'• El cliente es responsable del correcto uso del servicio o producto contratado conforme a las instrucciones entregadas.'}
          </Text>
        </View>

        {/* ── PIE DE PÁGINA ──────────────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            <View style={s.footerDot} />
            <Text style={s.footerText}>
              {EMPRESA.nombre} · RUT {EMPRESA.rut} · {EMPRESA.email}
            </Text>
          </View>
          <Text
            style={s.footerPage}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
