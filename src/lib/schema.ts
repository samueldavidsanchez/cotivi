import { pgTable, uuid, text, numeric, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id:            uuid('id').defaultRandom().primaryKey(),
  nombre:        text('nombre').notNull(),
  email:         text('email').unique().notNull(),
  password_hash: text('password_hash').notNull(),
  activo:        boolean('activo').default(true),
  created_at:    timestamp('created_at').defaultNow(),
})

export const clients = pgTable('clients', {
  id:         uuid('id').defaultRandom().primaryKey(),
  nombre:     text('nombre'),
  empresa:    text('empresa'),
  rut:        text('rut').unique(),
  email:      text('email'),
  telefono:   text('telefono'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  codigo: text('codigo').unique(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  categoria: text('categoria'),
  tipo: text('tipo').default('Producto'),
  unidad: text('unidad').default('unidad'),
  precio_venta: numeric('precio_venta', { precision: 14, scale: 2 }).notNull(),
  costo: numeric('costo', { precision: 14, scale: 2 }),
  moneda: text('moneda').default('CLP'),
  activo: boolean('activo').default(true),
  created_at: timestamp('created_at').defaultNow(),
})

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  numero: text('numero').unique(),
  correlativo: integer('correlativo').unique(),
  cliente_nombre: text('cliente_nombre'),
  cliente_empresa: text('cliente_empresa'),
  cliente_email: text('cliente_email'),
  cliente_telefono: text('cliente_telefono'),
  cliente_rut: text('cliente_rut'),
  descuento_global: numeric('descuento_global', { precision: 5, scale: 2 }).default('0'),
  descuento_global_tipo: text('descuento_global_tipo').default('porcentaje'),
  descuento_global_monto: numeric('descuento_global_monto', { precision: 14, scale: 2 }).default('0'),
  subtotal_neto: numeric('subtotal_neto', { precision: 14, scale: 2 }).notNull().default('0'),
  total_descuentos: numeric('total_descuentos', { precision: 14, scale: 2 }).default('0'),
  neto_final: numeric('neto_final', { precision: 14, scale: 2 }).notNull().default('0'),
  iva_monto: numeric('iva_monto', { precision: 14, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 14, scale: 2 }).notNull().default('0'),
  moneda_cotizacion: text('moneda_cotizacion').default('CLP'),
  uf_valor: numeric('uf_valor', { precision: 12, scale: 4 }),
  dolar_valor: numeric('dolar_valor', { precision: 12, scale: 4 }),
  estado: text('estado').default('borrador'),
  notas: text('notas'),
  condiciones_pago: text('condiciones_pago'),
  tiempo_entrega: text('tiempo_entrega'),
  garantia: text('garantia'),
  validez_dias: integer('validez_dias').default(30),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const quoteItems = pgTable('quote_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  quote_id: uuid('quote_id').references(() => quotes.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  categoria: text('categoria'),
  cantidad: numeric('cantidad', { precision: 10, scale: 2 }).default('1'),
  precio_unitario: numeric('precio_unitario', { precision: 14, scale: 2 }).notNull(),
  costo_unitario: numeric('costo_unitario', { precision: 14, scale: 2 }),
  descuento: numeric('descuento', { precision: 5, scale: 2 }).default('0'),
  descuento_tipo: text('descuento_tipo').default('porcentaje'),
  descuento_monto: numeric('descuento_monto', { precision: 14, scale: 2 }).default('0'),
  subtotal: numeric('subtotal', { precision: 14, scale: 2 }).notNull(),
  orden: integer('orden').default(0),
  created_at: timestamp('created_at').defaultNow(),
})

export const quotesRelations = relations(quotes, ({ many }) => ({
  items: many(quoteItems),
}))

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, { fields: [quoteItems.quote_id], references: [quotes.id] }),
  product: one(products, { fields: [quoteItems.product_id], references: [products.id] }),
}))

export const productsRelations = relations(products, ({ many }) => ({
  quoteItems: many(quoteItems),
}))
