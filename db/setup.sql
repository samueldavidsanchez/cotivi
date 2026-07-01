-- ============================================================
-- CotiVi — Neon setup (ejecutar UNA vez en el SQL Editor de Neon)
-- Las tablas las crea Drizzle con: npm run db:push
-- Este archivo solo agrega la secuencia y el trigger de numeración
-- ============================================================

-- Secuencia para numeración correlativa de cotizaciones (arranca en 01633)
create sequence if not exists quote_correlativo_seq start 1633;

-- Trigger: asigna número correlativo al insertar una cotización
create or replace function set_quote_number()
returns trigger as $$
begin
  new.correlativo = nextval('quote_correlativo_seq');
  new.numero = 'COT-' || lpad(new.correlativo::text, 5, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_quote_number on quotes;
create trigger trg_set_quote_number
  before insert on quotes
  for each row execute function set_quote_number();

-- Trigger: actualiza updated_at automáticamente
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
