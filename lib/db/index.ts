import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let pool: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

let initialized = false;
let initPromise: Promise<void> | null = null;

function getPool() {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_CONNECTION_STRING;
    if (!connectionString) {
      throw new Error(
        "PostgreSQL bağlantısı bulunamadı. Ortama en az `DATABASE_URL` ekleyin."
      );
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export async function initDatabase() {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const database = getPool();

    await database.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS barbers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        position TEXT NOT NULL,
        avatar TEXT,
        specialty TEXT,
        working_days TEXT NOT NULL DEFAULT '1,2,3,4,5,6',
        working_start TEXT NOT NULL DEFAULT '09:00',
        working_end TEXT NOT NULL DEFAULT '22:00',
        on_vacation BOOLEAN NOT NULL DEFAULT FALSE,
        available BOOLEAN NOT NULL DEFAULT TRUE,
        performance INTEGER NOT NULL DEFAULT 95,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        image TEXT,
        popular BOOLEAN NOT NULL DEFAULT FALSE,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS barber_services (
        barber_id INTEGER NOT NULL REFERENCES barbers(id),
        service_id INTEGER NOT NULL REFERENCES services(id),
        PRIMARY KEY (barber_id, service_id)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        visit_count INTEGER NOT NULL DEFAULT 0,
        total_spent DOUBLE PRECISION NOT NULL DEFAULT 0,
        last_visit TEXT,
        favorite_barber_id INTEGER,
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        service_id INTEGER NOT NULL REFERENCES services(id),
        barber_id INTEGER REFERENCES barbers(id),
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        rating INTEGER NOT NULL,
        review TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'website',
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        approved BOOLEAN NOT NULL DEFAULT FALSE,
        replied BOOLEAN NOT NULL DEFAULT FALSE,
        reply TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS gallery_images (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telegram_logs (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER,
        chat_id TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL,
        response TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS availability_blocks (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        end_date TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        rule_type TEXT NOT NULL DEFAULT 'block',
        custom_open TEXT,
        custom_close TEXT,
        scope TEXT,
        reason TEXT NOT NULL DEFAULT 'Müsait değil',
        barber_id INTEGER,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS availability_audit_log (
        id SERIAL PRIMARY KEY,
        admin_name TEXT NOT NULL,
        action TEXT NOT NULL,
        previous_state TEXT,
        new_state TEXT,
        reason TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hero_slides (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        badge TEXT,
        cta_text TEXT NOT NULL DEFAULT 'Hemen Randevu Al',
        cta_link TEXT NOT NULL DEFAULT '/randevu',
        sort_order INTEGER NOT NULL DEFAULT 0,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS page_content (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        hero_image TEXT,
        content TEXT NOT NULL,
        sections TEXT,
        meta TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_availability_date ON availability_blocks(date);
      CREATE INDEX IF NOT EXISTS idx_telegram_logs_created ON telegram_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON appointments(barber_id, date);
      CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
    `);

    initialized = true;
  })();

  return initPromise;
}
