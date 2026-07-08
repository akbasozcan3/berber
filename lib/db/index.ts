import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let sqlite: Database.Database | null = null;
let dbInstance: BetterSQLite3Database<typeof schema> | null = null;
let initialized = false;

function getSqlite() {
  if (!sqlite) {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, "newlife.db");
    sqlite = new Database(dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    sqlite.pragma("busy_timeout = 5000");
  }
  return sqlite;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getSqlite(), { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export function initDatabase() {
  if (initialized) return;
  const database = getSqlite();
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      position TEXT NOT NULL,
      avatar TEXT,
      specialty TEXT,
      working_days TEXT NOT NULL DEFAULT '1,2,3,4,5,6',
      working_start TEXT NOT NULL DEFAULT '09:00',
      working_end TEXT NOT NULL DEFAULT '22:00',
      on_vacation INTEGER NOT NULL DEFAULT 0,
      available INTEGER NOT NULL DEFAULT 1,
      performance INTEGER NOT NULL DEFAULT 95,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      popular INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS barber_services (
      barber_id INTEGER NOT NULL REFERENCES barbers(id),
      service_id INTEGER NOT NULL REFERENCES services(id),
      PRIMARY KEY (barber_id, service_id)
    );
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      visit_count INTEGER NOT NULL DEFAULT 0,
      total_spent REAL NOT NULL DEFAULT 0,
      last_visit TEXT,
      favorite_barber_id INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      service_id INTEGER NOT NULL REFERENCES services(id),
      barber_id INTEGER REFERENCES barbers(id),
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      review TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'website',
      featured INTEGER NOT NULL DEFAULT 0,
      approved INTEGER NOT NULL DEFAULT 0,
      replied INTEGER NOT NULL DEFAULT 0,
      reply TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS telegram_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER,
      chat_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      response TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS availability_blocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT 'Müsait değil',
      barber_id INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS availability_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_state TEXT,
      new_state TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      badge TEXT,
      cta_text TEXT NOT NULL DEFAULT 'Hemen Randevu Al',
      cta_link TEXT NOT NULL DEFAULT '/randevu',
      sort_order INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
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
  runMigrations(database);
  initialized = true;
}

function runMigrations(database: Database.Database) {
  const cols = database.prepare("PRAGMA table_info(availability_blocks)").all() as { name: string }[];
  const colNames = new Set(cols.map((c) => c.name));
  const addCol = (name: string, def: string) => {
    if (!colNames.has(name)) database.exec(`ALTER TABLE availability_blocks ADD COLUMN ${name} ${def}`);
  };
  addCol("end_date", "TEXT");
  addCol("rule_type", "TEXT NOT NULL DEFAULT 'block'");
  addCol("custom_open", "TEXT");
  addCol("custom_close", "TEXT");
  addCol("scope", "TEXT");
  addCol("active", "INTEGER NOT NULL DEFAULT 1");
  addCol("created_by", "TEXT");

  const reviewCols = database.prepare("PRAGMA table_info(reviews)").all() as { name: string }[];
  const reviewColNames = new Set(reviewCols.map((c) => c.name));
  if (!reviewColNames.has("customer_email")) {
    database.exec("ALTER TABLE reviews ADD COLUMN customer_email TEXT");
  }
}
