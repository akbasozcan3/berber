import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!process.env[key]) process.env[key] = value;
  }
}

let pool: Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

let initialized = false;
let initPromise: Promise<void> | null = null;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) loadLocalEnv();
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
    // Table creation is handled by Drizzle (db:migrate/db:setup).
    // This function only verifies connectivity once per process.
    const database = getPool();
    await database.query("select 1");

    initialized = true;
  })();

  return initPromise;
}
