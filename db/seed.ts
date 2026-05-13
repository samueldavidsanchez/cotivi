import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/lib/schema'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL!)
const db  = drizzle(sql, { schema })

const USUARIOS = [
  { nombre: 'David Vivanco',  email: 'dvivanco@vivancar.cl' },
  { nombre: 'Samuel Sánchez', email: 'ssanchez@vivancar.cl' },
  { nombre: 'M. Carvajal',    email: 'mcarvajal@vivacar.cl' },
]

const DEFAULT_PASSWORD = 'Vivancar2025'

async function seed() {
  console.log('🌱 Creando usuarios...\n')
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)

  for (const u of USUARIOS) {
    await db
      .insert(schema.users)
      .values({ nombre: u.nombre, email: u.email, password_hash: hash })
      .onConflictDoNothing()
    console.log(`  ✓ ${u.email}`)
  }

  console.log(`\n🔑 Contraseña por defecto: ${DEFAULT_PASSWORD}`)
  console.log('⚠️  Cambia las contraseñas en producción.\n')
  process.exit(0)
}

seed().catch((e) => { console.error(e); process.exit(1) })
