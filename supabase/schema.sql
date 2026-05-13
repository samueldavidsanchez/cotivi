-- ============================================================
-- CotiVi - Cotizador Vivancar
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Productos / Catálogo
create table if not exists products (
  id          uuid default gen_random_uuid() primary key,
  codigo      text,
  nombre      text not null,
  descripcion text,
  categoria   text,
  tipo        text check (tipo in ('Producto', 'Servicio')) default 'Producto',
  unidad      text default 'unidad',
  precio_venta numeric(14,2) not null,
  costo       numeric(14,2),
  moneda      text check (moneda in ('CLP', 'USD', 'UF')) default 'CLP',
  activo      boolean default true,
  created_at  timestamptz default now()
);

-- Cotizaciones
create table if not exists quotes (
  id                      uuid default gen_random_uuid() primary key,
  numero                  text unique,
  correlativo             integer unique,
  cliente_nombre          text,
  cliente_empresa         text,
  cliente_email           text,
  cliente_telefono        text,
  cliente_rut             text,
  descuento_global        numeric(5,2) default 0,
  descuento_global_tipo   text check (descuento_global_tipo in ('porcentaje', 'monto')) default 'porcentaje',
  descuento_global_monto  numeric(14,2) default 0,
  subtotal_neto           numeric(14,2) not null default 0,
  total_descuentos        numeric(14,2) default 0,
  neto_final              numeric(14,2) not null default 0,
  iva_monto               numeric(14,2) not null default 0,
  total                   numeric(14,2) not null default 0,
  moneda_cotizacion       text check (moneda_cotizacion in ('CLP', 'USD', 'UF')) default 'CLP',
  uf_valor                numeric(12,4),
  dolar_valor             numeric(12,4),
  estado                  text check (estado in ('borrador', 'enviada', 'aceptada', 'rechazada')) default 'borrador',
  notas                   text,
  validez_dias            integer default 30,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- Ítems de cotización
create table if not exists quote_items (
  id              uuid default gen_random_uuid() primary key,
  quote_id        uuid references quotes(id) on delete cascade,
  product_id      uuid references products(id) on delete set null,
  nombre          text not null,
  descripcion     text,
  categoria       text,
  cantidad        numeric(10,2) default 1,
  precio_unitario numeric(14,2) not null,
  costo_unitario  numeric(14,2),
  descuento       numeric(5,2) default 0,
  descuento_tipo  text check (descuento_tipo in ('porcentaje', 'monto')) default 'porcentaje',
  descuento_monto numeric(14,2) default 0,
  subtotal        numeric(14,2) not null,
  orden           integer default 0,
  created_at      timestamptz default now()
);

-- Secuencia para numeración correlativa
create sequence if not exists quote_correlativo_seq start 1;

-- Trigger: asigna número correlativo automáticamente al insertar
create or replace function set_quote_number()
returns trigger as $$
begin
  new.correlativo = nextval('quote_correlativo_seq');
  new.numero = 'COT-' || lpad(new.correlativo::text, 3, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_quote_number on quotes;
create trigger trg_set_quote_number
  before insert on quotes
  for each row execute function set_quote_number();

-- Trigger: actualiza updated_at en quotes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_quotes_updated_at on quotes;
create trigger trg_quotes_updated_at
  before update on quotes
  for each row execute function update_updated_at();

-- RLS: habilitar (ajustar políticas según auth que uses)
alter table products enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;

-- Política permisiva temporal (sin auth todavía — ajustar luego)
create policy "allow_all_products" on products for all using (true) with check (true);
create policy "allow_all_quotes" on quotes for all using (true) with check (true);
create policy "allow_all_quote_items" on quote_items for all using (true) with check (true);
