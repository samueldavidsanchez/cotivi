import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

const statements = [
  `create sequence if not exists quote_correlativo_seq start 1633`,

  `create or replace function set_quote_number()
   returns trigger as $$
   begin
     new.correlativo = nextval('quote_correlativo_seq');
     new.numero = 'COT-' || lpad(new.correlativo::text, 5, '0');
     return new;
   end;
   $$ language plpgsql`,

  `drop trigger if exists trg_set_quote_number on quotes`,

  `create trigger trg_set_quote_number
     before insert on quotes
     for each row execute function set_quote_number()`,

  `create or replace function update_updated_at()
   returns trigger as $$
   begin
     new.updated_at = now();
     return new;
   end;
   $$ language plpgsql`,

  `drop trigger if exists trg_quotes_updated_at on quotes`,

  `create trigger trg_quotes_updated_at
     before update on quotes
     for each row execute function update_updated_at()`,
]

for (const stmt of statements) {
  await sql.query(stmt)
  console.log('✓', stmt.trim().split('\n')[0].substring(0, 60))
}

console.log('\n✅ Setup completo — triggers y secuencia creados en Neon')
